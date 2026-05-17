<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    count: number
    marked?: boolean
  }>(),
  { marked: false },
)
</script>

<template>
  <section class="section" :class="{ 'section--marked': marked }">
    <header class="section__head">
      <div class="section__head-left">
        <h2 class="section__title">{{ title }}</h2>
        <div v-if="subtitle" class="section__subtitle">{{ subtitle }}</div>
      </div>
      <div class="section__count">
        <span class="section__count-num">{{ count }}</span>
        <span class="section__count-label">{{ count === 1 ? 'track' : 'tracks' }}</span>
      </div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.section {
  position: relative;
}
.section--marked {
  padding: 28px 28px 36px;
  margin: 0 -28px 56px;
  background:
    linear-gradient(180deg, rgba(196, 115, 56, 0.045) 0%, transparent 70%),
    linear-gradient(180deg, rgba(255, 240, 220, 0.018), transparent 50%);
  border-top: 1px solid var(--color-line-brass);
  border-bottom: 1px solid var(--color-line);
  border-radius: 2px;
}
.section--marked::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    var(--color-brass) 0%,
    var(--color-brass) 38%,
    var(--color-brass-deep) 60%,
    transparent 100%
  );
}

.section__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  margin-bottom: 22px;
}
.section__head-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.section__title {
  margin: 0;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(34px, 4.4vw, 54px);
  letter-spacing: -0.025em;
  line-height: 1;
  color: var(--color-fg);
}
.section__subtitle {
  margin-top: 18px;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-muted);
  font-size: 15px;
  max-width: 60ch;
}
.section__count {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--font-mono);
  color: var(--color-muted);
  padding-bottom: 8px;
}
.section__count-num {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-fg);
  font-size: 28px;
  line-height: 1;
}
.section__count-label {
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .section--marked {
    padding: 24px 18px 30px;
    margin: 0 -18px 40px;
  }
  .section__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  /* Left-align under the title rather than orphaning to the right. */
  .section__count {
    align-self: flex-start;
  }
}
</style>
