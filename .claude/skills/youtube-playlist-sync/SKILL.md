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

1. **A browser-automation tool must be available** in this Claude Code session
   (e.g. the Playwright MCP or chrome-devtools MCP server). If no such tool is
   present, stop and tell the user: this skill needs one to edit the playlist,
   and point them to `claude mcp add` for a browser MCP. Do **not** fall back to
   the YouTube Data API unless the user explicitly asks.
2. **The user must be signed in to YouTube** in that browser as the **owner** of
   the playlist. You cannot edit a playlist you don't own. If the browser opens
   to a signed-out state, ask the user to log in, then continue.

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

**5b. Add missing.** Use the playlist page's **"⋮ → Add videos"** dialog, switch
to the **"URL"** tab, and paste `https://www.youtube.com/watch?v=<videoId>` for
each missing video. (Alternatively, open each video and use **Save → check the
playlist**.) Adds land at the end — order is fixed in the next step.

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
user: how many added, removed, reordered, the skipped non-YouTube songs, and
whether the final order verified clean. If any video failed to add (e.g. private/
deleted/region-locked), call it out by title.

## Notes & gotchas

- Duplicate video IDs already in the playlist: remove the extras so each `target`
  video appears exactly once.
- "Watch Later" / auto-generated mixes are not editable — only normal playlists.
- This skill never pushes git changes. It edits the playlist on YouTube and (only
  if asked) `songs.json`'s `playlistUrl`.
