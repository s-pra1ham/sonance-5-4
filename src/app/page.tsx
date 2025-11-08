'use client';

import { useState, useCallback, memo, ReactNode, useRef, useEffect, useMemo } from 'react';
import { songs, Song } from './data/songs';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import NowPlayingBar from './components/NowPlayingBar';
import ExpandedSongCard from './components/ExpandedSongCard';
import GenrePage from './components/GenrePage';
import PlaylistPage from './components/PlaylistPage';
import LikedSongsPage from './components/LikedSongsPage';
import SavesPage from './components/SavesPage';
import AlbumsPage from './components/AlbumsPage';

import ArtistsPage from './components/ArtistsPage';
import VolumeCard from './components/VolumeCard';
import Image from 'next/image';

// Memoize components to prevent unnecessary re-renders
// const MemoizedNowPlayingBar = memo(NowPlayingBar);

// Type definitions for NavItem props
interface NavItemProps {
  icon: ReactNode;
  label: string;
  onClick?: (e?: React.MouseEvent) => void;
  isDropdown?: boolean;
  isActive?: boolean;
  delay?: number;
  children?: ReactNode;
  isSidebarOpen?: boolean;
}

function NavItem({
  icon,
  label,
  onClick = () => { },
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
          console.log(`NavItem clicked: ${label}`);
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

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    currentSongIndex,
    isPlaying,
    setIsPlaying,
    progress,
    duration,
    volume,
    recentlyPlayed,
    addToRecentlyPlayed,
    handlePlayPause,
    handleNext: nextSong,
    handlePrevious: previousSong,
    handleProgressChange,
    handleVolumeChange,
    handleSongSelect,
    currentSong,
    queue,
    queueSongs,
    handleShuffleQueue: shuffleQueue,
    handleClearQueue: clearQueue,
    handleRemoveFromQueue
  } = useMusicPlayer(songs, audioRef);

  // Add state for managing dropdown menus
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Add state for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Add state for expanded song card
  const [showExpandedCard, setShowExpandedCard] = useState(false);

  // Add state for selected genre
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Add state for selected playlist
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  // Add state for liked songs page
  const [showLikedSongs, setShowLikedSongs] = useState(false);

  // Add state for saves page
  const [showSaves, setShowSaves] = useState(false);

  // Add state for albums page
  const [showAlbums, setShowAlbums] = useState(false);



  // Add state for artists page
  const [showArtists, setShowArtists] = useState(false);

  // Add state for sidebar visibility on mobile
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Add state for profile popup
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Add state for shuffle
  const [isShuffleOn, setIsShuffleOn] = useState(false);

  // Add state for repeat mode
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: repeat all, 2: repeat one

  // Add state for autoplay
  const [isAutoplayOn, setIsAutoplayOn] = useState(true); // Default to true for continuous playback

  // Add state for volume card
  const [showVolumeCard, setShowVolumeCard] = useState(false);

  // Add state for liked songs and saved songs
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [savedSongs, setSavedSongs] = useState<Set<number>>(new Set());

  // Add state for playlist management
  const [playlistSongs, setPlaylistSongs] = useState<Map<string, Set<number>>>(new Map([
    ['Top Hits 2025', new Set()],
    ['Chill Vibes', new Set()],
    ['Party Mix', new Set()]
  ]));

  // Add state for toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Create refs for popup handling
  const profileRef = useRef<HTMLDivElement>(null);

  // Create ref for the sidebar
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Search filtering logic
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.trim().length > 0);
  }, []);

  // Handle search result click
  const handleSearchResultClick = useCallback((songIndex: number) => {
    const originalIndex = songs.findIndex(song => song === filteredSongs[songIndex]);
    if (originalIndex !== -1) {
      handleSongSelect(originalIndex);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  }, [filteredSongs, handleSongSelect]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearchResults(false);
  }, []);

  // Toggle dropdown function
  const toggleDropdown = useCallback((id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }, []);

  // Handle sidebar collapse
  const handleSidebarMouseLeave = useCallback(() => {
    // Close any open dropdown when the sidebar is collapsed
    setOpenDropdown(null);
  }, []);

  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(!isSidebarVisible);
  }, [isSidebarVisible]);

  // Toggle profile popup
  const toggleProfile = useCallback(() => {
    setIsProfileOpen(!isProfileOpen);
  }, [isProfileOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Close search results on Escape
      if (event.key === 'Escape' && showSearchResults) {
        setShowSearchResults(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchResults]);

  // Handle clicks outside popups
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      // Close search results when clicking outside
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle expanded card visibility
  const handleExpandCard = useCallback(() => {
    setShowExpandedCard(true);
  }, []);

  const handleCloseExpandedCard = useCallback(() => {
    setShowExpandedCard(false);
  }, []);

  // Helper function to reset all page states except the specified ones
  const resetOtherPages = useCallback((except: string[] = []) => {
    console.log('Resetting pages, except:', except);
    if (!except.includes('genre')) setSelectedGenre(null);
    if (!except.includes('playlist')) setSelectedPlaylist(null);
    if (!except.includes('likedSongs')) setShowLikedSongs(false);
    if (!except.includes('saves')) setShowSaves(false);
    if (!except.includes('albums')) setShowAlbums(false);
    if (!except.includes('artists')) setShowArtists(false);
  }, []);

  // Get suggested songs based on current song - memoized for performance
  const suggestedSongs = useMemo(() => {
    if (!currentSong) return [];

    // Get songs with the same artist
    const sameArtist = songs.filter(song =>
      song.artist === currentSong.artist && song.id !== currentSong.id
    );

    // Add more songs to make up at least 10 suggestions
    let suggestions = [...sameArtist];

    if (suggestions.length < 10) {
      // Add some other songs to reach at least 10 suggestions
      const otherSongs = songs.filter(song =>
        !suggestions.includes(song) && song.id !== currentSong.id
      ).slice(0, 10 - suggestions.length);

      suggestions = [...suggestions, ...otherSongs];
    }

    return suggestions;
  }, [currentSong]);

  // Handle song selection with expanded view
  const handleSongClick = useCallback((songIndex: number) => {
    handleSongSelect(songIndex);
    setShowExpandedCard(true);
  }, [handleSongSelect]);

  // Handle genre selection
  const handleGenreClick = useCallback((genre: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSelectedGenre(genre);
    resetOtherPages(['genre']);
  }, [resetOtherPages]);

  // Handle closing the genre page
  const handleCloseGenrePage = useCallback(() => {
    setSelectedGenre(null);
  }, []);

  // Handle playlist selection
  const handlePlaylistClick = useCallback((playlist: string) => {
    setSelectedPlaylist(playlist);
    resetOtherPages(['playlist']);
  }, [resetOtherPages]);

  // Handle closing the playlist page
  const handleClosePlaylistPage = useCallback(() => {
    setSelectedPlaylist(null);
  }, []);

  // Add event listener for custom navigation event
  useEffect(() => {
    const handleNavigateToPlaylist = (e: CustomEvent) => {
      if (e.detail && e.detail.playlistName) {
        setSelectedPlaylist(e.detail.playlistName);
        resetOtherPages(['playlist']);
      }
    };

    window.addEventListener('navigate-to-playlist', handleNavigateToPlaylist as EventListener);

    return () => {
      window.removeEventListener('navigate-to-playlist', handleNavigateToPlaylist as EventListener);
    };
  }, [resetOtherPages]);

  // Add event listener for volume card
  useEffect(() => {
    const handleOpenVolumeCard = () => {
      setShowVolumeCard(true);
    };

    window.addEventListener('open-volume-card', handleOpenVolumeCard);

    return () => {
      window.removeEventListener('open-volume-card', handleOpenVolumeCard);
    };
  }, []);

  // Handle volume card close
  const handleCloseVolumeCard = useCallback(() => {
    setShowVolumeCard(false);
  }, []);

  // Handle liked songs click
  const handleLikedSongsClick = useCallback(() => {
    console.log('Liked Songs clicked, setting showLikedSongs to true');
    setShowLikedSongs(true);
    resetOtherPages(['likedSongs']);
  }, [resetOtherPages]);

  // Handle closing liked songs page
  const handleCloseLikedSongsPage = useCallback(() => {
    setShowLikedSongs(false);
  }, []);

  // Handle saves click
  const handleSavesClick = useCallback(() => {
    setShowSaves(true);
    resetOtherPages(['saves']);
  }, [resetOtherPages]);

  // Handle closing saves page
  const handleCloseSavesPage = useCallback(() => {
    setShowSaves(false);
  }, []);

  // Handle albums click
  const handleAlbumsClick = useCallback(() => {
    setShowAlbums(true);
    resetOtherPages(['albums']);
  }, [resetOtherPages]);

  // Handle closing albums page
  const handleCloseAlbumsPage = useCallback(() => {
    setShowAlbums(false);
  }, []);



  // Handle artists click
  const handleArtistsClick = useCallback(() => {
    setShowArtists(true);
    resetOtherPages(['artists']);
  }, [resetOtherPages]);

  // Handle closing artists page
  const handleCloseArtistsPage = useCallback(() => {
    setShowArtists(false);
  }, []);

  // Handle liking/unliking songs
  const handleToggleLike = useCallback((songId: number) => {
    setLikedSongs(prev => {
      const newLikedSongs = new Set(prev);
      if (newLikedSongs.has(songId)) {
        newLikedSongs.delete(songId);
      } else {
        newLikedSongs.add(songId);
      }
      return newLikedSongs;
    });
  }, []);

  // Handle saving/unsaving songs
  const handleToggleSave = useCallback((songId: number) => {
    setSavedSongs(prev => {
      const newSavedSongs = new Set(prev);
      if (newSavedSongs.has(songId)) {
        newSavedSongs.delete(songId);
      } else {
        newSavedSongs.add(songId);
      }
      return newSavedSongs;
    });
  }, []);

  // Handle adding song to playlist
  const handleAddToPlaylist = useCallback((playlistName: string) => {
    if (currentSong) {
      setPlaylistSongs(prev => {
        const newPlaylistSongs = new Map<string, Set<number>>(availablePlaylists);
        const playlistSet = new Set(newPlaylistSongs.get(playlistName) || new Set());
        
        if (playlistSet.has(currentSong.id)) {
          // Song already in playlist, show message
          setToast({ message: `"${currentSong.title}" is already in ${playlistName}`, type: 'error' });
        } else {
          // Add song to playlist
          playlistSet.add(currentSong.id);
          newPlaylistSongs.set(playlistName, playlistSet);
          setToast({ message: `"${currentSong.title}" added to ${playlistName}`, type: 'success' });
        }
        
        return newPlaylistSongs;
      });
    }
  }, [currentSong]);

  // Handle creating new playlist
  const handleCreatePlaylist = useCallback((playlistName: string, description: string) => {
    if (playlistName.trim()) {
      setPlaylistSongs(prev => {
        const newPlaylistSongs = new Map<string, Set<number>>(availablePlaylists);
        
        if (newPlaylistSongs.has(playlistName)) {
          // Playlist already exists
          setToast({ message: `Playlist "${playlistName}" already exists`, type: 'error' });
        } else {
          // Create new playlist
          const newPlaylistSet = new Set<number>();
          if (currentSong) {
            newPlaylistSet.add(currentSong.id);
          }
          newPlaylistSongs.set(playlistName, newPlaylistSet);
          
          const message = currentSong 
            ? `Created "${playlistName}" and added "${currentSong.title}"`
            : `Created playlist "${playlistName}"`;
          setToast({ message, type: 'success' });
        }
        
        return newPlaylistSongs;
      });
    }
  }, [currentSong]);

  // Handle shuffling the queue with toast notification
  const handleShuffleQueueWithToast = useCallback(() => {
    shuffleQueue();
    setToast({ message: 'Queue shuffled!', type: 'success' });
  }, [shuffleQueue]);

  // Handle clearing the queue with toast notification
  const handleClearQueueWithToast = useCallback(() => {
    clearQueue();
    setToast({ message: 'Queue cleared!', type: 'success' });
  }, [clearQueue]);

  // Create refs for scroll containers
  const newReleasesScrollRef = useRef<HTMLDivElement>(null);
  const recentlyPlayedScrollRef = useRef<HTMLDivElement>(null);

  // Scroll functions for New Releases
  const scrollNewReleasesLeft = useCallback(() => {
    if (newReleasesScrollRef.current) {
      newReleasesScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollNewReleasesRight = useCallback(() => {
    if (newReleasesScrollRef.current) {
      newReleasesScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Scroll functions for Recently Played
  const scrollRecentlyPlayedLeft = useCallback(() => {
    if (recentlyPlayedScrollRef.current) {
      recentlyPlayedScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRecentlyPlayedRight = useCallback(() => {
    if (recentlyPlayedScrollRef.current) {
      recentlyPlayedScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Memoize the sections to prevent unnecessary re-renders
  const renderNewReleases = useCallback(() => (
    <section className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-5 px-4 sm:px-0 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">New Releases</h2>
        
        {/* Mobile-only slider controls */}
        <div className="flex items-center gap-3 sm:hidden">
          <button
            onClick={scrollNewReleasesLeft}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-lg border border-gray-200 touch-manipulation flex-shrink-0"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={scrollNewReleasesRight}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-lg border border-gray-200 touch-manipulation flex-shrink-0"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
      <div className="relative scroll-container group">
        <div 
          ref={newReleasesScrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide px-4 sm:px-0"
        >
          {songs.slice(0, 6).map((song) => (
            <div key={song.id} className="flex-shrink-0 w-[140px] sm:w-[170px]" onClick={() => handleSongClick(song.id - 1)}>
              <div className="rounded-xl overflow-hidden bg-gray-50 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover-card-animation">
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-2.5 sm:mb-3">
                  <Image
                    src={song.cover}
                    alt={`${song.title} by ${song.artist}`}
                    width={170}
                    height={170}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-medium text-xs sm:text-sm mb-1 truncate text-gray-800">{song.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ), [handleSongClick, scrollNewReleasesLeft, scrollNewReleasesRight]);

  // Memoize the Recently Played section - mobile optimized
  const renderRecentlyPlayed = useCallback(() => {
    // Only show the section if there are recently played songs
    if (recentlyPlayed.length === 0) return null;

    return (
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5 px-4 sm:px-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recently Played</h2>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={scrollRecentlyPlayedLeft}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-lg border border-gray-200"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={scrollRecentlyPlayedRight}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-lg border border-gray-200"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative scroll-container group">


          <div 
            ref={recentlyPlayedScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide px-4 sm:px-0"
          >
            {recentlyPlayed.map((songIndex) => {
              const song = songs[songIndex];
              return (
                <div key={`recent-${song.id}`} className="flex-shrink-0 w-[140px] sm:w-[170px]" onClick={() => handleSongClick(songIndex)}>
                  <div className="rounded-xl overflow-hidden bg-gray-50 p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover-card-animation">
                    <div className="w-full aspect-square rounded-lg overflow-hidden mb-2.5 sm:mb-3">
                      <Image
                        src={song.cover}
                        alt={`${song.title} by ${song.artist}`}
                        width={170}
                        height={170}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-medium text-xs sm:text-sm mb-1 truncate text-gray-800">{song.title}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">{song.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }, [recentlyPlayed, handleSongClick, scrollRecentlyPlayedLeft, scrollRecentlyPlayedRight]);

  // Add these handler functions
  const handleShuffleToggle = (shuffleOn: boolean) => {
    setIsShuffleOn(shuffleOn);
  };

  const handleRepeatModeChange = (mode: number) => {
    setRepeatMode(mode);
  };

  const handleAutoplayToggle = (autoplayOn: boolean) => {
    setIsAutoplayOn(autoplayOn);
  };

  // Add audio ended event listener to handle repeat and shuffle modes
  const handleEndedRef = useRef<(() => void) | null>(null);

  // Create a stable callback for handling audio end
  const handleAudioEnded = useCallback(() => {
    try {
      if (repeatMode === 2) {
        // Repeat one: replay the same song
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          // Don't call play() directly, let the hook handle it
          // The isPlaying state is already true, so the hook will restart playback
        }
      } else if (repeatMode === 1 || isShuffleOn) {
        // Repeat all or shuffle: go to next song
        if (isShuffleOn) {
          // Get random song that's not the current one
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * songs.length);
          } while (randomIndex === currentSongIndex && songs.length > 1);
          handleSongSelect(randomIndex);
        } else {
          // Just play next song
          nextSong();
        }
      } else if (isAutoplayOn) {
        // Autoplay is on: continue to next song or stop at end
        if (currentSongIndex === songs.length - 1) {
          setIsPlaying(false);
        } else {
          nextSong();
        }
      } else {
        // Autoplay is off: stop playback after current song
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Error in handleEnded:", err);
    }
  }, [repeatMode, isShuffleOn, isAutoplayOn, currentSongIndex, nextSong, handleSongSelect, setIsPlaying, audioRef]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      const audio = audioRef.current;

      // Remove previous listener if exists
      if (handleEndedRef.current) {
        audio.removeEventListener('ended', handleEndedRef.current);
      }

      handleEndedRef.current = handleAudioEnded;
      audio.addEventListener('ended', handleAudioEnded);

      return () => {
        if (handleEndedRef.current) {
          audio.removeEventListener('ended', handleEndedRef.current);
        }
      };
    }
  }, [audioRef, currentSong, handleAudioEnded]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 p-1 sm:p-2 md:p-3">
      {/* Mobile overlay */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}
      
      {/* Sidebar - mobile optimized */}
      <aside
        ref={sidebarRef}
        className={`${isSidebarVisible ? 'translate-x-0 w-72' : '-translate-x-full sm:translate-x-0 sm:w-16'} 
        transition-all duration-300 ease-out fixed sm:static z-50 sm:z-20 group 
        flex flex-col bg-black text-gray-200 h-full sm:h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] 
        flex-shrink-0 overflow-hidden rounded-none sm:rounded-xl md:rounded-2xl mr-0 shadow-lg hover:w-60 sm:hover:w-60`}
        onMouseLeave={handleSidebarMouseLeave}
      >
        {/* Logo - mobile optimized */}
        <div className="p-3 sm:p-2.5 mb-4 sm:mb-6 flex items-center justify-between w-full">
          <div className="flex items-center">
            <button
              className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-all cursor-pointer"
              aria-label="Home"
              onClick={(e) => {
                e.preventDefault();
                resetOtherPages([]);
                if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                  setIsSidebarVisible(false);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </button>
            <span className={`ml-3 text-lg font-medium transition-opacity duration-300 text-gray-200 ${isSidebarVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} whitespace-nowrap overflow-hidden`}>Library</span>
          </div>
          
          {/* Mobile close button */}
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

        {/* Navigation section */}
        <div className="flex flex-col gap-1 px-2 overflow-y-auto flex-grow scrollbar-hide">
          {/* Navigation icons - optimized to show in both collapsed/expanded states */}
          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
            }
            label="Playlists"
            onClick={(e) => {
              e.preventDefault();
              toggleDropdown('playlists');
            }}
            isDropdown
            isActive={openDropdown === 'playlists'}
            delay={100}
            isSidebarOpen={isSidebarVisible}
          >
            <div className="ml-7 space-y-1 overflow-hidden">
              <a
                href="#"
                className="flex items-center px-2.5 py-1.5 text-sm rounded-lg hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handlePlaylistClick("Top Hits 2025");
                  if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                    setIsSidebarVisible(false);
                  }
                }}
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 mr-2"></div>
                <span className={`transition-opacity duration-300 text-gray-200 ${isSidebarVisible || openDropdown === 'playlists' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Top Hits 2025</span>
              </a>
              <a
                href="#"
                className="flex items-center px-2.5 py-1.5 text-sm rounded-lg hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handlePlaylistClick("Chill Vibes");
                  if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                    setIsSidebarVisible(false);
                  }
                }}
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-teal-500 flex-shrink-0 mr-2"></div>
                <span className={`transition-opacity duration-300 text-gray-200 ${isSidebarVisible || openDropdown === 'playlists' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Chill Vibes</span>
              </a>
              <a
                href="#"
                className="flex items-center px-2.5 py-1.5 text-sm rounded-lg hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handlePlaylistClick("Party Mix");
                  if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                    setIsSidebarVisible(false);
                  }
                }}
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-red-500 flex-shrink-0 mr-2"></div>
                <span className={`transition-opacity duration-300 text-gray-200 ${isSidebarVisible || openDropdown === 'playlists' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Party Mix</span>
              </a>
            </div>
          </NavItem>

          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto my-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            }
            label="Liked Songs"
            onClick={(e) => {
              if (e) e.preventDefault();
              handleLikedSongsClick();
              if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                setIsSidebarVisible(false);
              }
            }}
            isSidebarOpen={isSidebarVisible}
          />

          {/* Remaining NavItems with the mobile closing functionality added */}
          <NavItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            }
            label="Saves"
            delay={200}
            onClick={(e) => {
              if (e) e.preventDefault();
              handleSavesClick();
              if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                setIsSidebarVisible(false);
              }
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
            onClick={(e) => {
              if (e) e.preventDefault();
              handleAlbumsClick();
              if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                setIsSidebarVisible(false);
              }
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
            onClick={(e) => {
              if (e) e.preventDefault();
              handleArtistsClick();
              if (window.innerWidth < 640) { // sm breakpoint in Tailwind
                setIsSidebarVisible(false);
              }
            }}
            isSidebarOpen={isSidebarVisible}
          />
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setIsSidebarVisible(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content wrapper - changed min-width-0 to ensure it doesn't overflow when sidebar expands */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header area - remains outside the rounded container */}
        <header className="flex items-center justify-between p-1.5 md:p-3 mb-1">
          <div className="flex items-center gap-2.5">
            {/* Library toggle button - only visible on mobile */}
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center focus:outline-none text-neutral-600 hover:text-neutral-900 transition-colors"
              onClick={toggleSidebar}
              aria-label={isSidebarVisible ? "Close library" : "Open library"}
              aria-expanded={isSidebarVisible}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <h1
              className="text-2xl font-bold tracking-tight cursor-pointer hover:text-neutral-700 transition-colors text-gray-900 leading-tight flex items-center"
              onClick={() => resetOtherPages([])}
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
            {/* Mobile search button */}
            <button
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900 rounded-full"
              onClick={() => setShowSearchResults(!showSearchResults)}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            
            {/* Search bar - responsive */}
            <div className="hidden sm:relative sm:block sm:w-48 md:w-80 search-container">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-400" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search songs, artists, albums..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-1.5 w-full bg-white text-neutral-800 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-neutral-200 text-sm shadow-sm"
                aria-label="Search"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && filteredSongs.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-neutral-500 px-3 py-2 border-b border-neutral-100">
                      {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}
                    </div>
                    {filteredSongs.slice(0, 10).map((song, index) => (
                      <button
                        key={`${song.title}-${song.artist}-${index}`}
                        onClick={() => handleSearchResultClick(index)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
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
                    {filteredSongs.length > 10 && (
                      <div className="text-xs text-neutral-500 px-3 py-2 text-center border-t border-neutral-100">
                        Showing first 10 results
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* No Results Message */}
              {showSearchResults && filteredSongs.length === 0 && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 z-50">
                  <div className="p-4 text-center text-neutral-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>





            {/* Profile button and popup */}
            <div className="relative" ref={profileRef}>
              <button
                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                onClick={toggleProfile}
                aria-label="User Profile"
                aria-expanded={isProfileOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </button>

              {/* Profile popup */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden z-50 transition-all duration-200 ease-out transform origin-top-right">
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
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-3 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      View Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-3 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-3 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile search overlay */}
        {showSearchResults && (
          <div className="sm:hidden fixed inset-0 bg-white z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  aria-label="Close search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search songs, artists, albums..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-3 w-full bg-gray-50 text-neutral-800 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-neutral-200 text-base"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredSongs.length > 0 ? (
                <div className="p-4">
                  <div className="text-sm font-medium text-neutral-500 mb-4">
                    {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}
                  </div>
                  {filteredSongs.map((song, index) => (
                    <button
                      key={`mobile-${song.title}-${song.artist}-${index}`}
                      onClick={() => {
                        handleSearchResultClick(index);
                        setShowSearchResults(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={song.cover}
                          alt={song.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base text-neutral-900 truncate">{song.title}</div>
                        <div className="text-sm text-neutral-600 truncate">{song.artist} • {song.album}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-neutral-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-neutral-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p>Try searching with different keywords</p>
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-neutral-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Search your music</p>
                  <p>Find songs, artists, and albums</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fixed content container with rounded borders - mobile optimized */}
        <div className="flex-1 flex flex-col mx-0 sm:mx-1 md:mx-3 lg:mx-6 mb-0 sm:mb-1 md:mb-3 lg:mb-6 bg-white rounded-none sm:rounded-xl md:rounded-2xl shadow-none sm:shadow-md overflow-hidden border-0 sm:border sm:border-gray-100">
          {/* Main content area - conditionally render various pages */}
          {selectedGenre ? (
            <GenrePage
              genreName={selectedGenre}
              onClose={handleCloseGenrePage}
              onSongSelect={handleSongSelect}
            />
          ) : selectedPlaylist ? (
            <PlaylistPage
              playlistName={selectedPlaylist}
              onClose={handleClosePlaylistPage}
              onSongSelect={handleSongSelect}
              playlistSongs={playlistSongs.get(selectedPlaylist)}
            />
          ) : showLikedSongs ? (
            <LikedSongsPage
              onClose={handleCloseLikedSongsPage}
              onSongSelect={handleSongSelect}
              likedSongs={Array.from(likedSongs)}
              isPlaying={isPlaying}
              currentSong={currentSong}
            />
          ) : showSaves ? (
            <SavesPage
              onClose={handleCloseSavesPage}
              onSongSelect={handleSongSelect}
              savedSongs={Array.from(savedSongs)}
              isPlaying={isPlaying}
              currentSong={currentSong}
            />
          ) : showAlbums ? (
            <AlbumsPage
              onClose={handleCloseAlbumsPage}
              onSongSelect={handleSongSelect}
              isPlaying={isPlaying}
              currentSong={currentSong}
            />
          ) : showArtists ? (
            <ArtistsPage
              onClose={handleCloseArtistsPage}
              onSongSelect={handleSongSelect}
            />
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="p-3 sm:p-4 md:p-6">
                {/* Render optimized sections */}
                {renderNewReleases()}

                {/* Recently Played section */}
                {renderRecentlyPlayed()}

                {/* Featured playlists section - mobile optimized */}
                <section className="mb-6 sm:mb-8 px-4 sm:px-0">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-800">Featured Playlists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                    <div
                      className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover-card-animation"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePlaylistClick("Top Hits 2025");
                      }}
                    >
                      <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3 shadow-sm bg-gradient-to-br from-purple-400 to-pink-500"></div>
                      <h3 className="font-medium text-xs sm:text-sm mb-1 truncate text-gray-800">Top Hits 2025</h3>
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate">The hottest tracks right now</p>
                    </div>
                    <div
                      className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover-card-animation"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePlaylistClick("Chill Vibes");
                      }}
                    >
                      <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3 shadow-sm bg-gradient-to-br from-blue-400 to-teal-500"></div>
                      <h3 className="font-medium text-xs sm:text-sm mb-1 truncate text-gray-800">Chill Vibes</h3>
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate">Relaxing tunes to unwind</p>
                    </div>
                    <div
                      className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover-card-animation"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePlaylistClick("Party Mix");
                      }}
                    >
                      <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3 shadow-sm bg-gradient-to-br from-amber-400 to-red-500"></div>
                      <h3 className="font-medium text-xs sm:text-sm mb-1 truncate text-gray-800">Party Mix</h3>
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate">Upbeat tracks for your party</p>
                    </div>
                  </div>
                </section>

                {/* Featured Artist - mobile optimized */}
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 overflow-hidden shadow-sm mx-4 sm:mx-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex-1">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center mb-2 sm:mb-3">
                            <span className="bg-blue-50 text-blue-600 text-xs px-2 sm:px-3 py-1 rounded-full font-medium">Featured artist</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 leading-tight">{currentSong?.artist || "Featured Artist"}</h2>
                          <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm">Trending with &quot;{currentSong?.title}&quot;</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gray-800 text-white rounded-full flex items-center justify-center gap-1 sm:gap-2 font-medium text-sm hover:bg-gray-700 transition-colors"
                            onClick={handlePlayPause}
                            aria-label={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                                <span className="sm:inline hidden">Pause</span>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                </svg>
                                <span className="sm:inline hidden">Play</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/5 w-full relative overflow-hidden md:h-auto bg-gray-100">
                      {currentSong?.cover ? (
                        <Image
                          src={currentSong.cover}
                          alt={`${currentSong.artist} cover`}
                          width={600}
                          height={600}
                          className="w-full h-full object-cover aspect-square md:aspect-auto min-h-[180px] sm:min-h-[200px] md:min-h-[300px]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[180px] sm:min-h-[200px] md:min-h-[300px] bg-gradient-to-br from-gray-200 to-gray-300"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="pb-24">
                  {/* Popular Tracks - mobile optimized */}
                  <section className="mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-5 text-gray-800">Popular</h2>
                    <div className="bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
                      {songs.slice(0, 8).map((song, index) => (
                        <div
                          key={song.id}
                          className={`flex items-center p-3 sm:p-4 ${song.id - 1 === currentSongIndex ? 'bg-neutral-100' : ''} hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0`}
                          onClick={() => handleSongClick(song.id - 1)}
                        >
                          <div className="mr-3 sm:mr-5 text-neutral-400 w-4 sm:w-5 text-center font-medium text-xs sm:text-sm">{index + 1}</div>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                            <Image src={song.cover} alt={song.title} width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-0.5 sm:mb-1 text-sm sm:text-base truncate text-gray-800">{song.title}</h3>
                            <p className="text-xs sm:text-sm text-neutral-500 truncate">{song.artist}</p>
                          </div>
                          <div className="text-xs sm:text-sm text-neutral-500 mr-2 sm:mr-4 hidden xs:block">{song.duration}</div>
                          <button
                            className="text-neutral-400 hover:text-neutral-700 transition-colors p-1.5 sm:p-2"
                            aria-label={`Like ${song.title}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Music card sections - mobile optimized */}
                  <div className="grid grid-cols-1 gap-6 sm:gap-10 px-4 sm:px-0">
                    {/* Picked for you */}
                    <section>
                      <div className="mb-4 md:mb-5">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recommended for you</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                        {songs.slice(8, 20).map((song) => (
                          <div
                            key={song.id}
                            className="bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover-card-animation"
                            onClick={() => handleSongClick(song.id - 1)}
                          >
                            <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-sm">
                              <Image src={song.cover} alt={song.title} width={200} height={200} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <h3 className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate text-gray-800">{song.title}</h3>
                            <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{song.artist}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Genres - mobile optimized */}
                    <section>
                      <div className="mb-4 md:mb-5">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Explore Genres</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                        {[
                          { name: "Pop", color: "bg-gradient-to-br from-pink-400 to-red-500", songs: songs.filter(s => ["Katy Perry", "David Kushner", "Lady Gaga & Bruno Mars", "Harry Styles"].includes(s.artist)) },
                          { name: "Rock", color: "bg-gradient-to-br from-red-400 to-amber-500", songs: songs.filter(s => ["Bastille", "KALEO", "OneRepublic"].includes(s.artist)) },
                          { name: "Indie", color: "bg-gradient-to-br from-emerald-400 to-cyan-500", songs: songs.filter(s => ["Girl in Red", "Hollow Coves", "Lord Huron"].includes(s.artist)) },
                          { name: "Electronic", color: "bg-gradient-to-br from-blue-400 to-indigo-500", songs: songs.filter(s => ["Eiffel 65", "The Neighbourhood", "Cigarettes After Sex"].includes(s.artist)) },
                          { name: "Acoustic", color: "bg-gradient-to-br from-violet-400 to-purple-500", songs: songs.filter(s => ["Vance Joy", "SYML", "Tom Rosenthal"].includes(s.artist)) },
                          { name: "Alternative", color: "bg-gradient-to-br from-amber-400 to-yellow-500", songs: songs.filter(s => ["New West", "The Rare Occasions", "Dr. Dog"].includes(s.artist)) }
                        ].map((genre, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden relative h-20 sm:h-24 md:h-36 group"
                            onClick={(e) => {
                              e.preventDefault();
                              handleGenreClick(genre.name);
                            }}
                          >
                            <div className={`absolute inset-0 ${genre.color} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                            <div className="absolute bottom-2 sm:bottom-3 md:bottom-5 left-2 sm:left-3 md:left-5">
                              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">{genre.name}</h3>
                              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{genre.songs.length} songs</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Recently Added - mobile optimized */}
                    <section>
                      <div className="mb-4 md:mb-5">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recently Added</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                        {songs.slice(20, 32).map((song) => (
                          <div
                            key={song.id}
                            className="bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover-card-animation"
                            onClick={() => handleSongClick(song.id - 1)}
                          >
                            <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-sm">
                              <Image src={song.cover} alt={song.title} width={200} height={200} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <h3 className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate text-gray-800">{song.title}</h3>
                            <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{song.artist}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Now playing bar - fixed at bottom of container */}
          <div className="flex-shrink-0 bg-none">
            <NowPlayingBar
              currentSong={currentSong}
              isPlaying={isPlaying}
              progress={progress}
              duration={duration}
              volume={volume}
              isLiked={likedSongs.has(currentSong.id)}
              isSaved={savedSongs.has(currentSong.id)}
              onPlayPause={handlePlayPause}
              onNext={nextSong}
              onPrevious={previousSong}
              onProgressChange={handleProgressChange}
              onVolumeChange={handleVolumeChange}
              onExpand={handleExpandCard}
              onToggleLike={() => handleToggleLike(currentSong.id)}
              onToggleSave={() => handleToggleSave(currentSong.id)}
            />
          </div>
        </div>
      </div>

      {/* Expanded Song Card */}
      {showExpandedCard && currentSong && (
        <ExpandedSongCard
          song={currentSong!}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          progressPercentage={
            isFinite(progress) && isFinite(duration) && duration > 0
              ? Math.max(0, Math.min(100, (progress / duration) * 100))
              : 0
          }
          suggestedSongs={queueSongs}
          onPlayPause={handlePlayPause}
          onNext={nextSong}
          onPrevious={previousSong}
          onProgressChange={handleProgressChange}
          onVolumeChange={handleVolumeChange}
          onClose={handleCloseExpandedCard}
          onSelectSong={handleSongSelect}
          onShuffleToggle={handleShuffleToggle}
          onRepeatModeChange={handleRepeatModeChange}
          onAutoplayToggle={handleAutoplayToggle}
          isShuffleOn={isShuffleOn}
          repeatMode={repeatMode}
          isAutoplayOn={isAutoplayOn}
          isLiked={likedSongs.has(currentSong.id)}
          isSaved={savedSongs.has(currentSong.id)}
          onToggleLike={() => handleToggleLike(currentSong.id)}
          onToggleSave={() => handleToggleSave(currentSong.id)}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          availablePlaylists={Array.from(playlistSongs.keys())}
          onShuffleQueue={handleShuffleQueueWithToast}
          onClearQueue={handleClearQueueWithToast}
          onRemoveFromQueue={handleRemoveFromQueue}
        />
      )}

      {/* Volume Card */}
      <VolumeCard
        volume={volume}
        onChange={handleVolumeChange}
        isVisible={showVolumeCard}
        onClose={handleCloseVolumeCard}
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

      {/* Audio Element */}
      <audio ref={audioRef} />
</div>

  );
}
