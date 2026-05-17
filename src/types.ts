export type Category = 'set1' | 'set2' | 'encore' | 'rotation'

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
  category: Category
  durationSeconds: number | null
}

export function isOriginalSong(song: Song): boolean {
  return song.artist === 'Original'
}
