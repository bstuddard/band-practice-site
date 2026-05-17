export type Category = 'easy' | null

export type Stars = 1 | 2 | 3 | 4 | 5 | null

export interface Song {
  id: number
  artist: string
  title: string
  youtubeUrl: string
  audioUrl?: string
  imageUrl: string
  lyricsUrl: string
  guitarProUrl: string | null
  learningTier: 1 | 2 | null
  stars: Stars
  category: Category
  durationSeconds: number | null
}

export function isOriginalSong(song: Song): boolean {
  return song.artist === 'Original'
}
