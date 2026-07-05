'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Song } from '../data/songs';

interface SavesPageProps {
  onClose: () => void;
  onSongSelect: (index: number) => void;
  savedSongs: Song[];
}

const SavesPage: React.FC<SavesPageProps> = ({ onClose, onSongSelect, savedSongs = [] }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'artists' | 'albums' | 'songs' | 'playlists'>('all');

  const savedSongsData = savedSongs;

  // Mock categories of saved items
  const allCategories = [
    {
      id: 1,
      title: 'Favorite Artists',
      type: 'artists' as const,
      items: savedSongsData.length > 0 
        ? Array.from(new Set(savedSongsData.map(s => s.artist))).map(artist => ({
            type: 'artist',
            name: artist,
            image: savedSongsData.find(s => s.artist === artist)?.cover || '/cover-placeholder.png',
            count: 'Saved Artist'
          }))
        : []
    },
    {
      id: 2,
      title: 'Albums',
      type: 'albums' as const,
      items: savedSongsData.length > 0
        ? Array.from(new Set(savedSongsData.map(s => s.album))).map(albumName => {
            const albumSong = savedSongsData.find(s => s.album === albumName);
            return {
              type: 'album',
              name: albumName,
              image: albumSong?.cover || '/cover-placeholder.png',
              count: 'Album • ' + (albumSong?.artist || 'Various Artists')
            };
          })
        : []
    },
    {
      id: 3,
      title: 'Saved Songs',
      type: 'songs' as const,
      items: savedSongsData.map((song, index) => ({
        type: 'song',
        name: song.title,
        image: song.cover,
        count: song.artist,
        index
      }))
    }
  ];

  // Filter categories based on active filter
  const savedCategories = activeFilter === 'all'
    ? allCategories
    : allCategories.filter(category => category.type === activeFilter);

  // Get filter button style
  const getFilterButtonStyle = (filterType: string) => {
    return activeFilter === filterType
      ? "px-4 py-2 bg-amber-500 text-white rounded-full font-medium text-sm"
      : "px-4 py-2 bg-white text-neutral-700 rounded-full font-medium text-sm hover:bg-neutral-100 transition-colors";
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {/* Header */}
      <div className="relative overflow-hidden h-60 bg-gradient-to-r from-amber-500 to-yellow-400">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 gap-2">
            {Array(60).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-sm opacity-60" style={{
                transform: `rotate(${Math.random() * 45}deg)`
              }}></div>
            ))}
          </div>
        </div>

        <div className="absolute top-0 left-0 p-6">
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

        <div className="absolute bottom-0 left-0 p-8 flex items-end">
          <div className="mr-6 bg-amber-600 rounded-xl p-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-white">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-white text-sm font-medium mb-1">COLLECTION</div>
            <h1 className="text-white text-5xl font-bold mb-3">Your Saves</h1>
            <div className="flex items-center text-white/80 text-sm">
              <span className="font-medium">You</span>
              <span className="mx-1">•</span>
              <span>{savedCategories.reduce((acc, cat) => acc + cat.items.length, 0)} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gradient-to-b from-amber-800/10 to-neutral-50/0">
        {/* Filter options */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button className={getFilterButtonStyle('all')} onClick={() => setActiveFilter('all')}>All items</button>
          <button className={getFilterButtonStyle('artists')} onClick={() => setActiveFilter('artists')}>Artists</button>
          <button className={getFilterButtonStyle('albums')} onClick={() => setActiveFilter('albums')}>Albums</button>
          <button className={getFilterButtonStyle('songs')} onClick={() => setActiveFilter('songs')}>Songs</button>
        </div>

        {/* Show message when no items found */}
        {savedCategories.length === 0 || savedCategories.every(cat => cat.items.length === 0) ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-600 mb-2">
              {activeFilter === 'all' ? 'No saved items yet' : `No saved ${activeFilter} yet`}
            </h3>
            <p className="text-neutral-500 mb-4">
              Items you save will appear here
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
            >
              Discover Music
            </button>
          </div>
        ) : null}

        {/* Categories */}
        {savedCategories.map(category =>
          category.items.length > 0 ? (
            <div key={category.id} className="mb-10">
              <h2 className="text-xl font-semibold mb-5 text-gray-800">{category.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {category.items.map((item: { type: string; name: string; image: string; count: string; index?: number }, idx) => (
                  <div
                    key={`${category.id}-${idx}`}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all"
                    onClick={() => {
                      if (item.type === 'song' && item.index !== undefined) {
                        onSongSelect(item.index);
                      }
                    }}
                  >
                    <div className={`w-full overflow-hidden mb-3 shadow-sm aspect-square relative ${item.type === 'artist' ? 'rounded-full' : 'rounded-lg'}`}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="object-cover"
                        fill
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1 truncate text-gray-800">{item.name}</h3>
                    <p className="text-xs text-neutral-500 truncate flex items-center gap-1">
                      {item.type === 'song' && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 inline-block">
                          <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="ml-1">{item.count}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default SavesPage;