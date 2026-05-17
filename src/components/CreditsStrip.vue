<script setup lang="ts">
const props = defineProps<{
  artistRoll: Array<[string, number]>
  modelValue: string
  matchingArtists: Set<string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function toggle(name: string) {
  const current = props.modelValue.toLowerCase()
  emit('update:modelValue', current === name.toLowerCase() ? '' : name)
}

function isActive(name: string) {
  return props.modelValue.toLowerCase() === name.toLowerCase()
}

function isDim(name: string) {
  // Dim chips whose artist has zero songs matching the current filter (artist OR title).
  return Boolean(props.modelValue) && !props.matchingArtists.has(name)
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="credits">
    <div class="credits__label">Artists</div>
    <ul class="credits__list">
      <li v-for="[name, n] in artistRoll" :key="name">
        <button
          type="button"
          class="credits__chip"
          :class="{ 'is-active': isActive(name), 'is-dim': isDim(name) }"
          @click="toggle(name)"
        >
          <span class="credits__chip-name">{{ name }}</span>
          <span class="credits__chip-num">{{ n }}</span>
        </button>
      </li>
    </ul>
    <div class="credits__search">
      <input
        type="search"
        placeholder="filter…"
        :value="modelValue"
        @input="onInput"
        aria-label="Filter setlist by artist or title"
      />
      <button
        v-if="modelValue"
        type="button"
        class="credits__clear"
        @click="emit('update:modelValue', '')"
        aria-label="Clear filter"
      >
        clear
      </button>
    </div>
  </div>
</template>

<style scoped>
.credits {
  position: relative;
  margin: 8px 0 28px;
  padding: 18px 20px 16px;
  background: rgba(240, 235, 225, 0.015);
  border: 1px solid var(--color-line);
  border-radius: 3px;
}
.credits__label {
  position: absolute;
  top: -8px;
  left: 16px;
  padding: 0 8px;
  background: var(--color-bg);
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.credits__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.credits__chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--color-line);
  color: var(--color-fg-soft);
  padding: 6px 10px;
  border-radius: 2px;
  font-family: var(--font-body);
  font-size: 12.5px;
  letter-spacing: 0.005em;
  cursor: pointer;
  transition: all 0.15s ease;
}
.credits__chip:hover {
  border-color: var(--color-line-brass-2);
  background: rgba(196, 115, 56, 0.06);
  color: var(--color-fg);
}
.credits__chip:focus-visible {
  outline: 2px solid var(--color-brass);
  outline-offset: 2px;
}
.credits__chip.is-active {
  border-color: var(--color-brass);
  background: rgba(196, 115, 56, 0.14);
  color: var(--color-brass-soft);
}
.credits__chip.is-dim {
  opacity: 0.45;
}
.credits__chip-num {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-muted);
  margin-left: 2px;
}
.credits__chip.is-active .credits__chip-num {
  color: var(--color-ember);
}

.credits__search {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-line);
  display: flex;
  align-items: center;
  gap: 8px;
}
.credits__search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--color-fg);
  font-family: var(--font-display);
  font-style: italic;
  /* 16px prevents iOS Safari's auto-zoom on focus */
  font-size: 16px;
  padding: 4px 0;
}
.credits__search input::placeholder {
  color: var(--color-muted-2);
}
.credits__clear {
  background: transparent;
  border: 0;
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}
.credits__clear:hover {
  color: var(--color-brass);
}

@media (hover: none) {
  .credits__chip {
    min-height: 44px;
  }
  .credits__clear {
    min-height: 44px;
    padding: 0 10px;
  }
  .credits__search input {
    min-height: 44px;
  }
}

@media (max-width: 420px) {
  .credits__list {
    gap: 4px;
  }
  .credits__chip {
    font-size: 11.5px;
    padding: 5px 8px;
  }
}
</style>
