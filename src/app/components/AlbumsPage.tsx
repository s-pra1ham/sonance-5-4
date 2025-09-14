'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { songs } from '../data/songs';

interface AlbumsPageProps {
  onClose: () => void;
  onSongSelect: (index: number) => void;
  isPlaying?: boolean;
  currentSong?: any;
}

interface Album {
  id: number;
  title: string;
  artist: string;
  year: string;
  coverImage: string;
  songCount: number;
}

const AlbumsPage: React.FC<AlbumsPageProps> = ({ onClose, onSongSelect, isPlaying = false, currentSong }) => {
  // For demo, create albums from our song data
  const albums: Album[] = Array.from(new Set(songs.map(s => s.artist))).map((artist, index) => {
    const artistSongs = songs.filter(s => s.artist === artist);
    return {
      id: index + 1,
      title: `${artist} Collection`,
      artist: artist,
      year: `202${Math.floor(Math.random() * 4)}`,
      coverImage: artistSongs[0]?.cover || '',
      songCount: artistSongs.length
    };
  });

  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [hoveredAlbum, setHoveredAlbum] = useState<number | null>(null);
  // No search functionality needed
  const filteredAlbums = albums;

  // Check if current song is from any album on this page
  const isCurrentSongFromAlbums = currentSong && albums.some(album =>
    album.artist === currentSong.artist
  );

  // Only animate when music is playing and it's from this page's context
  const shouldAnimate = isPlaying && isCurrentSongFromAlbums;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {/* Header with vinyl animation - mobile optimized */}
      <div className="relative overflow-hidden h-48 sm:h-60 md:h-72 bg-gradient-to-r from-indigo-900 to-blue-800">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
            <div className={`w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full border-[10px] sm:border-[15px] md:border-[20px] border-white/20 ${shouldAnimate ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '10s', willChange: 'transform' }}></div>
            <div className={`w-32 sm:w-48 md:w-60 h-32 sm:h-48 md:h-60 rounded-full border-[5px] sm:border-[8px] md:border-[10px] border-white/30 absolute ${shouldAnimate ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '20s', animationDirection: 'reverse', willChange: 'transform' }}></div>
            <div className="w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 rounded-full bg-white/10 absolute"></div>
            <div className="w-2 sm:w-3 md:w-4 h-2 sm:h-3 md:h-4 rounded-full bg-white/60 absolute"></div>
          </div>
        </div>

        <div className="absolute top-0 left-0 p-4 sm:p-6">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 flex items-end">
          <div className="mr-3 sm:mr-4 md:mr-6 bg-indigo-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-white">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-white text-xs sm:text-sm font-medium mb-1">COLLECTION</div>
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3">Albums</h1>
            <div className="flex items-center text-white/80 text-xs sm:text-sm">
              <span className="font-medium">Library</span>
              <span className="mx-1">•</span>
              <span>{albums.length} albums</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - mobile optimized */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-indigo-900/10 to-neutral-50/0">
        {/* Controls bar - mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm p-1">
            <button
              className={`p-2 rounded-lg ${selectedView === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-neutral-500 hover:text-neutral-700'} transition-colors`}
              onClick={() => setSelectedView('grid')}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </button>
            <button
              className={`p-2 rounded-lg ${selectedView === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-neutral-500 hover:text-neutral-700'} transition-colors`}
              onClick={() => setSelectedView('list')}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Albums display - grid or list view */}
        {selectedView === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="group relative"
                onMouseEnter={() => setHoveredAlbum(album.id)}
                onMouseLeave={() => setHoveredAlbum(null)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <button
                      className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors transform group-hover:scale-100 scale-0 transition-transform duration-300"
                      onClick={() => {
                        const songIndex = songs.findIndex(s => s.artist === album.artist);
                        if (songIndex !== -1) {
                          onSongSelect(songIndex);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {hoveredAlbum === album.id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-sm mb-1 truncate text-gray-800">{album.title}</h3>
                  <p className="text-xs text-gray-600 truncate">{album.year} • {album.songCount} songs</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="flex items-center p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                onClick={() => {
                  const songIndex = songs.findIndex(s => s.artist === album.artist);
                  if (songIndex !== -1) {
                    onSongSelect(songIndex);
                  }
                }}
              >
                <div className="w-14 h-14 rounded overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 truncate text-gray-800">{album.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{album.artist} • {album.songCount} songs</p>
                </div>
                <div className="text-sm text-gray-600 mr-4">{album.year}</div>
                <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumsPage; 