'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMusicPlayerContext } from '../context/MusicPlayerContext';
import { Song } from '../data/songs';

interface AlbumsPageProps {
  onClose: () => void;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  coverImage: string;
  songs: Song[];
}

const AlbumsPage: React.FC<AlbumsPageProps> = ({ onClose }) => {
  const { likedSongs, savedSongs, playSong } = useMusicPlayerContext();

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Combine liked and saved songs to extract albums
  const allLibrarySongs = [...likedSongs, ...savedSongs];

  // Group by album name
  const albumsMap = new Map<string, Song[]>();
  allLibrarySongs.forEach(song => {
    const list = albumsMap.get(song.album) || [];
    if (!list.some(s => s.id === song.id)) {
      list.push(song);
    }
    albumsMap.set(song.album, list);
  });

  const albums: Album[] = Array.from(albumsMap.entries()).map(([title, songsList], index) => {
    const firstSong = songsList[0];
    return {
      id: String(index + 1),
      title: title || 'Unknown Album',
      artist: firstSong?.artist || 'Unknown Artist',
      year: 'Collection',
      coverImage: firstSong?.cover || '/cover-placeholder.png',
      songs: songsList
    };
  });

  const handleAlbumPlay = (album: Album) => {
    if (album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar pb-28">
      {selectedAlbum ? (
        /* Album Detail View */
        <div className="p-4 sm:p-6">
          <button 
            onClick={() => setSelectedAlbum(null)}
            className="mb-6 flex items-center text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Back to Albums
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 bg-neutral-50 p-6 rounded-2xl border border-gray-100">
            <div className="w-40 h-40 relative rounded-xl overflow-hidden shadow-md">
              <Image src={selectedAlbum.coverImage} alt={selectedAlbum.title} fill className="object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">ALBUM</span>
              <h2 className="text-3xl font-black mt-2 text-gray-800">{selectedAlbum.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedAlbum.artist}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <button 
                  onClick={() => handleAlbumPlay(selectedAlbum)}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Play Album
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {selectedAlbum.songs.map((song, idx) => (
              <div 
                key={song.id}
                onClick={() => playSong(song, selectedAlbum.songs)}
                className="flex items-center p-3 sm:p-4 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
              >
                <div className="mr-4 text-neutral-400 w-5 text-center font-semibold text-xs sm:text-sm">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">{song.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-500 truncate">{song.artist}</p>
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 mr-2">{song.duration}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Albums Grid View */
        <div className="p-4 sm:p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Your Albums</h1>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {albums.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-medium">No albums saved yet</p>
              <p className="text-sm">Songs you like or save will show their albums here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {albums.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  className="bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.02] duration-200"
                >
                  <div className="w-full aspect-square relative rounded-lg overflow-hidden mb-3 bg-neutral-200">
                    <Image src={album.coverImage} alt={album.title} fill className="object-cover" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 truncate mb-0.5">{album.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{album.artist}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumsPage;