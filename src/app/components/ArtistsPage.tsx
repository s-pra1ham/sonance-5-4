'use client';

import React from 'react';
import Image from 'next/image';
import { useMusicPlayerContext } from '../context/MusicPlayerContext';
import { useRouter } from 'next/navigation';

interface ArtistsPageProps {
  onClose: () => void;
}

interface LibraryArtist {
  id: string;
  name: string;
  cover: string;
  songsCount: number;
}

const ArtistsPage: React.FC<ArtistsPageProps> = ({ onClose }) => {
  const { likedSongs, savedSongs } = useMusicPlayerContext();
  const router = useRouter();

  const allSongs = [...likedSongs, ...savedSongs];

  // Group by artist name
  const artistMap = new Map<string, { cover: string; id: string; count: number }>();
  allSongs.forEach(song => {
    const existing = artistMap.get(song.artist);
    if (existing) {
      existing.count += 1;
    } else {
      artistMap.set(song.artist, {
        cover: song.cover || '/cover-placeholder.png',
        id: song.artistId || '',
        count: 1
      });
    }
  });

  const libraryArtists: LibraryArtist[] = Array.from(artistMap.entries()).map(([name, data]) => ({
    id: data.id,
    name,
    cover: data.cover,
    songsCount: data.count
  }));

  const handleArtistClick = (artist: LibraryArtist) => {
    if (artist.id) {
      router.push(`/artist/${artist.id}`);
    } else {
      // Fallback search route if artistId is not present
      router.push(`/?view=genre&name=${encodeURIComponent(artist.name)}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 flex-grow overflow-y-auto custom-scrollbar pb-28">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Your Artists</h1>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {libraryArtists.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <p className="text-lg font-medium">No artists saved yet</p>
          <p className="text-sm">Artists from your liked/saved songs will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {libraryArtists.map((artist) => (
            <div 
              key={artist.name}
              onClick={() => handleArtistClick(artist)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden relative shadow bg-neutral-200 mb-3 border-2 border-transparent group-hover:border-indigo-500 transition-all duration-200">
                <Image src={artist.cover} alt={artist.name} fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800 truncate w-full">{artist.name}</h3>
              <p className="text-xs text-gray-500">{artist.songsCount} song{artist.songsCount !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;