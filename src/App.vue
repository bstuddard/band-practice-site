<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import data from './data/songs.json'
import type { Category, Song } from './types'
import PlaylistHeader from './components/PlaylistHeader.vue'
import SongSection from './components/SongSection.vue'
import SongCard from './components/SongCard.vue'
import TrackRow from './components/TrackRow.vue'
import CreditsStrip from './components/CreditsStrip.vue'

const songs = data.songs as Song[]
const playlistUrl = data.playlistUrl
const totalDigits = String(songs.length).length
const indexById = new Map(songs.map((s, i) => [s.id, i]))

const setGroups: Array<{ key: Category; label: string }> = [
  { key: 'set1', label: 'Set 1' },
  { key: 'set2', label: 'Set 2' },
  { key: 'encore', label: 'Encore' },
  { key: 'rotation', label: 'Rotation' },
]

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

const filter = ref('')

onMounted(() => {
  try {
    filter.value = new URL(location.href).searchParams.get('q') || ''
  } catch {
    /* ignore */
  }
})

// Debounce URL writes so a keystroke spree doesn't burn through replaceState.
let urlTimer: ReturnType<typeof setTimeout> | undefined
watch(filter, (value) => {
  if (urlTimer) clearTimeout(urlTimer)
  urlTimer = setTimeout(() => {
    try {
      const url = new URL(location.href)
      if (value) url.searchParams.set('q', value)
      else url.searchParams.delete('q')
      history.replaceState(null, '', url.toString())
    } catch {
      /* ignore */
    }
  }, 250)
})

const tier1 = computed(() => songs.filter((s) => s.learningTier === 1))
const tier2 = computed(() => songs.filter((s) => s.learningTier === 2))
const learning = computed(() => [...tier1.value, ...tier2.value])

const artistRoll = computed<Array<[string, number]>>(() => {
  const counts = new Map<string, number>()
  for (const s of songs) {
    if (s.artist === 'Original') continue
    counts.set(s.artist, (counts.get(s.artist) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

const filtered = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return songs
  return songs.filter(
    (s) => s.artist.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
  )
})

// Artists with at least one song surviving the current filter — drives chip dimming.
const matchingArtists = computed(() => new Set(filtered.value.map((s) => s.artist)))

const filteredGroups = computed(() =>
  setGroups
    .map((g) => {
      const items = filtered.value.filter((s) => s.category === g.key)
      const seconds = items.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
      return { ...g, items, seconds }
    })
    .filter((g) => g.items.length > 0),
)

const totalSeconds = computed(() =>
  songs.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0),
)

const totalLabel = computed(() => formatTotal(totalSeconds.value))

function originalIndex(id: number) {
  return indexById.get(id) ?? 0
}
</script>

<template>
  <div class="container">
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
      :subtitle="`${songs.length} tracks · approx. ${totalLabel} total.`"
      :count="filtered.length"
    >
      <CreditsStrip
        v-model="filter"
        :artist-roll="artistRoll"
        :matching-artists="matchingArtists"
      />

      <div v-if="filtered.length === 0" class="empty">
        <span class="empty__mark">∅</span>
        Nothing matches “<em>{{ filter }}</em>”.
      </div>
      <template v-else>
        <div
          v-for="(group, gi) in filteredGroups"
          :key="group.key"
          class="setblock"
        >
          <div v-if="gi > 0 && group.key === 'set2'" class="intermission" aria-label="Set break">
            <span class="intermission__rule" aria-hidden="true"></span>
            <span class="intermission__label">Set Break</span>
            <span class="intermission__rule" aria-hidden="true"></span>
          </div>

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
              <span></span>
              <span>Time</span>
              <span>Links</span>
            </div>
            <TrackRow
              v-for="song in group.items"
              :key="song.id"
              :song="song"
              :index="originalIndex(song.id)"
              :delay="originalIndex(song.id)"
              :total-digits="totalDigits"
              :duration="formatDuration(song.durationSeconds)"
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
  grid-template-columns: 44px 56px 1fr auto 60px auto;
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

.intermission {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 6px 0 18px;
  color: var(--color-brass);
}
.intermission__rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-line-brass) 20%,
    var(--color-line-brass) 80%,
    transparent
  );
}
.intermission__label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
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
