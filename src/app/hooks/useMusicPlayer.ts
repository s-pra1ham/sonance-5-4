'use client';

import { useState, useRef, useEffect, RefObject, useCallback } from 'react';
import { Song } from '../data/songs';

export function useMusicPlayer(songs: Song[], externalAudioRef?: RefObject<HTMLAudioElement | null>) {
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [recentlyPlayed, setRecentlyPlayed] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastProgressUpdate = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  
  // Use the external audio ref if provided, otherwise use the internal one
  const audioRef = externalAudioRef || internalAudioRef;

  const addToRecentlyPlayed = useCallback((song: Song) => {
    const index = songs.findIndex(s => s.id === song.id);
    if (index !== -1) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(songIndex => songIndex !== index);
        return [index, ...filtered].slice(0, 10);
      });
    }
  }, [songs]);

  useEffect(() => {
    // Populate recently played on initial load
    if (songs.length > 0) {
      setRecentlyPlayed(songs.slice(0, 10).map(s => s.id - 1));
      // Initialize queue with all songs except the first one (current song)
      setQueue(songs.slice(1).map(s => s.id - 1));
    }
  }, [songs]);

  // Handle time updates from the audio element with throttling
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const now = performance.now();
      
      // Update the ref immediately for internal tracking
      progressRef.current = currentTime;
      
      // Throttle state updates to prevent excessive re-renders
      if (now - lastProgressUpdate.current > 16) { // ~60fps
        setProgress(currentTime);
        lastProgressUpdate.current = now;
      }
    }
  }, [audioRef]);



  // Helper function to convert duration string to seconds
  const parseDuration = useCallback((durationStr: string): number => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    return 0;
  }, []);

  useEffect(() => {
    // Initialize audio element only once
    if (!audioRef.current) {
      const audio = new Audio();
      if (externalAudioRef) {
        externalAudioRef.current = audio;
      } else {
        internalAudioRef.current = audio;
      }
      audioRef.current = audio;

      // Add event listeners once
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', () => {
        if (audioRef.current && isFinite(audioRef.current.duration)) {
          const newDuration = audioRef.current.duration;
          durationRef.current = newDuration;
          setDuration(newDuration);
        }
      });
      
      // Add error handler for when audio files don't exist
      audio.addEventListener('error', () => {
        console.warn('Audio file not found, using fallback duration');
        // Use the duration from song data as fallback
        if (currentSongIndex !== null && songs[currentSongIndex]) {
          const fallbackDuration = parseDuration(songs[currentSongIndex].duration);
          durationRef.current = fallbackDuration;
          setDuration(fallbackDuration);
        }
      });
    }
  }, [audioRef, externalAudioRef, handleTimeUpdate, currentSongIndex, songs, parseDuration]);

  useEffect(() => {
    // Update audio source on song change only
    if (audioRef.current && currentSongIndex !== null && songs[currentSongIndex]) {
      const audio = audioRef.current;
      const currentSong = songs[currentSongIndex];
      const newSrc = currentSong.audioSrc;

      if (audio.src !== newSrc) {
        audio.src = newSrc;
        setProgress(0); // Reset progress on new song load
        
        // Set fallback duration immediately from song data
        const fallbackDuration = parseDuration(currentSong.duration);
        durationRef.current = fallbackDuration;
        setDuration(fallbackDuration);
      }
    }
  }, [audioRef, currentSongIndex, songs, parseDuration]);

  // Separate useEffect for play/pause state management
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    isPlayingRef.current = isPlaying;
    
    if (isPlaying) {
      const attemptPlay = async () => {
        try {
          if (audio.readyState >= 2) {
            await audio.play();
          } else {
            const playWhenReady = async () => {
              try {
                await audio.play();
              } catch (err) {
                console.error('Error playing audio:', err);
              }
              audio.removeEventListener('canplay', playWhenReady);
            };
            audio.addEventListener('canplay', playWhenReady);
          }
        } catch (err) {
          console.error('Error playing audio:', err);
        }
      };
      attemptPlay();
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [audioRef, isPlaying]);

  // Separate useEffect for progress tracking using interval instead of animation frame
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      intervalId = setInterval(() => {
        if (audioRef.current && !audioRef.current.error && audioRef.current.readyState >= 2) {
          // Use real audio progress if available
          const currentTime = audioRef.current.currentTime;
          const audioDuration = audioRef.current.duration;
          
          progressRef.current = currentTime;
          setProgress(currentTime);
          
          // Check if song ended
          if (currentTime >= audioDuration) {
            setIsPlaying(false);
            setProgress(audioDuration);
            progressRef.current = audioDuration;
          }
        } else {
          // Fallback: simulate progress when audio files don't exist
          const newProgress = progressRef.current + 1; // 1 second increment
          
          if (newProgress >= durationRef.current) {
            // Song ended, stop playing
            setIsPlaying(false);
            setProgress(durationRef.current);
            progressRef.current = durationRef.current;
          } else {
            progressRef.current = newProgress;
            setProgress(newProgress);
          }
        }
      }, 1000); // Update every second
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [audioRef, isPlaying]);

  useEffect(() => {
    // Handle volume changes
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (currentSongIndex === null) return;
    
    // First pause current playback
    setIsPlaying(false);
    
    // Then change the song after a brief delay to ensure clean transition
    setTimeout(() => {
      // If there are songs in the queue, play the next one from queue
      if (queue.length > 0) {
        const nextSongIndex = queue[0];
        setCurrentSongIndex(nextSongIndex);
        
        // Remove the played song from queue
        setQueue(prev => prev.slice(1));
        
        // Update recently played songs
        if (songs[nextSongIndex]) {
          addToRecentlyPlayed(songs[nextSongIndex]);
        }
      } else {
        // If queue is empty, use default behavior (loop through all songs)
        setCurrentSongIndex((prevIndex) => {
          if (prevIndex === null) return 0;
          
          const newIndex = prevIndex === songs.length - 1 ? 0 : prevIndex + 1;
          
          // Update recently played songs
          if (songs[newIndex]) {
            addToRecentlyPlayed(songs[newIndex]);
          }
          
          return newIndex;
        });
      }
      
      // Start playing the new song after source change
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }, 50);
  }, [currentSongIndex, songs, addToRecentlyPlayed, queue]);

  const handlePrevious = useCallback(() => {
    if (currentSongIndex === null) return;
    
    // First pause current playback
    setIsPlaying(false);
    
    // Then change the song after a brief delay to ensure clean transition
    setTimeout(() => {
      // For previous, we'll use the recently played list or default behavior
      setCurrentSongIndex((prevIndex) => {
        if (prevIndex === null) return 0;
        
        const newIndex = prevIndex === 0 ? songs.length - 1 : prevIndex - 1;
        
        // Update recently played songs
        if (songs[newIndex]) {
          addToRecentlyPlayed(songs[newIndex]);
        }
        
        // Don't add current song back to queue when going previous
        // The queue should remain as is for forward playback
        
        return newIndex;
      });
      
      // Start playing the new song after source change
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }, 50);
  }, [currentSongIndex, songs, addToRecentlyPlayed]);

  const handleProgressChange = useCallback((time: number) => {
    // Validate that time is a finite, non-negative number before setting it
    if (isFinite(time) && time >= 0) {
      const safeTime = Math.min(time, durationRef.current || 0);
      progressRef.current = safeTime;
      setProgress(safeTime);
      if (audioRef.current) {
        audioRef.current.currentTime = safeTime;
      }
    } else {
      console.warn('Invalid time value provided to handleProgressChange:', time);
    }
  }, [audioRef]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    // Only update volume state without affecting any playback
    const safeVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(safeVolume);
    
    // Simply set the volume property without touching any other audio properties
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
  }, [audioRef]);

  const handleSongSelect = useCallback((index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    
    // Update recently played songs
    if (songs[index]) {
      addToRecentlyPlayed(songs[index]);
    }
    
    // Update queue: only add songs that come after the selected song
    // Don't add songs that come before (they've already been played or skipped)
    const newQueue = [];
    for (let i = index + 1; i < songs.length; i++) {
      newQueue.push(i);
    }
    setQueue(newQueue);
  }, [songs, addToRecentlyPlayed]);

  // Queue management functions
  const handleShuffleQueue = useCallback(() => {
    if (queue.length > 0) {
      const shuffledQueue = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffledQueue);
    }
  }, [queue]);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const handleRemoveFromQueue = useCallback((indexToRemove: number) => {
    setQueue(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const getQueueSongs = useCallback(() => {
    return queue.map(songIndex => songs[songIndex]).filter(Boolean);
  }, [queue, songs]);

  return {
    currentSongIndex,
    setCurrentSongIndex,
    isPlaying,
    setIsPlaying, 
    progress,
    setProgress,
    duration,
    volume,
    recentlyPlayed,
    addToRecentlyPlayed,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleProgressChange,
    handleVolumeChange,
    handleSongSelect,
    currentSong: currentSongIndex !== null && songs[currentSongIndex] ? songs[currentSongIndex] : null,
    queue,
    queueSongs: getQueueSongs(),
    handleShuffleQueue,
    handleClearQueue,
    handleRemoveFromQueue
  };
} 