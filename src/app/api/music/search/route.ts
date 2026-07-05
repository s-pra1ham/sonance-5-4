/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
    }

    const apiUrl = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co/api';
    const res = await fetch(`${apiUrl}/search/songs?query=${encodeURIComponent(query)}`);

    if (!res.ok) {
      throw new Error(`External API responded with status ${res.status}`);
    }

    const payload = await res.json();
    const rawSongs = payload.data?.results || payload.data || [];

    // Map raw JioSaavn songs to our internal Song interface
    const songs = rawSongs.map((song: any) => {
      // 1. Get Cover
      let cover = '/cover-placeholder.png';
      if (Array.isArray(song.image)) {
        cover = song.image.find((img: any) => img.quality === '500x500')?.link || 
                song.image.find((img: any) => img.quality === '500x500')?.url || 
                song.image[song.image.length - 1]?.link || 
                song.image[song.image.length - 1]?.url || 
                cover;
      }

      // 2. Get Audio Source (320kbps is preferred)
      let audioSrc = '';
      if (Array.isArray(song.downloadUrl)) {
        audioSrc = song.downloadUrl.find((url: any) => url.quality === '320kbps')?.link || 
                   song.downloadUrl.find((url: any) => url.quality === '320kbps')?.url || 
                   song.downloadUrl[song.downloadUrl.length - 1]?.link || 
                   song.downloadUrl[song.downloadUrl.length - 1]?.url || 
                   '';
      }

      // 3. Get Artist Name
      let artist = 'Unknown Artist';
      let artistId = '';
      if (song.artists?.primary && Array.isArray(song.artists.primary)) {
        artist = song.artists.primary.map((a: any) => a.name).join(', ');
        artistId = song.artists.primary[0]?.id || '';
      } else if (typeof song.primaryArtists === 'string') {
        artist = song.primaryArtists;
      } else if (typeof song.artists === 'string') {
        artist = song.artists;
      } else if (song.artist) {
        artist = song.artist;
      }

      if (!artistId && song.artists?.all && Array.isArray(song.artists.all)) {
        artistId = song.artists.all[0]?.id || '';
      }

      // 4. Get Album Name
      let album = 'Unknown Album';
      if (song.album && typeof song.album === 'object' && song.album.name) {
        album = song.album.name;
      } else if (typeof song.album === 'string') {
        album = song.album;
      }

      // 5. Format Duration (from seconds to m:ss)
      let durationStr = '3:00';
      const durationSec = Number(song.duration);
      if (!isNaN(durationSec) && durationSec > 0) {
        const m = Math.floor(durationSec / 60);
        const s = Math.floor(durationSec % 60);
        durationStr = `${m}:${s.toString().padStart(2, '0')}`;
      }

      return {
        id: song.id,
        title: song.name || song.title || 'Untitled',
        artist,
        album,
        cover,
        audioSrc,
        duration: durationStr,
        artistId,
      };
    });

    return NextResponse.json({ success: true, data: songs });
  } catch (error: any) {
    console.error('Error in search route proxy:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
