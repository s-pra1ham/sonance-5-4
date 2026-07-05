'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMusicPlayerContext } from '../context/MusicPlayerContext';
import { useRouter } from 'next/navigation';
import NowPlayingBar from './NowPlayingBar';
import ExpandedSongCard from './ExpandedSongCard';
import VolumeCard from './VolumeCard';
import Image from 'next/image';
import Link from 'next/link';
import { Song } from '../data/songs';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: (e?: React.MouseEvent) => void;
  isDropdown?: boolean;
  isActive?: boolean;
  delay?: number;
  children?: React.ReactNode;
  isSidebarOpen?: boolean;
}

function NavItem({
  icon,
  label,
  onClick = () => {},
  isDropdown = false,
  isActive = false,
  delay = 0,
  children,
  isSidebarOpen = false
}: NavItemProps) {
  return (
    <div className="mb-1 transition-transform duration-500 ease-in-out" style={{ transitionDelay: `${delay}ms` }}>
      <button
        className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl hover:bg-white/10 transition-colors text-left ${isActive ? 'bg-white/5' : ''}`}
        onClick={(e) => {
          onClick?.(e);
        }}
        aria-expanded={isDropdown ? isActive : undefined}
        aria-label={label}
      >
        <div className="flex items-center min-w-0">
          <div className="w-7 h-7 inline-flex items-center justify-center flex-shrink-0 text-gray-200">
            {icon}
          </div>
          <span className={`ml-2.5 font-medium text-sm whitespace-nowrap transition-opacity duration-300 text-gray-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} overflow-hidden text-ellipsis`}>{label}</span>
        </div>
        {isDropdown && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            className={`w-4 h-4 transition-transform duration-300 text-gray-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isActive ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>
      {isDropdown && (
        <div className={`mt-1 overflow-hidden transition-all duration-300 ${isActive ? 'max-h-60' : 'max-h-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    queue,
    likedSongs,
    savedSongs,
    playlistSongs,
    isShuffleOn,
    repeatMode,
    isAutoplayOn,
    toast,
    setToast,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    adjustVolume,
    toggleLike,
    toggleSave,
    addToPlaylist,
    clearQueue,
    shuffleQueue,
    removeFromQueue,
    toggleShuffle,
    changeRepeatMode,
    toggleAutoplay,
  } = useMusicPlayerContext();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showExpandedCard, setShowExpandedCard] = useState(false);
  const [showVolumeCard, setShowVolumeCard] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search logic fetching from our proxy Route Handler
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/search?query=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSearchResults(json.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Handle outside clicks to close profile or search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSearchResults(val.trim().length > 0);
  };

  const handleSearchResultClick = (song: Song) => {
    playSong(song, searchResults);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const toggleDropdown = useCallback((id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }, []);

  // Listen to open-volume-card event
  useEffect(() => {
    const handleOpenVolumeCard = () => setShowVolumeCard(true);
    window.addEventListener('open-volume-card', handleOpenVolumeCard);
    return () => window.removeEventListener('open-volume-card', handleOpenVolumeCard);
  }, []);

  const expandedSong = showExpandedCard && currentSong ? currentSong : null;
  const nowPlayingSong = currentSong || (queue.length > 0 ? queue[0] : null);

  const playlistNames = Object.keys(playlistSongs);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 p-1 sm:p-2 md:p-3">
      {/* Mobile overlay */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${isSidebarVisible ? 'translate-x-0 w-72' : '-translate-x-full sm:translate-x-0 sm:w-16'} 
        transition-all duration-300 ease-out fixed sm:static z-50 sm:z-20 group 
        flex flex-col bg-black text-gray-200 h-full sm:h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] 
        flex-shrink-0 overflow-hidden rounded-none sm:rounded-xl md:rounded-2xl mr-0 shadow-lg hover:w-60 sm:hover:w-60`}
      >
        <div className="p-3 sm:p-2.5 mb-4 sm:mb-6 flex items-center justify-between w-full">
          <div className="flex items-center">
            <button
              className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-all cursor-pointer"
              aria-label="Home"
              onClick={(e) => {
                e?.preventDefault();
                router.push('/');
                setIsSidebarVisible(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </button>
            <span className={`ml-3 text-lg font-medium transition-opacity duration-300 text-gray-200 ${isSidebarVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} whitespace-nowrap overflow-hidden`}>Library</span>
          </div>
          
          <button
            className="sm:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsSidebarVisible(false)}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1 px-2 overflow-y-auto flex-grow scrollbar-hide">
          {/* Home NavItem */}
          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            }
            label="Home"
            onClick={() => {
              router.push('/');
              setIsSidebarVisible(false);
            }}
            isSidebarOpen={isSidebarVisible}
          />

          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
            }
            label="Playlists"
            onClick={(e) => {
              e?.preventDefault();
              toggleDropdown('playlists');
            }}
            isDropdown
            isActive={openDropdown === 'playlists'}
            delay={100}
            isSidebarOpen={isSidebarVisible}
          >
            <div className="ml-7 space-y-1 overflow-hidden">
              {playlistNames.map((name) => (
                <Link
                  key={name}
                  href={`/?view=playlist&name=${encodeURIComponent(name)}`}
                  onClick={() => setIsSidebarVisible(false)}
                  className="flex items-center px-2.5 py-1.5 text-sm rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 mr-2"></div>
                  <span className={`transition-opacity duration-300 text-gray-200 ${isSidebarVisible || openDropdown === 'playlists' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{name}</span>
                </Link>
              ))}
            </div>
          </NavItem>

          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto my-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            }
            label="Liked Songs"
            onClick={() => {
              router.push('/?view=liked');
              setIsSidebarVisible(false);
            }}
            isSidebarOpen={isSidebarVisible}
          />

          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            }
            label="Saves"
            delay={200}
            onClick={() => {
              router.push('/?view=saves');
              setIsSidebarVisible(false);
            }}
            isSidebarOpen={isSidebarVisible}
          />

          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
            label="Albums"
            delay={250}
            onClick={() => {
              router.push('/?view=albums');
              setIsSidebarVisible(false);
            }}
            isSidebarOpen={isSidebarVisible}
          />

          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
            label="Artists"
            delay={350}
            onClick={() => {
              router.push('/?view=artists');
              setIsSidebarVisible(false);
            }}
            isSidebarOpen={isSidebarVisible}
          />
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-1.5 md:p-3 mb-1">
          <div className="flex items-center gap-2.5">
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center focus:outline-none text-neutral-600 hover:text-neutral-900 transition-colors"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              aria-label={isSidebarVisible ? "Close library" : "Open library"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <h1
              className="text-2xl font-bold tracking-tight cursor-pointer hover:text-neutral-700 transition-colors text-gray-900 leading-tight flex items-center"
              onClick={() => router.push('/')}
              style={{
                fontFamily: 'var(--font-geist-sans)',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">Sonance</span>
              <span className="ml-1 text-xs font-semibold bg-black text-white px-1.5 py-0.5 rounded-md opacity-80">
                MUSIC
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search bar */}
            <div className="relative block w-48 xs:w-60 md:w-80 search-container">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                )}
              </div>
              <input
                type="text"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
                className="pl-10 pr-10 py-1.5 w-full bg-white text-neutral-800 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-200 text-sm shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-neutral-500 px-3 py-2 border-b border-neutral-100">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleSearchResultClick(song)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 relative bg-neutral-100">
                          <Image
                            src={song.cover}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-neutral-900 truncate">{song.title}</div>
                          <div className="text-xs text-neutral-600 truncate">{song.artist} • {song.album}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 z-50">
                  <div className="p-4 text-center text-neutral-500 text-sm">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-black">Dinoco Studios</p>
                        <p className="text-xs text-gray-500">dinoco.studios@gmail.com</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">View Profile</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">Settings</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic children render inside content container */}
        <div className="flex-1 flex flex-col mx-0 sm:mx-1 md:mx-3 lg:mx-6 mb-0 sm:mb-1 md:mb-3 lg:mb-6 bg-white rounded-none sm:rounded-xl md:rounded-2xl shadow-none sm:shadow-md overflow-hidden border-0 sm:border sm:border-gray-100 relative">
          {children}

          {/* Now playing bar - sticky inside the layout container */}
          {nowPlayingSong && (
            <div className="flex-shrink-0 bg-none">
              <NowPlayingBar
                currentSong={nowPlayingSong}
                isPlaying={isPlaying}
                progress={progress}
                duration={duration}
                volume={volume}
                isLiked={likedSongs.some((s) => s.id === nowPlayingSong.id)}
                isSaved={savedSongs.some((s) => s.id === nowPlayingSong.id)}
                onPlayPause={togglePlay}
                onNext={nextSong}
                onPrevious={prevSong}
                onProgressChange={seek}
                onVolumeChange={adjustVolume}
                onExpand={() => setShowExpandedCard(true)}
                onToggleLike={() => toggleLike(nowPlayingSong)}
                onToggleSave={() => toggleSave(nowPlayingSong)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded Song Card */}
      {expandedSong && (
        <ExpandedSongCard
          song={expandedSong}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          progressPercentage={
            isFinite(progress) && isFinite(duration) && duration > 0
              ? Math.max(0, Math.min(100, (progress / duration) * 100))
              : 0
          }
          suggestedSongs={queue}
          onPlayPause={togglePlay}
          onNext={nextSong}
          onPrevious={prevSong}
          onProgressChange={seek}
          onVolumeChange={adjustVolume}
          onClose={() => setShowExpandedCard(false)}
          onSelectSong={(index) => {
            if (queue[index]) {
              playSong(queue[index], queue);
            }
          }}
          onShuffleToggle={toggleShuffle}
          onAutoplayToggle={toggleAutoplay}
          isShuffleOn={isShuffleOn}
          isAutoplayOn={isAutoplayOn}
          isLiked={likedSongs.some((s) => s.id === expandedSong.id)}
          isSaved={savedSongs.some((s) => s.id === expandedSong.id)}
          onToggleLike={() => toggleLike(expandedSong)}
          onToggleSave={() => toggleSave(expandedSong)}
          onAddToPlaylist={(pName) => addToPlaylist(pName, expandedSong)}
          availablePlaylists={playlistNames}
          onShuffleQueue={shuffleQueue}
          onClearQueue={clearQueue}
          onRemoveFromQueue={removeFromQueue}
        />
      )}

      {/* Volume Card */}
      <VolumeCard
        volume={volume}
        onChange={adjustVolume}
        isVisible={showVolumeCard}
        onClose={() => setShowVolumeCard(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
