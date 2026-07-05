'use client';

import React from 'react';
import Image from 'next/image';
import { Song } from '../data/songs';

interface LikedSongsPageProps {
  onClose: () => void;
  onSongSelect: (index: number) => void;
  likedSongs: Song[];
}

const LikedSongsPage: React.FC<LikedSongsPageProps> = ({ onClose, onSongSelect, likedSongs = [] }) => {
  const likedSongsData = likedSongs;
  
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {/* Header with gradient */}
      <div className="bg-gradient-to-b from-indigo-800 to-indigo-500 h-48 sm:h-64 flex items-end">
        <div className="p-6 sm:p-8 text-white">
          <button 
            onClick={onClose}
            className="mb-3 sm:mb-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex items-center">
            <div className="grid place-items-center mr-6 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-9 sm:h-9 text-white" aria-hidden="true">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">PLAYLIST</div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Liked Songs</h1>
              <div className="text-xs sm:text-sm opacity-90">{likedSongsData.length} songs</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Play button and controls */}
        <div className="flex items-center mb-6">
          <button 
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors mr-4"
            onClick={() => likedSongsData.length > 0 && onSongSelect(0)} // Play the first liked song
            aria-label="Play liked songs"
            disabled={likedSongsData.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Songs table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Album</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Artist</th>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {likedSongsData.map((song, index) => (
                <tr 
                  key={song.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSongSelect(index)}
                >
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{index + 1}</td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 relative">
                        <Image 
                          src={song.cover}
                          alt={song.title}
                          width={40}
                          height={40}
                          className="rounded-md shadow-sm"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{song.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{song.album}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{song.artist}</td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{song.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Show message when no liked songs */}
        {likedSongsData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-600 mb-2">No liked songs yet</h3>
            <p className="text-neutral-500 mb-4">Songs you like will appear here</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              Discover Music
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;