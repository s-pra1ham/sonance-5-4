/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Artist ID is required' }, { status: 400 });
    }

    const apiUrl = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co/api';
    
    // Attempt to fetch from /artists/{id} first
    let res = await fetch(`${apiUrl}/artists/${encodeURIComponent(id)}`);
    
    // If that fails or responds with 404, try /artists?id={id}
    if (!res.ok) {
      console.warn(`Attempting fallback endpoint /artists?id=${id}`);
      res = await fetch(`${apiUrl}/artists?id=${encodeURIComponent(id)}`);
    }

    if (!res.ok) {
      throw new Error(`External API responded with status ${res.status}`);
    }

    const payload = await res.json();
    const artistData = payload.data;

    if (!artistData) {
      return NextResponse.json({ success: false, error: 'Artist not found' }, { status: 404 });
    }

    let cover = '/cover-placeholder.png';
    if (Array.isArray(artistData.image)) {
      cover = artistData.image.find((img: any) => img.quality === '500x500')?.link || 
              artistData.image.find((img: any) => img.quality === '500x500')?.url || 
              artistData.image[artistData.image.length - 1]?.link || 
              artistData.image[artistData.image.length - 1]?.url || 
              cover;
    }

    // Extract bio
    let bio = 'Biography not available.';
    if (typeof artistData.bio === 'string' && artistData.bio) {
      bio = artistData.bio;
    } else if (Array.isArray(artistData.bio) && artistData.bio.length > 0) {
      bio = artistData.bio.map((b: any) => b.text || b).join('\n');
    } else if (artistData.description) {
      bio = artistData.description;
    }

    const rawSongs = artistData.topSongs || artistData.songs || [];
    const songs = rawSongs.map((song: any) => {
      let songCover = '/cover-placeholder.png';
      if (Array.isArray(song.image)) {
        songCover = song.image.find((img: any) => img.quality === '500x500')?.link || 
                    song.image.find((img: any) => img.quality === '500x500')?.url || 
                    song.image[song.image.length - 1]?.link || 
                    song.image[song.image.length - 1]?.url || 
                    songCover;
      }

      let audioSrc = '';
      if (Array.isArray(song.downloadUrl)) {
        audioSrc = song.downloadUrl.find((url: any) => url.quality === '320kbps')?.link || 
                   song.downloadUrl.find((url: any) => url.quality === '320kbps')?.url || 
                   song.downloadUrl[song.downloadUrl.length - 1]?.link || 
                   song.downloadUrl[song.downloadUrl.length - 1]?.url || 
                   '';
      }

      let artistName = artistData.name || 'Unknown Artist';
      let artistId = artistData.id || '';
      if (song.artists?.primary && Array.isArray(song.artists.primary)) {
        artistName = song.artists.primary.map((a: any) => a.name).join(', ');
        artistId = song.artists.primary[0]?.id || artistId;
      } else if (typeof song.primaryArtists === 'string') {
        artistName = song.primaryArtists;
      } else if (song.artist) {
        artistName = song.artist;
      }

      let album = 'Unknown Album';
      if (song.album && typeof song.album === 'object' && song.album.name) {
        album = song.album.name;
      } else if (typeof song.album === 'string') {
        album = song.album;
      }

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
        artist: artistName,
        album,
        cover: songCover,
        audioSrc,
        duration: durationStr,
        artistId,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: artistData.id,
        name: artistData.name || 'Unknown Artist',
        cover,
        bio,
        songs,
      }
    });
  } catch (error: any) {
    console.error('Error in artist details route proxy:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
