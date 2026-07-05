'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Song } from '../data/songs';

interface GenrePageProps {
  genreName: string;
  onClose: () => void;
  onSongSelect: (songIndex: number, list: Song[]) => void;
}

function GenrePage({ genreName, onClose, onSongSelect }: GenrePageProps) {
  const [genreSongs, setGenreSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGenreSongs() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/music/search?query=${encodeURIComponent(genreName)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setGenreSongs(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch genre songs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGenreSongs();
  }, [genreName]);

  const getGradientClass = () => {
    switch(genreName) {
      case "Pop": return "from-pink-400 to-red-500";
      case "Rock": return "from-red-400 to-amber-500";
      case "Indie": return "from-emerald-400 to-cyan-500";
      case "Electronic": return "from-blue-400 to-indigo-500";
      case "Acoustic": return "from-violet-400 to-purple-500";
      case "Alternative": return "from-amber-400 to-yellow-500";
      default: return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="p-4 md:p-6 pb-28">
        {/* Back button row */}
        <div className="mb-6">
          <button 
            onClick={onClose}
            className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Back
          </button>
        </div>

        {/* Header with gradient background */}
        <div className={`bg-gradient-to-br ${getGradientClass()} rounded-2xl py-8 px-6 text-white mb-8`}>
          <div className="max-w-screen-xl mx-auto">
            <span className="text-sm font-medium uppercase tracking-wider opacity-90">Genre</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{genreName}</h1>
            <p className="opacity-80">{genreSongs.length} songs</p>
          </div>
        </div>
        
        <div className="max-w-screen-xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">All Songs</h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (genreSongs.length > 0) {
                        onSongSelect(0, genreSongs);
                      }
                    }}
                    className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    disabled={genreSongs.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Play All
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {genreSongs.length > 0 ? (
                  genreSongs.map((song, index) => (
                    <div 
                      key={song.id}
                      className="flex items-center p-4 hover:bg-neutral-100/60 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                      onClick={() => onSongSelect(index, genreSongs)}
                    >
                      <div className="mr-5 text-neutral-400 w-5 text-center font-medium">{index + 1}</div>
                      <div className="w-14 h-14 rounded-md overflow-hidden mr-4 flex-shrink-0 relative bg-neutral-200">
                        <Image src={song.cover} alt={song.title} fill className="object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate text-gray-800 text-sm sm:text-base">{song.title}</h3>
                        <p className="text-xs sm:text-sm text-neutral-500 truncate">{song.artist}</p>
                      </div>
                      <div className="text-xs sm:text-sm text-neutral-400 mr-4">{song.duration}</div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-neutral-500">
                    No songs found in this genre.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenrePage;