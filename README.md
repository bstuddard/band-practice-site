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
  "guitarProUrl": null,
  "learningTier": null,
  "category": "set1"
}
```

- `category`: `set1`, `set2`, `encore`, or `rotation`.
- `learningTier`: `1` (working this batch), `2` (on deck — next batch), or `null` (not currently learning). Tier 1 and Tier 2 songs appear in the **Currently Learning** section at the top.
- `imageUrl` uses the YouTube thumbnail: `https://img.youtube.com/vi/<id>/hqdefault.jpg`.
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
