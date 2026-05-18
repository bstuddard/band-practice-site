<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { GUITAR_LABELS, setNumber, type Song } from '../types'

const props = defineProps<{
  songs: Song[]
}>()

const emit = defineEmits<{
  (e: 'exit'): void
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('exit')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

interface StageGroup {
  key: string
  label: string
  items: Song[]
  seconds: number
}

const groups = computed<StageGroup[]>(() => {
  const byKey = new Map<string, { n: number; items: Song[] }>()
  for (const s of props.songs) {
    const n = setNumber(s.category)
    if (n === null) continue
    let bucket = byKey.get(s.category)
    if (!bucket) {
      bucket = { n, items: [] }
      byKey.set(s.category, bucket)
    }
    bucket.items.push(s)
  }
  const out: StageGroup[] = []
  for (const [k, { n, items }] of byKey.entries()) {
    items.sort((a, b) => {
      const ap = a.setPosition ?? Number.POSITIVE_INFINITY
      const bp = b.setPosition ?? Number.POSITIVE_INFINITY
      return ap - bp
    })
    const seconds = items.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
    out.push({ key: k, label: `Set ${n}`, items, seconds })
  }
  out.sort((a, b) => (byKey.get(a.key)?.n ?? 0) - (byKey.get(b.key)?.n ?? 0))
  return out
})

function formatTotal(seconds: number): string {
  if (seconds <= 0) return '—'
  const total = Math.round(seconds / 60)
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function guitarLabel(s: Song): string | null {
  return s.guitar ? GUITAR_LABELS[s.guitar] : null
}
</script>

<template>
  <div class="stage">
    <header class="stage__bar">
      <div class="stage__bar-title">Stage View</div>
      <button class="stage__exit" type="button" @click="emit('exit')" aria-label="Exit stage view">
        Exit ✕
      </button>
    </header>

    <main class="stage__main">
      <div v-if="groups.length === 0" class="stage__empty">
        No sets yet. Assign songs a <code>category</code> like <code>set1</code> to populate stage view.
      </div>

      <section v-for="g in groups" :key="g.key" class="stage__set">
        <div class="stage__set-head">
          <h2 class="stage__set-title">{{ g.label }}</h2>
          <div class="stage__set-meta">
            <span>{{ g.items.length }} tracks</span>
            <span class="stage__dot">·</span>
            <span>~{{ formatTotal(g.seconds) }}</span>
          </div>
        </div>

        <ol class="stage__list">
          <li v-for="s in g.items" :key="s.id" class="stage__item">
            <span class="stage__num">{{ s.setPosition ?? '—' }}</span>
            <div class="stage__body">
              <div class="stage__title-row">
                <span class="stage__title">{{ s.title }}</span>
                <span class="stage__artist">{{ s.artist }}</span>
              </div>
              <div class="stage__tags">
                <span v-if="s.key" class="stage__tag stage__tag--key">{{ s.key }}</span>
                <span v-if="guitarLabel(s)" class="stage__tag stage__tag--guitar">{{ guitarLabel(s) }}</span>
                <span v-if="s.durationSeconds" class="stage__tag stage__tag--time">{{ formatDuration(s.durationSeconds) }}</span>
              </div>
            </div>
          </li>
        </ol>
      </section>
    </main>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #07060a;
  color: #f3ead7;
  overflow-y: auto;
  font-family: var(--font-display);
}

.stage__bar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: rgba(7, 6, 10, 0.92);
  border-bottom: 1px solid rgba(196, 115, 56, 0.22);
  backdrop-filter: blur(8px);
}
.stage__bar-title {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(196, 115, 56, 0.85);
}
.stage__exit {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: transparent;
  color: #f3ead7;
  border: 1px solid rgba(196, 115, 56, 0.5);
  padding: 8px 14px;
  border-radius: 2px;
  cursor: pointer;
  min-height: 40px;
}
.stage__exit:hover,
.stage__exit:focus-visible {
  background: rgba(196, 115, 56, 0.12);
  border-color: rgba(196, 115, 56, 0.9);
  outline: none;
}

.stage__main {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 24px 80px;
}

.stage__empty {
  padding: 80px 20px;
  text-align: center;
  color: rgba(243, 234, 215, 0.55);
  font-style: italic;
}
.stage__empty code {
  font-family: var(--font-mono);
  background: rgba(196, 115, 56, 0.12);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 0.85em;
}

.stage__set {
  margin-bottom: 56px;
}
.stage__set-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px dashed rgba(196, 115, 56, 0.35);
  padding-bottom: 12px;
  margin-bottom: 18px;
  gap: 18px;
}
.stage__set-title {
  margin: 0;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 42px;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #f3ead7;
}
.stage__set-meta {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(196, 115, 56, 0.85);
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding-bottom: 6px;
}
.stage__dot {
  color: rgba(243, 234, 215, 0.4);
}

.stage__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stage__item {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 18px;
  padding: 18px 4px;
  border-bottom: 1px solid rgba(196, 115, 56, 0.14);
  align-items: center;
}
.stage__item:last-child {
  border-bottom: 0;
}

.stage__num {
  font-family: var(--font-mono);
  font-size: 42px;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: rgba(196, 115, 56, 0.95);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: right;
}

.stage__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.stage__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}
.stage__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 38px;
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: #f3ead7;
  text-wrap: pretty;
}
.stage__artist {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(243, 234, 215, 0.55);
}

.stage__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.stage__tag {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 2px;
  line-height: 1;
  border: 1px solid rgba(196, 115, 56, 0.45);
}
.stage__tag--key {
  color: #f3ead7;
  background: rgba(196, 115, 56, 0.16);
}
.stage__tag--guitar {
  color: rgba(196, 115, 56, 0.95);
}
.stage__tag--time {
  color: rgba(243, 234, 215, 0.7);
  border-color: rgba(243, 234, 215, 0.18);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .stage__bar {
    padding: 12px 16px;
  }
  .stage__main {
    padding: 20px 14px 60px;
  }
  .stage__set-title {
    font-size: 32px;
  }
  .stage__item {
    grid-template-columns: 48px 1fr;
    gap: 14px;
    padding: 14px 2px;
  }
  .stage__num {
    font-size: 30px;
  }
  .stage__title {
    font-size: 26px;
  }
  .stage__tag {
    font-size: 11px;
    padding: 4px 8px;
  }
}
</style>
