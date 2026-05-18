# Band Practice Site

A Vue 3 + Vite + Tailwind site that displays our setlist with YouTube, lyrics, and tab links.

Live: **https://bstuddard.github.io/band-practice-site/**

## Editing songs

All songs live in [`src/data/songs.json`](src/data/songs.json). Each entry:

```json
{
  "id": 1,
  "artist": "Stevie Ray Vaughan",
  "title": "Crossfire",
  "youtubeUrl": "https://www.youtube.com/watch?v=cwrcx7sJoow",
  "imageUrl": "https://img.youtube.com/vi/cwrcx7sJoow/hqdefault.jpg",
  "lyricsUrl": "https://genius.com/search?q=Stevie%20Ray%20Vaughan%20Crossfire",
  "learningTier": 1,
  "stars": 5,
  "category": "set1",
  "guitar": "strat",
  "key": "E",
  "durationSeconds": 249
}
```

- `category`: `set1`, `set2`, etc. for active setlists, or `ideas` for the backlog. Set numbers are picked up dynamically — add `set2` songs and a Set 2 section appears.
- `stars`: `1`–`5` difficulty rating, or `null` if unrated.
- `learningTier`: `1` (working this batch), `2` (on deck — next batch), or `null` (not currently learning). Tier 1 and Tier 2 songs appear in the **Currently Learning** / **Next Up** sections at the top.
- `guitar`: `strat`, `lp`, or `casino` — which guitar to play it on. Optional; mostly used to plan setlist instrument swaps.
- `key`: musical key as a string (e.g. `"F#m"`, `"G (open G tuning)"`, `"B (open G tuning, capo 4)"`), or `null` if unknown.
- `durationSeconds`: approximate recorded length, used for set time totals. `null` if unknown.
- `imageUrl` uses the YouTube thumbnail: `https://img.youtube.com/vi/<id>/hqdefault.jpg`.
- The **Tab** link in the row actions is built dynamically as an Ultimate Guitar search — no need to store it per song.
- Originals use `"artist": "Original"` and an `audioUrl` (SoundCloud) instead of `youtubeUrl`.
- Push to `main` and the site redeploys automatically.

## Local development

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run lint     # oxlint + eslint, both with --fix
```

## Deployment

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and publishes `dist/` to GitHub Pages. Pages source must be set to **GitHub Actions** in Settings → Pages.
