'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMusicPlayerContext } from './context/MusicPlayerContext';
import Image from 'next/image';
import Link from 'next/link';

// Component imports
import GenrePage from './components/GenrePage';
import PlaylistPage from './components/PlaylistPage';
import LikedSongsPage from './components/LikedSongsPage';
import SavesPage from './components/SavesPage';
import AlbumsPage from './components/AlbumsPage';
import ArtistsPage from './components/ArtistsPage';

import { Song } from './data/songs';

interface TrendingPlaylist {
  id: string;
  title: string;
  cover: string;
  description: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const playlistName = searchParams.get('name');
  const genreName = searchParams.get('name');

  const {
    playSong,
    recentlyPlayed,
    likedSongs,
    savedSongs,
    playlistSongs,
  } = useMusicPlayerContext();

  const [trendingPlaylists, setTrendingPlaylists] = useState<TrendingPlaylist[]>([]);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Scroll references
  const newReleasesScrollRef = useRef<HTMLDivElement>(null);
  const recentlyPlayedScrollRef = useRef<HTMLDivElement>(null);

  // Fetch Trending Playlists
  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoadingPlaylists(true);
        const res = await fetch('/api/music/trending');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTrendingPlaylists(json.data);
          
          // Fetch songs for the first playlist to show in the "Popular" section
          if (json.data.length > 0) {
            fetchPopularSongs(json.data[0].id);
          } else {
            setLoadingPopular(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch trending playlists:', err);
        setLoadingPlaylists(false);
        setLoadingPopular(false);
      } finally {
        setLoadingPlaylists(false);
      }
    }
    fetchTrending();
  }, []);

  // Fetch songs of the trending playlist
  async function fetchPopularSongs(playlistId: string) {
    try {
      setLoadingPopular(true);
      const res = await fetch(`/api/music/playlist?id=${encodeURIComponent(playlistId)}`);
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.songs)) {
        setPopularSongs(json.data.songs);
      }
    } catch (err) {
      console.error('Failed to fetch popular songs:', err);
    } finally {
      setLoadingPopular(false);
    }
  }

  // Scroll handlers
  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Handle playing a playlist card
  const handlePlaylistPlay = async (playlistId: string) => {
    try {
      const res = await fetch(`/api/music/playlist?id=${encodeURIComponent(playlistId)}`);
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.songs) && json.data.songs.length > 0) {
        playSong(json.data.songs[0], json.data.songs);
      }
    } catch (e) {
      console.error('Failed to play playlist:', e);
    }
  };

  // Skeletons
  const renderCardSkeletons = () => (
    <div className="flex gap-4 overflow-x-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex-shrink-0 w-[140px] sm:w-[170px] bg-gray-100/60 p-3 rounded-xl animate-pulse">
          <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const renderListSkeletons = () => (
    <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg animate-pulse border-b border-gray-100 last:border-0">
          <div className="w-4 bg-gray-200 h-4 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="w-10 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  // If a sub-view is requested via searchParams, render that sub-page
  if (view === 'liked') {
    return (
      <LikedSongsPage
        onClose={() => window.history.back()}
        onSongSelect={(index) => {
          if (likedSongs[index]) playSong(likedSongs[index], likedSongs);
        }}
        likedSongs={likedSongs}
      />
    );
  }

  if (view === 'saves') {
    return (
      <SavesPage
        onClose={() => window.history.back()}
        onSongSelect={(index) => {
          if (savedSongs[index]) playSong(savedSongs[index], savedSongs);
        }}
        savedSongs={savedSongs}
      />
    );
  }

  if (view === 'playlist' && playlistName) {
    return (
      <PlaylistPage
        playlistName={playlistName}
        onClose={() => window.history.back()}
        onSongSelect={(index) => {
          const list = playlistSongs[playlistName] || [];
          if (list[index]) playSong(list[index], list);
        }}
        playlistSongs={playlistSongs[playlistName] || []}
      />
    );
  }

  if (view === 'albums') {
    return (
      <AlbumsPage
        onClose={() => window.history.back()}
      />
    );
  }

  if (view === 'artists') {
    return (
      <ArtistsPage
        onClose={() => window.history.back()}
      />
    );
  }

  if (view === 'genre' && genreName) {
    return (
      <GenrePage
        genreName={genreName}
        onClose={() => window.history.back()}
        onSongSelect={(index, list) => {
          if (list[index]) playSong(list[index], list);
        }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="p-3 sm:p-4 md:p-6 pb-28">
        
        {/* Trending Section (Homepage) */}
        <section className="mb-6 sm:mb-8">
          <div className="mb-4 px-4 sm:px-0 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Trending Music</h2>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollLeft(newReleasesScrollRef)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow border border-gray-200 flex-shrink-0"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => scrollRight(newReleasesScrollRef)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow border border-gray-200 flex-shrink-0"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative scroll-container">
            {loadingPlaylists ? (
              renderCardSkeletons()
            ) : (
              <div 
                ref={newReleasesScrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide px-4 sm:px-0"
              >
                {trendingPlaylists.map((playlist) => (
                  <div key={playlist.id} className="flex-shrink-0 w-[140px] sm:w-[170px]" onClick={() => handlePlaylistPlay(playlist.id)}>
                    <div className="rounded-xl overflow-hidden bg-gray-50 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] duration-200">
                      <div className="w-full aspect-square rounded-lg overflow-hidden mb-2.5 sm:mb-3 relative bg-gray-200">
                        <Image
                          src={playlist.cover}
                          alt={playlist.title}
                          width={170}
                          height={170}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-800 ml-0.5">
                              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm mb-1 truncate text-gray-800">{playlist.title}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{playlist.description || 'Playlist'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recently Played section */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recently Played</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => scrollLeft(recentlyPlayedScrollRef)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow border border-gray-200"
                  aria-label="Scroll left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollRight(recentlyPlayedScrollRef)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow border border-gray-200"
                  aria-label="Scroll right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative scroll-container">
              <div 
                ref={recentlyPlayedScrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide px-4 sm:px-0"
              >
                {recentlyPlayed.map((song, index) => (
                  <div key={`recent-${song.id}-${index}`} className="flex-shrink-0 w-[140px] sm:w-[170px]" onClick={() => playSong(song, recentlyPlayed)}>
                    <div className="rounded-xl overflow-hidden bg-gray-50 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] duration-200">
                      <div className="w-full aspect-square rounded-lg overflow-hidden mb-2.5 sm:mb-3 bg-gray-200">
                        <Image
                          src={song.cover}
                          alt={song.title}
                          width={170}
                          height={170}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm mb-1 truncate text-gray-800">{song.title}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Tracks - Dynamically fetched from the top trending playlist */}
        <section className="mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Popular Tracks</h2>
          {loadingPopular ? (
            renderListSkeletons()
          ) : (
            <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {popularSongs.slice(0, 10).map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center p-3 sm:p-4 hover:bg-neutral-100/60 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                  onClick={() => playSong(song, popularSongs)}
                >
                  <div className="mr-3 sm:mr-5 text-neutral-400 w-4 sm:w-5 text-center font-medium text-xs sm:text-sm">{index + 1}</div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden mr-3 sm:mr-4 flex-shrink-0 bg-neutral-200">
                    <Image src={song.cover} alt={song.title} width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base truncate text-gray-800">{song.title}</h3>
                    <p className="text-xs sm:text-sm text-neutral-500 truncate">{song.artist}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-400 mr-2 sm:mr-4 hidden xs:block">{song.duration}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Explore Genres */}
        <section className="mb-6 sm:mb-8 px-4 sm:px-0">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Explore Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-5">
            {[
              { name: "Pop", color: "bg-gradient-to-br from-pink-400 to-red-500" },
              { name: "Rock", color: "bg-gradient-to-br from-red-400 to-amber-500" },
              { name: "Indie", color: "bg-gradient-to-br from-emerald-400 to-cyan-500" },
              { name: "Electronic", color: "bg-gradient-to-br from-blue-400 to-indigo-500" },
              { name: "Acoustic", color: "bg-gradient-to-br from-violet-400 to-purple-500" },
              { name: "Alternative", color: "bg-gradient-to-br from-amber-400 to-yellow-500" }
            ].map((genre, index) => (
              <Link
                key={index}
                href={`/?view=genre&name=${genre.name}`}
                className="bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden relative h-20 sm:h-24 md:h-32 group"
              >
                <div className={`absolute inset-0 ${genre.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800">{genre.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 bg-white rounded-2xl">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

