export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  audioSrc: string;
  duration: string;
  artistId?: string;
}

export const songs: Song[] = [];
