#!/usr/bin/env node
// Computes the target YouTube playlist order from src/data/songs.json,
// matching exactly how the site renders the "Full Setlist" section
// (see src/App.vue): set groups in ascending set-number order, each
// sorted by setPosition (nulls last, stable), then the "ideas" group
// in JSON array order. Songs without a youtubeUrl (e.g. SoundCloud
// originals) cannot live in a YouTube playlist and are reported as
// skipped rather than included.
//
// Usage:
//   node .claude/skills/youtube-playlist-sync/build-target.mjs          # human-readable
//   node .claude/skills/youtube-playlist-sync/build-target.mjs --json   # machine-readable

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const songsPath = resolve(here, '../../../src/data/songs.json')

const data = JSON.parse(readFileSync(songsPath, 'utf8'))
const songs = data.songs

function setNumber(category) {
  if (category === 'ideas') return null
  const n = parseInt(String(category).replace('set', ''), 10)
  return Number.isFinite(n) ? n : null
}

// Pull the 11-char video id out of any common YouTube URL shape.
function videoId(url) {
  if (!url) return null
  let m = url.match(/[?&]v=([\w-]{11})/)
  if (m) return m[1]
  m = url.match(/youtu\.be\/([\w-]{11})/)
  if (m) return m[1]
  m = url.match(/\/(?:embed|shorts)\/([\w-]{11})/)
  if (m) return m[1]
  return null
}

// Group order: each distinct set number ascending, then "ideas" last.
const setNumbers = [...new Set(songs.map((s) => setNumber(s.category)).filter((n) => n !== null))].sort(
  (a, b) => a - b,
)
const groupKeys = [...setNumbers.map((n) => `set${n}`), 'ideas']

const ordered = []
for (const key of groupKeys) {
  let items = songs.filter((s) => s.category === key)
  if (key !== 'ideas') {
    // Stable sort by setPosition, nulls last — same as the site.
    items = items
      .map((s, i) => [s, i])
      .sort(([a, ai], [b, bi]) => {
        const ap = a.setPosition ?? Number.POSITIVE_INFINITY
        const bp = b.setPosition ?? Number.POSITIVE_INFINITY
        return ap - bp || ai - bi
      })
      .map(([s]) => s)
  }
  ordered.push(...items)
}

const target = []
const skipped = []
for (const s of ordered) {
  const id = videoId(s.youtubeUrl)
  if (id) target.push({ videoId: id, artist: s.artist, title: s.title, category: s.category })
  else skipped.push({ id: s.id, artist: s.artist, title: s.title, reason: s.youtubeUrl ? 'unparseable youtubeUrl' : 'no youtubeUrl' })
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ playlistUrl: data.playlistUrl, target, skipped }, null, 2) + '\n')
} else {
  console.log(`Playlist URL (from songs.json): ${data.playlistUrl}`)
  console.log(`\nTarget order (${target.length} videos):`)
  target.forEach((t, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. [${t.videoId}] ${t.artist} — ${t.title}  (${t.category})`)
  })
  if (skipped.length) {
    console.log(`\nSkipped (${skipped.length}, no YouTube video — will NOT be in the playlist):`)
    skipped.forEach((s) => console.log(`  - ${s.artist} — ${s.title}  (${s.reason})`))
  }
}
