<script setup lang="ts">
import { computed } from 'vue'
import { GUITAR_LABELS, isOriginalSong, type Song } from '../types'
import ActionLinks from './ActionLinks.vue'

const props = withDefaults(
  defineProps<{
    song: Song
    index: number
    totalDigits?: number
    delay?: number
    duration?: string
    showStars?: boolean
    showGuitar?: boolean
  }>(),
  {
    totalDigits: 2,
    delay: 0,
    duration: '',
    showStars: true,
    showGuitar: false,
  },
)

const num = computed(() => String(props.index + 1).padStart(props.totalDigits, '0'))
const isOriginal = computed(() => isOriginalSong(props.song))
const playUrl = computed(() =>
  isOriginal.value ? props.song.audioUrl ?? '' : props.song.youtubeUrl,
)
const playAria = computed(() =>
  isOriginal.value
    ? `Listen to ${props.song.artist} — ${props.song.title} on SoundCloud`
    : `Watch ${props.song.artist} — ${props.song.title} on YouTube`,
)
const guitarLabel = computed(() =>
  props.song.guitar ? GUITAR_LABELS[props.song.guitar] : null,
)
</script>

<template>
  <div
    class="row animate-row-in"
    :class="{ 'row--original': isOriginal }"
    :style="{ animationDelay: `${Math.min(delay * 24, 700)}ms` }"
  >
    <span class="row__num">{{ num }}</span>

    <a
      v-if="playUrl"
      class="row__art"
      :class="{ 'row__art--original': isOriginal }"
      :href="playUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="playAria"
    >
      <template v-if="!isOriginal">
        <img :src="song.imageUrl" alt="" loading="lazy" decoding="async" />
        <span class="row__art-frame" aria-hidden="true"></span>
      </template>
      <span v-else aria-hidden="true">★</span>
      <span class="row__art-play" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 24 24">
          <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
        </svg>
      </span>
    </a>
    <div v-else class="row__art row__art--original" aria-hidden="true">
      <span>★</span>
    </div>

    <span class="row__meta">
      <span class="row__artist">{{ song.artist }}</span>
      <span class="row__title">{{ song.title }}</span>
      <ul v-if="song.tags?.length" class="row__song-tags">
        <li v-for="tag in song.tags" :key="tag" class="row__song-tag">{{ tag }}</li>
      </ul>
    </span>

    <span class="row__tags">
      <template v-if="showStars">
        <span
          v-if="song.stars"
          class="row__stars"
          :aria-label="`Difficulty ${song.stars} of 5`"
          :title="`Difficulty ${song.stars}/5`"
        >
          <span
            v-for="n in 5"
            :key="n"
            class="row__star"
            :class="{ 'row__star--on': n <= song.stars }"
            aria-hidden="true"
          >★</span>
        </span>
        <span v-else class="row__stars row__stars--empty" aria-hidden="true">—</span>
      </template>
      <template v-else-if="showGuitar">
        <span
          v-if="guitarLabel"
          class="row__guitar"
          :title="`Guitar: ${guitarLabel}`"
        >{{ guitarLabel }}</span>
        <span v-else class="row__guitar row__guitar--empty" aria-hidden="true">—</span>
      </template>
      <span v-else class="row__stars row__stars--empty" aria-hidden="true"></span>

      <span
        v-if="song.key"
        class="row__key"
        :title="`Key: ${song.key}`"
      >{{ song.key }}</span>
      <span v-else class="row__key row__key--empty" aria-hidden="true">—</span>
    </span>

    <span class="row__duration" :title="isOriginal ? 'Approx. demo length' : 'Approx. recorded length'">
      {{ duration }}
    </span>

    <span class="row__actions">
      <ActionLinks :song="song" />
    </span>
  </div>
</template>

<style scoped>
.row {
  position: relative;
  display: grid;
  /* Fixed last column (actions) so the row grid matches the header grid exactly;
     auto-sized actions varied per-row and pushed the 1fr title column around. */
  grid-template-columns: 44px 56px 1fr 72px 96px 60px 220px;
  gap: 18px;
  align-items: center;
  padding: 10px 8px 10px 12px;
  border-bottom: 1px solid var(--color-line);
  color: var(--color-fg-soft);
  transition:
    background 0.18s ease,
    color 0.18s ease;
}
.row:last-child {
  border-bottom: 0;
}
.row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-brass);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.row:hover {
  background: rgba(196, 115, 56, 0.045);
  color: var(--color-fg);
}
.row:hover::before {
  transform: scaleY(1);
}

.row__num {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-muted-2);
  transition: color 0.15s ease;
}
.row:hover .row__num {
  color: var(--color-brass);
}

.row__art {
  position: relative;
  width: 56px;
  height: 56px;
  background: #0a0907;
  overflow: hidden;
  display: block;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.row__art:focus-visible {
  outline: 2px solid var(--color-brass-soft);
  outline-offset: 2px;
}
.row__art img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.62);
  filter: saturate(0.85) contrast(1.02) brightness(0.92);
  transition:
    transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1),
    filter 0.2s;
}
.row:hover .row__art img {
  transform: scale(1.7);
  filter: saturate(0.95) contrast(1.05) brightness(1);
}
.row__art-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 1px rgba(196, 115, 56, 0.22),
    inset 0 0 0 2px rgba(20, 14, 8, 0.6),
    inset 0 0 14px rgba(0, 0, 0, 0.35);
}
.row__art-play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-paper);
  background: rgba(10, 8, 6, 0.55);
  opacity: 0;
  transition: opacity 0.18s ease;
}
.row:hover .row__art-play {
  opacity: 1;
}
@media (hover: none) {
  /* Touch devices never trigger :hover — show the play overlay by default. */
  .row__art-play {
    opacity: 1;
  }
}

.row__art--original {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--color-surface-2), var(--color-surface));
  color: var(--color-brass-soft);
  font-size: 18px;
  cursor: default;
}
a.row__art--original {
  cursor: pointer;
}

.row__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.row__artist {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.row__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 19px;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: inherit;
  text-wrap: pretty;
}

.row__song-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 3px 0 0;
  padding: 0;
  list-style: none;
}
.row__song-tag {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted-2);
  border: 1px dashed var(--color-line);
  padding: 2px 6px;
  border-radius: 1px;
  line-height: 1;
}

.row__stars {
  display: inline-flex;
  gap: 1px;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--color-muted-3);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.row__star--on {
  color: var(--color-brass);
}
.row__stars--empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-muted-3);
  letter-spacing: 0.08em;
}

.row__guitar {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-brass);
  border: 1px solid var(--color-line-brass);
  padding: 3px 7px;
  border-radius: 1px;
  justify-self: start;
  line-height: 1;
}
.row__guitar--empty {
  color: var(--color-muted-3);
  border-color: transparent;
  padding: 0;
  letter-spacing: 0.08em;
}

.row__key {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--color-brass-soft);
  justify-self: start;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.row__key--empty {
  color: var(--color-muted-3);
  letter-spacing: 0.08em;
}

/* Desktop: tags wrapper is transparent — children flow into the row grid as separate cells. */
.row__tags {
  display: contents;
}

.row__duration {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
  transition: color 0.15s ease;
}
.row:hover .row__duration {
  color: var(--color-brass-soft);
}

.row__actions {
  cursor: default;
}

@media (max-width: 720px) {
  .row {
    /* 56px matches the hard-coded art width; was 52px and bled 4px into the title. */
    grid-template-columns: 36px 56px 1fr auto;
    grid-template-rows: auto auto auto;
    gap: 6px 14px;
    padding: 12px 8px;
  }
  .row__num { grid-column: 1; grid-row: 1; }
  .row__art { grid-column: 2; grid-row: 1; }
  .row__meta { grid-column: 3; grid-row: 1; }
  .row__duration {
    grid-column: 4;
    grid-row: 1;
    align-self: start;
    padding-top: 2px;
  }
  /* Row 2: tags sit below the image, spanning across to the duration edge. */
  .row__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    grid-column: 3 / -1;
    grid-row: 2;
    margin-top: 2px;
  }
  /* Row 3: actions span the full width. */
  .row__actions {
    grid-column: 1 / -1;
    grid-row: 3;
    padding-left: 2px;
    margin-top: 4px;
  }
  .row__title {
    font-size: 17px;
  }
}
</style>
