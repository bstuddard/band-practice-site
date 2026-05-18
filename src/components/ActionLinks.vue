<script setup lang="ts">
import { computed } from 'vue'
import { isOriginalSong, type Song } from '../types'

const props = defineProps<{
  song: Song
}>()

const isOriginal = computed(() => isOriginalSong(props.song))
const playUrl = computed(() =>
  isOriginal.value ? props.song.audioUrl ?? '' : props.song.youtubeUrl,
)
const playLabel = computed(() => (isOriginal.value ? 'Listen' : 'Watch'))
const playAria = computed(() =>
  isOriginal.value
    ? `Listen to ${props.song.artist} — ${props.song.title} on SoundCloud`
    : `Watch ${props.song.artist} — ${props.song.title} on YouTube`,
)
const tabUrl = computed(() => {
  if (isOriginal.value) return ''
  const query = `${props.song.title} ${props.song.artist}`.replace(/\s+/g, '+')
  return `https://www.ultimate-guitar.com/search.php?search_type=title&value=${query}`
})
</script>

<template>
  <span class="actions">
    <a
      v-if="playUrl"
      class="actions__link actions__link--primary"
      :href="playUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="playAria"
    >
      <svg width="9" height="9" viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
      </svg>
      {{ playLabel }}
    </a>
    <span v-if="playUrl && song.lyricsUrl" class="actions__sep" aria-hidden="true">·</span>
    <a
      v-if="song.lyricsUrl"
      class="actions__link"
      :href="song.lyricsUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Lyrics for ${song.artist} — ${song.title}`"
    >
      Lyrics
    </a>
    <template v-if="tabUrl">
      <span
        v-if="playUrl || song.lyricsUrl"
        class="actions__sep"
        aria-hidden="true"
      >·</span>
      <a
        class="actions__link"
        :href="tabUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Search Ultimate Guitar for ${song.artist} — ${song.title}`"
      >
        Tab
      </a>
    </template>
  </span>
</template>

<style scoped>
.actions {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.actions__link {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
  padding: 4px 0;
  border-bottom: 1px solid transparent;
  text-decoration: none;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}
.actions__link:hover {
  color: var(--color-ember);
  border-bottom-color: var(--color-brass-dim);
}
.actions__link:focus-visible {
  outline: none;
  color: var(--color-ember);
  border-bottom-color: var(--color-brass);
}
.actions__link--primary {
  color: var(--color-brass-soft);
}
.actions__link--primary:hover,
.actions__link--primary:focus-visible {
  color: var(--color-ember);
  border-bottom-color: var(--color-brass);
}
.actions__sep {
  color: var(--color-muted-3);
  font-family: var(--font-mono);
  font-size: 11px;
}

@media (hover: none) {
  .actions {
    gap: 14px;
  }
  .actions__link {
    min-height: 44px;
    align-items: center;
    padding: 0 4px;
  }
}
</style>
