<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import data from './data/songs.json'
import type { Song } from './types'
import { setNumber } from './types'
import PlaylistHeader from './components/PlaylistHeader.vue'
import SongSection from './components/SongSection.vue'
import SongCard from './components/SongCard.vue'
import TrackRow from './components/TrackRow.vue'
import CreditsStrip from './components/CreditsStrip.vue'
import StageView from './components/StageView.vue'

const songs = data.songs as Song[]
const playlistUrl = data.playlistUrl
const totalDigits = String(songs.length).length
const indexById = new Map(songs.map((s, i) => [s.id, i]))

interface SetGroup {
  key: string
  label: string
  showGuitar: boolean
  showStars: boolean
}

const setGroups = computed<SetGroup[]>(() => {
  const numbers = new Set<number>()
  for (const s of songs) {
    const n = setNumber(s.category)
    if (n !== null) numbers.add(n)
  }
  const sets: SetGroup[] = [...numbers]
    .sort((a, b) => a - b)
    .map((n) => ({
      key: `set${n}`,
      label: `Set ${n}`,
      showGuitar: true,
      showStars: false,
    }))
  sets.push({ key: 'ideas', label: 'Ideas', showGuitar: false, showStars: true })
  return sets
})

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatTotal(seconds: number): string {
  if (seconds <= 0) return '—'
  const total = Math.round(seconds / 60)
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

function readParams() {
  try {
    return new URL(location.href).searchParams
  } catch {
    return new URLSearchParams()
  }
}

const initial = readParams()
const filter = ref(initial.get('q') || '')
const tagFilter = ref(initial.get('tag') || '')
const starsFilter = ref<number | null>(parseInt(initial.get('stars') ?? '') || null)
const stageMode = ref(initial.get('stage') === '1')

// Debounce URL writes so a keystroke spree doesn't burn through replaceState.
let urlTimer: ReturnType<typeof setTimeout> | undefined
function syncUrl() {
  if (urlTimer) clearTimeout(urlTimer)
  urlTimer = setTimeout(() => {
    try {
      const url = new URL(location.href)
      if (filter.value) url.searchParams.set('q', filter.value)
      else url.searchParams.delete('q')
      if (tagFilter.value) url.searchParams.set('tag', tagFilter.value)
      else url.searchParams.delete('tag')
      if (starsFilter.value !== null) url.searchParams.set('stars', String(starsFilter.value))
      else url.searchParams.delete('stars')
      history.replaceState(null, '', url.toString())
    } catch {
      /* ignore */
    }
  }, 250)
}
watch(filter, syncUrl)
watch(tagFilter, syncUrl)
watch(starsFilter, syncUrl)

// Stage mode pushes a history entry on enter so the back button exits it.
// popstate keeps `stageMode` in sync with whatever the URL says.
function enterStage() {
  if (stageMode.value) return
  stageMode.value = true
  try {
    const url = new URL(location.href)
    url.searchParams.set('stage', '1')
    history.pushState({ stage: true }, '', url.toString())
  } catch {
    /* ignore */
  }
}
function exitStage() {
  if (!stageMode.value) return
  // Prefer back() so the pushed entry is unwound; popstate handler flips the flag.
  // Fall back to direct mutation if we're at the start of history.
  if (history.state && (history.state as { stage?: boolean }).stage) {
    history.back()
  } else {
    stageMode.value = false
    try {
      const url = new URL(location.href)
      url.searchParams.delete('stage')
      history.replaceState(null, '', url.toString())
    } catch {
      /* ignore */
    }
  }
}

function onPopState() {
  stageMode.value = readParams().get('stage') === '1'
}
onMounted(() => window.addEventListener('popstate', onPopState))
onUnmounted(() => window.removeEventListener('popstate', onPopState))

const tier1 = computed(() => songs.filter((s) => s.learningTier === 1))
const tier2 = computed(() => songs.filter((s) => s.learningTier === 2))
const learning = computed(() => [...tier1.value, ...tier2.value])

// "Setlist" = songs assigned to a Set. Ideas are a holding pen, not part of the setlist.
const setSongs = computed(() => songs.filter((s) => s.category !== 'ideas'))

const artistRoll = computed<Array<[string, number]>>(() => {
  const counts = new Map<string, number>()
  for (const s of songs) {
    if (s.artist === 'Original') continue
    counts.set(s.artist, (counts.get(s.artist) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

const allTags = computed<string[]>(() => {
  const tagSet = new Set<string>()
  for (const s of songs) {
    for (const t of s.tags ?? []) tagSet.add(t)
  }
  return [...tagSet].sort()
})

const filtered = computed(() => {
  const q = filter.value.trim().toLowerCase()
  const t = tagFilter.value.trim().toLowerCase()
  const st = starsFilter.value
  return songs.filter((s) => {
    const matchesText = !q || s.artist.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    const matchesTag = !t || (s.tags ?? []).some((tag) => tag.toLowerCase() === t)
    const matchesStars = st === null || s.stars === st
    return matchesText && matchesTag && matchesStars
  })
})

// Artists with at least one song surviving the current filter — drives chip dimming.
const matchingArtists = computed(() => new Set(filtered.value.map((s) => s.artist)))

// Tags with at least one song surviving the text filter — drives tag chip dimming.
const matchingTags = computed(() => {
  const q = filter.value.trim().toLowerCase()
  const textFiltered = !q
    ? songs
    : songs.filter((s) => s.artist.toLowerCase().includes(q) || s.title.toLowerCase().includes(q))
  return new Set(textFiltered.flatMap((s) => s.tags ?? []))
})

// Star ratings present in songs surviving the text+tag filter — drives star chip dimming.
const matchingStars = computed(() => {
  const q = filter.value.trim().toLowerCase()
  const t = tagFilter.value.trim().toLowerCase()
  const pre = songs.filter((s) => {
    const matchesText = !q || s.artist.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    const matchesTag = !t || (s.tags ?? []).some((tag) => tag.toLowerCase() === t)
    return matchesText && matchesTag
  })
  return new Set(pre.map((s) => s.stars).filter((st): st is number => st !== null))
})

const filteredGroups = computed(() =>
  setGroups.value
    .map((g) => {
      const items = filtered.value.filter((s) => s.category === g.key)
      // Sets play in setPosition order; Ideas keep their JSON array order.
      if (g.key !== 'ideas') {
        items.sort((a, b) => {
          const ap = a.setPosition ?? Number.POSITIVE_INFINITY
          const bp = b.setPosition ?? Number.POSITIVE_INFINITY
          return ap - bp
        })
      }
      const seconds = items.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
      return { ...g, items, seconds }
    })
    .filter((g) => g.items.length > 0),
)

const totalSeconds = computed(() =>
  setSongs.value.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0),
)

const totalLabel = computed(() => formatTotal(totalSeconds.value))

const filteredSetCount = computed(
  () => filtered.value.filter((s) => s.category !== 'ideas').length,
)

function originalIndex(id: number) {
  return indexById.get(id) ?? 0
}
</script>

<template>
  <StageView v-if="stageMode" :songs="songs" @exit="exitStage" />
  <div v-else class="container">
    <div class="topbar">
      <button
        class="topbar__stage"
        type="button"
        @click="enterStage"
        aria-label="Open stage view"
      >
        Stage View ▸
      </button>
    </div>
    <PlaylistHeader
      :playlist-url="playlistUrl"
      :total-count="songs.length"
      :learning-count="learning.length"
    />

    <SongSection
      v-if="tier1.length || tier2.length === 0"
      title="Currently Learning"
      :count="tier1.length"
      marked
    >
      <div v-if="tier1.length === 0" class="empty">
        <span class="empty__mark">— —</span>
        Nothing currently being learned.
      </div>
      <div v-else class="featured-grid">
        <SongCard
          v-for="(song, i) in tier1"
          :key="song.id"
          :song="song"
          :index="originalIndex(song.id)"
          :delay="i"
        />
      </div>
    </SongSection>

    <SongSection
      v-if="tier2.length"
      title="Next Up"
      :count="tier2.length"
      marked
    >
      <div class="featured-grid">
        <SongCard
          v-for="(song, i) in tier2"
          :key="song.id"
          :song="song"
          :index="originalIndex(song.id)"
          :delay="i"
        />
      </div>
    </SongSection>

    <hr class="rule" aria-hidden="true" />

    <SongSection
      title="The Full Setlist"
      :subtitle="`${setSongs.length} tracks · approx. ${totalLabel} total.`"
      :count="filteredSetCount"
    >
      <CreditsStrip
        v-model=”filter”
        v-model:tag-filter=”tagFilter”
        v-model:stars-filter=”starsFilter”
        :artist-roll=”artistRoll”
        :matching-artists=”matchingArtists”
        :all-tags=”allTags”
        :matching-tags=”matchingTags”
        :matching-stars=”matchingStars”
      />

      <div v-if=”filtered.length === 0” class=”empty”>
        <span class=”empty__mark”>∅</span>
        Nothing matches<template v-if=”filter”> “<em>{{ filter }}</em>”</template><template v-if=”filter && tagFilter”> +</template><template v-if=”tagFilter”> tag “<em>{{ tagFilter }}</em>”</template>.
      </div>
      <template v-else>
        <div
          v-for="group in filteredGroups"
          :key="group.key"
          class="setblock"
        >
          <div class="setblock__head">
            <div class="setblock__head-left">
              <h3 class="setblock__title">{{ group.label }}</h3>
            </div>
            <div class="setblock__meta">
              <span class="setblock__count">{{ group.items.length }} {{ group.items.length === 1 ? 'track' : 'tracks' }}</span>
              <span class="setblock__dot" aria-hidden="true">·</span>
              <span class="setblock__time">~{{ formatTotal(group.seconds) }}</span>
            </div>
          </div>

          <div class="tracklist">
            <div class="tracklist__head" aria-hidden="true">
              <span>№</span>
              <span></span>
              <span>Artist / Title</span>
              <span>{{ group.showStars ? 'Diff' : 'Guitar' }}</span>
              <span>Key</span>
              <span>Time</span>
              <span>Links</span>
            </div>
            <TrackRow
              v-for="(song, i) in group.items"
              :key="song.id"
              :song="song"
              :index="originalIndex(song.id)"
              :delay="i"
              :total-digits="totalDigits"
              :duration="formatDuration(song.durationSeconds)"
              :show-stars="group.showStars"
              :show-guitar="group.showGuitar"
            />
          </div>
        </div>
      </template>
    </SongSection>

    <footer class="footer">
      <hr class="rule" aria-hidden="true" />
      <div class="footer__cols">
        <div class="footer__brand">
          <div class="footer__brand-name">Band Set List</div>
        </div>
        <div class="footer__meta">
          <span>data lives in <code>src/data/songs.json</code></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  z-index: 2;
  max-width: 1240px;
  margin: 0 auto;
  padding: 36px 32px 80px;
}

.topbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
}
.topbar__stage {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  background: transparent;
  color: var(--color-brass);
  border: 1px solid var(--color-line-brass);
  padding: 8px 14px;
  border-radius: 2px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  min-height: 40px;
}
.topbar__stage:hover,
.topbar__stage:focus-visible {
  background: rgba(196, 115, 56, 0.08);
  color: var(--color-ember);
  border-color: var(--color-brass);
  outline: none;
}

.rule {
  border: 0;
  height: 1px;
  background: var(--color-line);
  margin: 56px 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 26px;
}

.tracklist {
  background: linear-gradient(180deg, transparent, rgba(255, 240, 220, 0.012));
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}
.tracklist__head {
  display: grid;
  grid-template-columns: 44px 56px 1fr 72px 96px 60px 220px;
  gap: 18px;
  align-items: center;
  padding: 10px 8px 10px 12px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted-2);
  border-bottom: 1px solid var(--color-line);
}

.setblock {
  margin-bottom: 36px;
}
.setblock:last-child {
  margin-bottom: 0;
}
.setblock__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin: 22px 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--color-line);
}
.setblock__head-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.setblock__title {
  margin: 0;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 26px;
  letter-spacing: -0.015em;
  line-height: 1;
  color: var(--color-fg);
}
.setblock__meta {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
  padding-bottom: 4px;
}
.setblock__time {
  color: var(--color-brass-soft);
}
.setblock__dot {
  color: var(--color-muted-2);
}

.empty {
  padding: 40px 28px;
  text-align: center;
  color: var(--color-muted);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 17px;
  border: 1px dashed var(--color-line);
  background: rgba(240, 235, 225, 0.012);
}
.empty__mark {
  display: block;
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: var(--color-brass);
  margin-bottom: 8px;
}

.footer {
  margin-top: 64px;
}
.footer__cols {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}
.footer__brand-name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 22px;
  color: var(--color-fg);
}
.footer__meta {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-muted);
  letter-spacing: 0.06em;
  display: flex;
  gap: 8px;
  align-items: center;
}
.footer__meta code {
  color: var(--color-brass-soft);
  background: rgba(196, 115, 56, 0.07);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-family: var(--font-mono);
}

@media (max-width: 720px) {
  .container {
    padding: 24px 18px 60px;
  }
  .featured-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 18px;
  }
  .tracklist__head {
    display: none;
  }
}
@media (max-width: 420px) {
  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
