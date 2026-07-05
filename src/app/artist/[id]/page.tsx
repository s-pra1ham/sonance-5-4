'use client';

import React, { use, useState, useEffect } from 'react';
import { useMusicPlayerContext } from '../../context/MusicPlayerContext';
import Image from 'next/image';
import { Song } from '../../data/songs';

interface ArtistData {
  id: string;
  name: string;
  cover: string;
  bio: string;
  songs: Song[];
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { playSong } = useMusicPlayerContext();

  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtistDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/music/artist?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setArtist(json.data);
        } else {
          setError(json.error || 'Failed to load artist details');
        }
      } catch (err) {
        console.error('Error fetching artist details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchArtistDetails();
  }, [id]);

  const handlePlayAll = () => {
    if (artist && artist.songs.length > 0) {
      playSong(artist.songs[0], artist.songs);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow overflow-y-auto custom-scrollbar animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 sm:h-80 bg-neutral-200 relative flex items-end p-6 sm:p-8">
          <div className="space-y-3 w-full">
            <div className="h-4 bg-neutral-300 rounded w-24"></div>
            <div className="h-10 bg-neutral-300 rounded w-1/3"></div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-48"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center h-12 bg-neutral-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Artist</h2>
        <p className="text-gray-600 mb-4">{error || 'Artist profile could not be found.'}</p>
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-sm font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar pb-28">
      {/* Banner */}
      <div className="relative overflow-hidden h-72 sm:h-96 bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-end">
        <div className="absolute inset-0 opacity-40">
          <Image 
            src={artist.cover} 
            alt={artist.name}
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => window.history.back()}
            className="p-2.5 bg-black/35 hover:bg-black/60 rounded-full text-white transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>

        {/* Artist Profile Header */}
        <div className="p-6 sm:p-10 relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 w-full">
          <div className="w-28 h-28 sm:w-40 sm:h-40 relative rounded-xl overflow-hidden shadow-2xl border-2 border-white flex-shrink-0 bg-neutral-700">
            <Image 
              src={artist.cover} 
              alt={artist.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-grow text-white">
            <div className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full inline-block mb-2 backdrop-blur-sm">ARTIST</div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-2 tracking-tight">{artist.name}</h1>
            <p className="text-xs sm:text-sm text-neutral-300 opacity-90 truncate max-w-2xl">{artist.bio.substring(0, 150)}...</p>
          </div>
        </div>
      </div>

      {/* Profile Details & Songs */}
      <div className="p-4 sm:p-8 space-y-8">
        
        {/* Play Controls & Biography Details */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePlayAll}
                className="px-6 py-3 bg-neutral-900 text-white rounded-full flex items-center justify-center gap-2 font-semibold text-sm hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md"
                disabled={artist.songs.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
                <span>Play Popular</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Biography</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{artist.bio}</p>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Popular Songs</h2>
          {artist.songs.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No popular songs found for this artist.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {artist.songs.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, artist.songs)}
                  className="flex items-center p-3 sm:p-4 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                >
                  <div className="mr-4 text-neutral-400 w-5 text-center font-semibold text-xs sm:text-sm">{index + 1}</div>
                  <div className="w-10 h-10 rounded overflow-hidden mr-4 flex-shrink-0 relative bg-neutral-200">
                    <Image src={song.cover} alt={song.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">{song.title}</h3>
                    <p className="text-xs sm:text-sm text-neutral-500 truncate">{song.album}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-400 mr-2">{song.duration}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
