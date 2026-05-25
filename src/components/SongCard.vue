<script setup lang="ts">
import { computed } from 'vue'
import { GUITAR_LABELS, isOriginalSong, type Song } from '../types'
import ActionLinks from './ActionLinks.vue'

const props = withDefaults(
  defineProps<{
    song: Song
    index?: number
    delay?: number
  }>(),
  { index: 0, delay: 0 },
)

const num = computed(() => String(props.index + 1).padStart(2, '0'))
const isOriginal = computed(() => isOriginalSong(props.song))
const playUrl = computed(() =>
  isOriginal.value ? props.song.audioUrl ?? '' : props.song.youtubeUrl,
)
const playAria = computed(() =>
  isOriginal.value
    ? `Listen to ${props.song.artist} — ${props.song.title} on SoundCloud`
    : `Watch ${props.song.artist} — ${props.song.title} on YouTube`,
)
const markLabel = computed(() => {
  if (isOriginal.value) return 'Original — Demo'
  if (props.song.learningTier === 2) return 'Tier 2'
  return 'Tier 1'
})
const guitarLabel = computed(() =>
  props.song.guitar ? GUITAR_LABELS[props.song.guitar] : null,
)
</script>

<template>
  <article class="feature animate-fade-in" :style="{ animationDelay: `${delay * 80}ms` }">
    <component
      :is="playUrl ? 'a' : 'div'"
      v-bind="
        playUrl
          ? { href: playUrl, target: '_blank', rel: 'noopener noreferrer' }
          : {}
      "
      :aria-label="playUrl ? playAria : undefined"
      class="feature__art"
    >
      <div v-if="isOriginal" class="feature__art-placeholder">
        <span class="feature__art-placeholder-glyph">★</span>
        <span class="feature__art-placeholder-label">Original</span>
      </div>
      <img
        v-else
        :src="song.imageUrl"
        :alt="`${song.artist} — ${song.title}`"
        loading="lazy"
        decoding="async"
        class="feature__art-img"
      />
      <div class="feature__art-frame" aria-hidden="true"></div>
      <span class="feature__art-num">№ {{ num }}</span>
      <span v-if="playUrl" class="feature__art-play" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
        </svg>
      </span>
    </component>

    <div class="feature__body">
      <div class="feature__markrow">
        <div class="feature__mark" :class="{ 'feature__mark--original': isOriginal }">
          <span class="feature__mark-dot" aria-hidden="true"></span>
          <span>{{ markLabel }}</span>
        </div>
        <div class="feature__markrow-right">
          <span
            v-if="song.key"
            class="feature__key"
            :title="`Key: ${song.key}`"
          >{{ song.key }}</span>
          <span
            v-if="guitarLabel"
            class="feature__guitar"
            :title="`Guitar: ${guitarLabel}`"
          >{{ guitarLabel }}</span>
          <span
            v-for="tag in (song.tags ?? [])"
            :key="tag"
            class="feature__tag"
          >{{ tag }}</span>
          <span
            v-if="song.stars"
            class="feature__stars"
            :aria-label="`Difficulty ${song.stars} of 5`"
            :title="`Difficulty ${song.stars}/5`"
          >
            <span
              v-for="n in 5"
              :key="n"
              class="feature__star"
              :class="{ 'feature__star--on': n <= song.stars }"
              aria-hidden="true"
            >★</span>
          </span>
        </div>
      </div>
      <p class="feature__artist">{{ song.artist }}</p>
      <h3 class="feature__title">{{ song.title }}</h3>
      <ActionLinks v-if="!isOriginal || playUrl" :song="song" />
    </div>
  </article>
</template>

<style scoped>
.feature {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 3px;
  background: var(--color-surface-warm);
  border: 1px solid var(--color-line-brass);
  box-shadow:
    0 1px 0 rgba(255, 225, 190, 0.05) inset,
    0 18px 34px -22px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1),
    border-color 0.25s,
    box-shadow 0.25s;
}
.feature:hover {
  transform: translateY(-3px);
  border-color: var(--color-line-brass-2);
  box-shadow:
    0 1px 0 rgba(255, 225, 190, 0.07) inset,
    0 32px 50px -22px rgba(0, 0, 0, 0.85);
}

.feature__art {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #0a0907;
  text-decoration: none;
}
.feature__art[href] {
  cursor: pointer;
}
.feature__art[href]:focus-visible {
  outline: 2px solid var(--color-brass-soft);
  outline-offset: -4px;
}

.feature__art-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.62);
  filter: saturate(0.9) contrast(1.02) brightness(0.96);
  transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.feature:hover .feature__art-img {
  transform: scale(1.7);
}

.feature__art-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--color-surface-2), var(--color-surface));
  text-align: center;
}
.feature__art-placeholder-glyph {
  font-size: 36px;
  color: var(--color-brass);
  line-height: 1;
}
.feature__art-placeholder-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-brass-soft);
}

.feature__art-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 1px rgba(196, 115, 56, 0.32),
    inset 0 0 0 2px rgba(20, 14, 8, 0.7),
    inset 0 0 60px rgba(0, 0, 0, 0.45),
    inset 0 -50px 80px -30px rgba(0, 0, 0, 0.55);
}

.feature__art-num {
  position: absolute;
  top: 12px;
  left: 14px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  color: rgba(240, 235, 225, 0.7);
  background: rgba(10, 8, 6, 0.55);
  padding: 4px 8px;
  border: 1px solid rgba(240, 235, 225, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
@media (max-width: 720px) {
  /* Blur stutters on lower-end Android with 30+ cards scrolling. */
  .feature__art-num {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(10, 8, 6, 0.78);
  }
}

.feature__art-play {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brass);
  color: #1a1208;
  border: 1px solid var(--color-brass-soft);
  box-shadow:
    inset 0 1px 0 rgba(255, 225, 190, 0.3),
    0 8px 20px -6px rgba(196, 115, 56, 0.6);
  opacity: 0;
  transform: translateY(6px) scale(0.94);
  transition:
    opacity 0.2s,
    transform 0.25s;
}
.feature:hover .feature__art-play {
  opacity: 1;
  transform: translateY(0) scale(1);
}
@media (hover: none) {
  /* Touch devices never trigger :hover — show the play disc by default. */
  .feature__art-play {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.feature__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  padding: 18px 18px 20px;
}

.feature__markrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.feature__markrow-right {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.feature__guitar {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-brass);
  border: 1px solid var(--color-line-brass);
  padding: 3px 7px;
  border-radius: 1px;
  line-height: 1;
}
.feature__key {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: var(--color-brass-soft);
  border: 1px dashed var(--color-line-brass);
  padding: 3px 7px;
  border-radius: 1px;
  line-height: 1;
}
.feature__stars {
  display: inline-flex;
  gap: 1px;
  font-size: 12px;
  line-height: 1;
  color: var(--color-muted-3);
}
.feature__star--on {
  color: var(--color-brass);
}

.feature__mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-brass);
}
.feature__mark--original {
  color: var(--color-muted);
}
.feature__mark-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px rgba(196, 115, 56, 0.7);
}
.feature__mark--original .feature__mark-dot {
  box-shadow: none;
}

.feature__tag {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
  border: 1px dashed var(--color-line);
  padding: 3px 7px;
  border-radius: 1px;
  line-height: 1;
}

.feature__artist {
  margin: -4px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.feature__title {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 26px;
  letter-spacing: -0.015em;
  line-height: 1.1;
  color: var(--color-fg);
  text-wrap: pretty;
}
</style>
