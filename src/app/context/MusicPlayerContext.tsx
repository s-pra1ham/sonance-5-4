'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '../data/songs';

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Song[];
  recentlyPlayed: Song[];
  likedSongs: Song[];
  savedSongs: Song[];
  playlistSongs: { [playlistName: string]: Song[] };
  isShuffleOn: boolean;
  repeatMode: number; // 0: off, 1: repeat all, 2: repeat one
  isAutoplayOn: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
  playSong: (song: Song, songsList?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  adjustVolume: (volume: number) => void;
  toggleLike: (song: Song) => void;
  toggleSave: (song: Song) => void;
  addToPlaylist: (playlistName: string, song: Song) => void;
  removeFromPlaylist: (playlistName: string, songId: string) => void;
  createPlaylist: (playlistName: string) => void;
  clearQueue: () => void;
  shuffleQueue: () => void;
  removeFromQueue: (index: number) => void;
  toggleShuffle: () => void;
  changeRepeatMode: (mode: number) => void;
  toggleAutoplay: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<{ [playlistName: string]: Song[] }>({
    'Top Hits 2025': [],
    'Chill Vibes': [],
    'Party Mix': [],
  });

  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: repeat all, 2: repeat one
  const [isAutoplayOn, setIsAutoplayOn] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load state from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedLiked = localStorage.getItem('sonance_liked');
        if (storedLiked) setLikedSongs(JSON.parse(storedLiked));

        const storedSaved = localStorage.getItem('sonance_saved');
        if (storedSaved) setSavedSongs(JSON.parse(storedSaved));

        const storedPlaylists = localStorage.getItem('sonance_playlists');
        if (storedPlaylists) setPlaylistSongs(JSON.parse(storedPlaylists));

        const storedVolume = localStorage.getItem('sonance_volume');
        if (storedVolume) {
          const parsedVolume = parseFloat(storedVolume);
          setVolume(parsedVolume);
          if (audioRef.current) audioRef.current.volume = parsedVolume;
        }

        const storedRecent = localStorage.getItem('sonance_recent');
        if (storedRecent) setRecentlyPlayed(JSON.parse(storedRecent));
      } catch (e) {
        console.error('Error loading state from localStorage:', e);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  const saveState = (key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Audio setup and events
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      // Throttle or simply update state
      setProgress(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // Track playback time when playing
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying]);

  // Handle source changes on currentSong change
  useEffect(() => {
    if (audioRef.current && currentSong) {
      const audio = audioRef.current;
      if (audio.src !== currentSong.audioSrc) {
        audio.src = currentSong.audioSrc;
        audio.load();
        setProgress(0);
      }

      if (isPlaying) {
        audio.play().catch((err) => {
          console.error('Error during playback play():', err);
        });
      }
    }
  }, [currentSong, isPlaying]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio Ended handler
  const nextSong = useCallback(() => {
    if (queue.length === 0 || !currentSong) return;

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    
    if (repeatMode === 2) {
      // Repeat one
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error(e));
      }
      return;
    }

    let nextIndex = -1;

    if (isShuffleOn) {
      // Play a random song
      if (queue.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentIndex);
      } else {
        nextIndex = 0;
      }
    } else {
      // Play next song in order
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 1) {
        // Repeat all: loop back to start
        nextIndex = 0;
      }
    }

    if (nextIndex !== -1 && queue[nextIndex]) {
      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
    } else {
      // No next song, stop playing at the end of the queue
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setProgress(0);
    }
  }, [queue, currentSong, isShuffleOn, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
      } else {
        nextSong();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextSong, repeatMode]);

  const prevSong = useCallback(() => {
    if (queue.length === 0 || !currentSong) return;

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    let prevIndex = -1;

    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    } else if (repeatMode === 1) {
      prevIndex = queue.length - 1;
    }

    if (prevIndex !== -1 && queue[prevIndex]) {
      setCurrentSong(queue[prevIndex]);
      setIsPlaying(true);
    } else {
      // Replay the current song if there's no previous
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setProgress(0);
      }
    }
  }, [queue, currentSong, repeatMode]);

  const playSong = useCallback((song: Song, songsList?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);

    // Update queue
    if (songsList && songsList.length > 0) {
      setQueue(songsList);
    } else {
      // If no list is provided, create a queue of one song
      setQueue([song]);
    }

    // Add to recently played
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 10);
      saveState('sonance_recent', updated);
      return updated;
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong && queue.length > 0) {
      // Play first song in queue if none selected
      setCurrentSong(queue[0]);
      setIsPlaying(true);
    } else if (currentSong) {
      setIsPlaying(prev => {
        const nextState = !prev;
        if (audioRef.current) {
          if (nextState) {
            audioRef.current.play().catch(err => console.error(err));
          } else {
            audioRef.current.pause();
          }
        }
        return nextState;
      });
    }
  }, [currentSong, queue]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const adjustVolume = useCallback((newVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(safeVolume);
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('sonance_volume', String(safeVolume));
    }
  }, []);

  const toggleLike = useCallback((song: Song) => {
    setLikedSongs((prev) => {
      let updated;
      const exists = prev.some((s) => s.id === song.id);
      if (exists) {
        updated = prev.filter((s) => s.id !== song.id);
        setToast({ message: `"${song.title}" removed from Liked Songs`, type: 'success' });
      } else {
        updated = [...prev, song];
        setToast({ message: `"${song.title}" added to Liked Songs`, type: 'success' });
      }
      saveState('sonance_liked', updated);
      return updated;
    });
  }, []);

  const toggleSave = useCallback((song: Song) => {
    setSavedSongs((prev) => {
      let updated;
      const exists = prev.some((s) => s.id === song.id);
      if (exists) {
        updated = prev.filter((s) => s.id !== song.id);
        setToast({ message: `"${song.title}" removed from Saves`, type: 'success' });
      } else {
        updated = [...prev, song];
        setToast({ message: `"${song.title}" added to Saves`, type: 'success' });
      }
      saveState('sonance_saved', updated);
      return updated;
    });
  }, []);

  const createPlaylist = useCallback((playlistName: string) => {
    if (!playlistName.trim()) return;

    setPlaylistSongs((prev) => {
      if (prev[playlistName]) {
        setToast({ message: `Playlist "${playlistName}" already exists`, type: 'error' });
        return prev;
      }
      const updated = { ...prev, [playlistName]: [] };
      saveState('sonance_playlists', updated);
      setToast({ message: `Created playlist "${playlistName}"`, type: 'success' });
      return updated;
    });
  }, []);

  const addToPlaylist = useCallback((playlistName: string, song: Song) => {
    setPlaylistSongs((prev) => {
      const list = prev[playlistName] || [];
      const exists = list.some((s) => s.id === song.id);
      if (exists) {
        setToast({ message: `"${song.title}" is already in ${playlistName}`, type: 'error' });
        return prev;
      }
      const updated = { ...prev, [playlistName]: [...list, song] };
      saveState('sonance_playlists', updated);
      setToast({ message: `"${song.title}" added to ${playlistName}`, type: 'success' });
      return updated;
    });
  }, []);

  const removeFromPlaylist = useCallback((playlistName: string, songId: string) => {
    setPlaylistSongs((prev) => {
      const list = prev[playlistName] || [];
      const updatedList = list.filter((s) => s.id !== songId);
      const updated = { ...prev, [playlistName]: updatedList };
      saveState('sonance_playlists', updated);
      setToast({ message: `Song removed from ${playlistName}`, type: 'success' });
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setToast({ message: 'Queue cleared!', type: 'success' });
  }, []);

  const shuffleQueue = useCallback(() => {
    if (queue.length > 0) {
      setQueue((prev) => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5);
        // Ensure current song is still in the queue if playing
        if (currentSong && !shuffled.some(s => s.id === currentSong.id)) {
          shuffled.unshift(currentSong);
        }
        return shuffled;
      });
      setToast({ message: 'Queue shuffled!', type: 'success' });
    }
  }, [queue.length, currentSong]);

  const removeFromQueue = useCallback((indexToRemove: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleOn(prev => !prev);
  }, []);

  const changeRepeatMode = useCallback((mode: number) => {
    setRepeatMode(mode);
  }, []);

  const toggleAutoplay = useCallback(() => {
    setIsAutoplayOn(prev => !prev);
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        queue,
        recentlyPlayed,
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
        removeFromPlaylist,
        createPlaylist,
        clearQueue,
        shuffleQueue,
        removeFromQueue,
        toggleShuffle,
        changeRepeatMode,
        toggleAutoplay,
        audioRef,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayerContext() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayerContext must be used within a MusicPlayerProvider');
  }
  return context;
}
