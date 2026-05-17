<script setup lang="ts">
defineProps<{
  playlistUrl: string
  totalCount: number
  learningCount: number
}>()
</script>

<template>
  <header class="mast">
    <div class="mast__strip">
      <div class="mast__strip-right">
        <span>{{ totalCount }} tracks</span>
        <span class="mast__strip-bullet" aria-hidden="true">·</span>
        <span>{{ learningCount }} to work on</span>
      </div>
    </div>

    <div class="mast__main">
      <div class="mast__title-block">
        <h1 class="mast__title">
          <span class="mast__title-word">Band</span>
          <span class="mast__title-word mast__title-word--accent">Setlist</span>
        </h1>
        <p class="mast__lede">Modern soulful blues and rock.</p>
      </div>

      <aside class="mast__side">
        <a
          class="mast__cta"
          :href="playlistUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the full YouTube playlist in a new tab"
        >
          <span class="mast__cta-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
            </svg>
          </span>
          <span class="mast__cta-text">
            <span class="mast__cta-lede">The full playlist</span>
            <span class="mast__cta-sub">on YouTube ↗</span>
          </span>
        </a>
        <div class="mast__side-note">all {{ totalCount }} tracks · in order</div>
      </aside>
    </div>
  </header>
</template>

<style scoped>
.mast {
  padding-bottom: 56px;
}
.mast__strip {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.mast__strip-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.mast__strip-bullet {
  color: var(--color-muted-3);
}

.mast__main {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 56px;
  align-items: end;
}
.mast__title {
  margin: 0;
  font-family: var(--font-display);
  line-height: 0.92;
  letter-spacing: -0.035em;
  display: flex;
  align-items: baseline;
  gap: 0.16em;
  flex-wrap: wrap;
}
.mast__title-word {
  font-weight: 700;
  font-style: italic;
  font-size: clamp(70px, 12vw, 168px);
  color: var(--color-fg);
}
.mast__title-word--accent {
  font-style: normal;
  color: var(--color-brass);
  text-shadow: 0 0 40px rgba(196, 115, 56, 0.18);
}
.mast__lede {
  margin: 28px 0 0;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(17px, 1.4vw, 19px);
  color: var(--color-fg-soft);
  max-width: 56ch;
  line-height: 1.55;
}

.mast__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.mast__cta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 13px 18px 13px 14px;
  border-radius: 4px;
  background: linear-gradient(180deg, #d28144 0%, #b56229 100%);
  color: #1a1208;
  border: 1px solid var(--color-brass-soft);
  text-decoration: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 225, 190, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 6px 22px -10px rgba(196, 115, 56, 0.6);
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}
.mast__cta:hover {
  transform: translateY(-1px);
  background: linear-gradient(180deg, #dd9059 0%, #c47038 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 225, 190, 0.45),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 12px 30px -12px rgba(217, 154, 107, 0.65);
}
.mast__cta:focus-visible {
  outline: 2px solid var(--color-brass-soft);
  outline-offset: 3px;
}
.mast__cta-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1a1208;
  color: var(--color-brass-soft);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 225, 190, 0.18);
}
.mast__cta-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.mast__cta-lede {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(26, 18, 8, 0.7);
}
.mast__cta-sub {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 600;
  font-size: 17px;
}
.mast__side-note {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-muted);
  letter-spacing: 0.06em;
}

@media (max-width: 880px) {
  .mast__main {
    grid-template-columns: 1fr;
    gap: 28px;
    align-items: start;
  }
  .mast__side {
    align-items: stretch;
  }
  .mast__cta {
    justify-content: center;
  }
  .mast__side-note {
    text-align: center;
  }
}
@media (max-width: 720px) {
  .mast__strip {
    justify-content: flex-start;
    padding: 12px 0;
  }
  .mast__strip-right {
    justify-content: flex-start;
  }
}
</style>
