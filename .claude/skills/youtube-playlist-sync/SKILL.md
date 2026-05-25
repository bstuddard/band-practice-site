---
name: youtube-playlist-sync
description: Sync a YouTube playlist to match src/data/songs.json — same videos, same order as the band-practice site. Use when the user wants to update/rebuild their YouTube playlist from the songs data, mentions "sync the playlist", "match the playlist to the site", or asks to reorder/clean up the band playlist.
---

# YouTube Playlist Sync

Make a YouTube playlist exactly mirror `src/data/songs.json`: the same set of
videos, in the same order the site shows them, by driving a real logged-in
browser session. This is a **full two-way sync** — add missing videos, remove
videos that aren't in the JSON, and reorder everything to match.

## Prerequisites — check these first

This skill drives a **real, logged-in Chrome window** so it reuses the user's
existing YouTube login (no OAuth, no app setup). The recommended engine is the
**Chrome DevTools MCP** server attached to a Chrome started with remote
debugging, because it connects to a browser the user already owns and is signed
in to.

If a browser-automation MCP tool is **not** available in this session, walk the
user through this one-time setup, then continue:

**1. Install the Chrome DevTools MCP server (one time):**

```sh
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

The `--browser-url` flag tells it to attach to an already-running Chrome rather
than launching its own throwaway browser — that's what preserves the YouTube
login.

**2. Launch Chrome with remote debugging + a persistent profile, then log in to
YouTube** (the user runs this; keep the window open while the skill works):

```sh
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-yt-sync"

# Linux
google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-yt-sync"

# Windows (PowerShell)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 --user-data-dir="$env:USERPROFILE\.chrome-yt-sync"
```

In that window, go to youtube.com and sign in as the **owner** of the playlist.
(First run uses a fresh profile, so a login is expected; the `--user-data-dir`
makes it stick for next time.)

**3. Restart Claude Code** if it was running when you added the MCP server, so it
picks up the new tools, and approve the MCP tools when prompted.

**Gotchas to surface if setup fails:**
- Chrome must already be running with `--remote-debugging-port=9222` *before* the
  skill tries to use the browser; the port is local-only.
- Only one Chrome instance can use a given `--user-data-dir` at a time — close
  other Chrome windows using that profile first.
- Requires Node/`npx` on PATH. Chrome 136+ requires the `--user-data-dir` flag
  alongside remote debugging.

**Fallback engine (Playwright MCP):** if the user prefers Playwright, install with
`claude mcp add playwright -- npx @playwright/mcp@latest --user-data-dir="$HOME/.pw-yt-sync"`
and have them log in to YouTube the first time the Playwright browser opens; the
profile persists. The sync steps below work the same either way.

Do **not** fall back to the YouTube Data API unless the user explicitly asks.

**Always confirm the user is signed in to YouTube** as the playlist **owner**
before editing — you cannot modify a playlist you don't own. If the browser is
signed out, ask them to log in, then continue.

## Step 1 — Build the target order (do this before touching the browser)

Run the helper, which reads `src/data/songs.json` and prints the exact target:

```sh
node .claude/skills/youtube-playlist-sync/build-target.mjs --json
```

It outputs `{ playlistUrl, target[], skipped[] }` where:
- `target` is the ordered list of `{ videoId, artist, title, category }`. This
  ordering already matches the site's "Full Setlist" section: set groups in
  ascending set number, each sorted by `setPosition` (nulls last), then `ideas`
  in JSON array order. **Treat this list as the source of truth — do not
  re-derive or re-sort it yourself.**
- `skipped` lists songs with no YouTube video (e.g. SoundCloud originals). These
  cannot be in a YouTube playlist. Mention them to the user so they know.

## Step 2 — Confirm the playlist URL

Ask the user which playlist to sync. Default to the `playlistUrl` printed above
(the one in `songs.json`). If they give a different URL, use it, and ask whether
they'd also like `songs.json`'s `playlistUrl` updated to match (only edit the
file if they say yes).

## Step 3 — Read the current playlist

Open the playlist URL in the browser. Scroll to load **all** items (YouTube lazy-
loads long playlists — keep scrolling until the count stops growing). Record the
current videos as an ordered list of video IDs. Each video ID appears in the
item's watch link (`watch?v=<id>`).

## Step 4 — Diff

Compare current vs `target` by video ID:
- **To remove**: IDs present in the playlist but not in `target`.
- **To add**: IDs in `target` but not in the playlist.
- **To reorder**: everything else.

Show the user a short summary (counts + the specific add/remove titles) and get
a quick confirmation before making changes, since removals are destructive.

## Step 5 — Apply changes (in this order)

**5a. Remove extras.** For each video to remove: open its 3-dot "⋮" action menu
in the playlist and choose **"Remove from <playlist name>"**.

**5b. Add missing.** Prefer the **watch-page Save** method — it's the reliable one.
For each missing video, navigate to `https://www.youtube.com/watch?v=<videoId>`,
click the **"Save to playlist"** button, and click the **"Band Idea"** (target
playlist) entry in the **"Save to…"** dialog. Adds land at the end — order is
fixed in the next step.

Two gotchas, both learned the hard way:
- **Click the playlist entry exactly once.** YouTube's current "Save to…" dialog
  uses button elements that **append a copy on every click** and do **not**
  reliably expose their checked state (`aria-pressed` stays `false`). Do not
  click twice "to be sure" — that creates a duplicate. Verify adds by reading the
  playlist itself (see scoping note below), never by the dialog's button state.
- The playlist page's **"Add videos" picker is unreliable**: pasting a watch URL
  into its search box is treated as a text search ("No matching results") rather
  than resolving the video. Skip it; use the watch-page Save flow.

**5b-i. Unavailable / dead videos → find a replacement and fix `songs.json`.**
A video can be deleted, privated, or region-locked; its watch page shows
*"This video isn't available anymore"* (and it has no Save button). When that
happens for a video in `target`:
1. Search YouTube for the same song (`<artist> <title> official`) and pick the
   best **available** upload — prefer the official artist/topic channel and the
   studio version, matching the canonical-upload style of the other tracks.
   Confirm the candidate actually plays (its watch page loads with a title, not
   the unavailable message).
2. **Update `src/data/songs.json`**: replace that song's `youtubeUrl` video ID
   **and** the `imageUrl` thumbnail ID with the replacement's ID.
3. Re-run `build-target.mjs` so `target` reflects the new ID, then add the
   replacement via the watch-page Save flow.
Mention each replacement to the user (old → new, with the reason).

**5c. Reorder to match `target`.** Use only the **"Move to top"** menu action so
you never depend on flaky drag-and-drop:

> Walk `target` from **last to first**. For each video, open its "⋮" menu and
> click **"Move to top"**. After processing the whole list in reverse, the
> playlist is in exact `target` order (the last one you move-to-top is
> `target[0]`, so it ends up on top, and so on).

Re-read the playlist after each move if the UI re-renders; match videos by ID,
not by on-screen position. Go gently — pause between actions so the YouTube UI
keeps up and to avoid tripping rate limits.

## Step 6 — Verify

Reload the playlist, scroll to load everything, read the final ID order, and
confirm it equals `target` (same length, same IDs, same sequence). Report to the
user: how many added, removed, reordered, the skipped non-YouTube songs, any
**replacements** made for unavailable videos (old → new ID, and that `songs.json`
was updated), and whether the final order verified clean. If any video still
failed to add, call it out by title.

## Notes & gotchas

- **Scope reads to the real playlist list.** On a playlist you own, YouTube
  appends an auto-generated "suggested videos" section using the *same*
  `ytd-playlist-video-renderer` element, which inflates a naive count. Read only
  the actual items via `ytd-playlist-video-list-renderer #contents > ytd-playlist-video-renderer`
  (and pull each video ID from the title link's `watch?v=`). Use this scoped read
  for the current order, the diff, duplicate detection, and final verification.
- **Driving menus reliably.** The per-item "⋮" actions (Remove from…, Move to
  top) work well when you find the item's renderer by video ID inside the scoped
  list, click its action-menu button, wait for the popup
  (`ytd-menu-popup-renderer ytd-menu-service-item-renderer`), and click the
  matching label. Re-query by ID each time — the list re-renders after every move.
  You can run several move-to-top operations in one script pass (target order
  reversed); each correctly lands at index 0.
- Duplicate video IDs already in the playlist: remove the extras so each `target`
  video appears exactly once.
- "Watch Later" / auto-generated mixes are not editable — only normal playlists.
- This skill never pushes git changes. It edits the playlist on YouTube, updates
  `songs.json` when a video needs a replacement (Step 5b-i), and edits
  `songs.json`'s `playlistUrl` only if asked (Step 2).
