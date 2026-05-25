export type SetCategory = `set${number}`
export type Category = SetCategory | 'ideas'

export type Stars = 1 | 2 | 3 | 4 | 5 | null

export type Guitar = 'strat' | 'lp' | 'casino'

export interface Song {
  id: number
  artist: string
  title: string
  youtubeUrl: string
  audioUrl?: string
  imageUrl: string
  lyricsUrl: string
  learningTier: 1 | 2 | null
  stars: Stars
  category: Category
  guitar?: Guitar | null
  key: string | null
  setPosition: number | null
  durationSeconds: number | null
  tags?: string[]
}

export function isOriginalSong(song: Song): boolean {
  return song.artist === 'Original'
}

export function setNumber(c: Category): number | null {
  if (c === 'ideas') return null
  const n = parseInt(c.replace('set', ''), 10)
  return Number.isFinite(n) ? n : null
}

export const GUITAR_LABELS: Record<Guitar, string> = {
  strat: 'Strat',
  lp: 'LP',
  casino: 'Casino',
}
