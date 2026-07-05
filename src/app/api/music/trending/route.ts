/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co/api';
    const res = await fetch(`${apiUrl}/search/playlists?query=trending`);

    if (!res.ok) {
      throw new Error(`External API responded with status ${res.status}`);
    }

    const payload = await res.json();
    const rawPlaylists = payload.data?.results || payload.data || [];

    const playlists = rawPlaylists.map((playlist: any) => {
      let cover = '/cover-placeholder.png';
      if (Array.isArray(playlist.image)) {
        cover = playlist.image.find((img: any) => img.quality === '500x500')?.link || 
                playlist.image.find((img: any) => img.quality === '500x500')?.url || 
                playlist.image[playlist.image.length - 1]?.link || 
                playlist.image[playlist.image.length - 1]?.url || 
                cover;
      }

      return {
        id: playlist.id,
        title: playlist.name || playlist.title || 'Untitled Playlist',
        cover,
        description: playlist.description || playlist.subtitle || '',
      };
    });

    return NextResponse.json({ success: true, data: playlists });
  } catch (error: any) {
    console.error('Error in trending playlists route proxy:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
