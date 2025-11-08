'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Song } from '../data/songs';
import { formatTime } from '../utils/formatTime';
import { motion } from 'framer-motion';
import VolumeControl from './VolumeControl';

import Image from 'next/image';

interface ExpandedSongCardProps {
  song: Song;
  isPlaying: boolean;
  progress: number;
  duration: number;
  suggestedSongs: Song[];
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onProgressChange: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onSelectSong: (songId: number) => void;
  onShuffleToggle: (isShuffleOn: boolean) => void;
  onRepeatModeChange: (mode: number) => void;
  progressPercentage: number;
  isShuffleOn?: boolean;
  repeatMode?: number;
  isAutoplayOn?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  onAutoplayToggle?: (isAutoplayOn: boolean) => void;
  onAddToPlaylist?: (playlistName: string) => void;
  availablePlaylists?: string[];
  onShuffleQueue?: () => void;
  onClearQueue?: () => void;
  onRemoveFromQueue?: (index: number) => void; 
}

export default function ExpandedSongCard({
  song,
  isPlaying,
  progress,
  duration,
  suggestedSongs,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onProgressChange,
  onVolumeChange,
  onClose,
  onSelectSong,
  onShuffleToggle,
  onRepeatModeChange,
  progressPercentage,
  isShuffleOn = false,
  repeatMode = 0,
  isAutoplayOn = false,
  isLiked = false,
  isSaved = false,
  onToggleLike,
  onToggleSave,
  onAutoplayToggle,
  onAddToPlaylist,
  availablePlaylists = [],
  onShuffleQueue,
  onClearQueue,
  onRemoveFromQueue
}: ExpandedSongCardProps) {
  
  

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Enhanced seeking with smooth drag functionality
  const [localProgress, setLocalProgress] = useState(progress);
  const [isSeekingActive, setIsSeekingActive] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const playlistMenuRef = useRef<HTMLDivElement>(null);
  const seekingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the formatted time values to prevent unnecessary recalculations
  const formattedProgress = useMemo(() => {
    const timeToShow = isDragging || isSeekingActive ? localProgress : progress;
    return formatTime(timeToShow);
  }, [progress, localProgress, isDragging, isSeekingActive]);

  const formattedDuration = useMemo(() => formatTime(duration), [duration]);

  // Debug progress values
  useEffect(() => {
    console.log('Progress Debug:', { progress, duration, progressPercentage });
  }, [progress, duration, progressPercentage]);

  // Calculate progress thumb position for animations
  const progressThumbPosition = useMemo(() => {
    return `calc(${progressPercentage}% - 6px)`;
  }, [progressPercentage]);

  // Handle clicks outside to close the card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close expanded card when clicking outside
      const target = event.target as Node;
      if (cardRef.current && !cardRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle clicks outside playlist menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target as Node)) {
        setShowPlaylistMenu(false);
      }
    }

    if (showPlaylistMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPlaylistMenu]);



  // Optimized progress sync with throttling
  const lastSyncTime = useRef<number>(0);

  useEffect(() => {
    if (!isDragging && !isSeekingActive) {
      const now = performance.now();
      if (now - lastSyncTime.current > 16) { // 60fps throttling
        setLocalProgress(progress);
        lastSyncTime.current = now;
      }
    }
  }, [progress, isDragging, isSeekingActive]);

  // Memoized calculation for better performance
  const calculateTimeFromPosition = useCallback((clientX: number) => {
    if (!progressContainerRef.current || !isFinite(duration) || duration <= 0) return null;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percentage = position / rect.width;
    const newTime = percentage * duration;

    return isFinite(newTime) && newTime >= 0 ? newTime : null;
  }, [duration]);

  // Enhanced mouse down with haptic feedback simulation
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setIsSeekingActive(true);

    const newTime = calculateTimeFromPosition(e.clientX);
    if (newTime !== null) {
      setLocalProgress(newTime);
      // Add subtle visual feedback
      if (progressContainerRef.current) {
        progressContainerRef.current.style.transform = 'scaleY(1.1)';
      }
    }
  }, [calculateTimeFromPosition]);

  // Optimized click handler with debouncing
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const newTime = calculateTimeFromPosition(e.clientX);
    if (newTime !== null) {
      setLocalProgress(newTime);
      onProgressChange(newTime);

      // Quick visual feedback
      setIsSeekingActive(true);
      if (seekingTimeoutRef.current) clearTimeout(seekingTimeoutRef.current);
      seekingTimeoutRef.current = setTimeout(() => {
        setIsSeekingActive(false);
      }, 150);
    }
  }, [isDragging, calculateTimeFromPosition, onProgressChange]);

  // Enhanced touch handling with better responsiveness
  const handleProgressTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setIsSeekingActive(true);

    const touch = e.touches[0];
    const newTime = calculateTimeFromPosition(touch.clientX);
    if (newTime !== null) {
      setLocalProgress(newTime);
      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [calculateTimeFromPosition]);

  // Optimized global event handlers with throttling and performance improvements
  useEffect(() => {
    let animationFrame: number | null = null;
    let lastMoveTime = 0;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const now = performance.now();
      if (now - lastMoveTime < 8) return; // 120fps throttling for ultra-smooth dragging

      if (animationFrame) cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const newTime = calculateTimeFromPosition(e.clientX);
        if (newTime !== null) {
          setLocalProgress(newTime);
          lastMoveTime = now;
        }
      });
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onProgressChange(localProgress);

        // Reset visual feedback
        if (progressContainerRef.current) {
          progressContainerRef.current.style.transform = '';
        }

        // Smooth transition back to normal state
        if (seekingTimeoutRef.current) clearTimeout(seekingTimeoutRef.current);
        seekingTimeoutRef.current = setTimeout(() => {
          setIsSeekingActive(false);
        }, 250);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;

      e.preventDefault();
      const now = performance.now();
      if (now - lastMoveTime < 8) return;

      if (animationFrame) cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const newTime = calculateTimeFromPosition(e.touches[0].clientX);
        if (newTime !== null) {
          setLocalProgress(newTime);
          lastMoveTime = now;
        }
      });
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onProgressChange(localProgress);

        // Reset visual feedback
        if (progressContainerRef.current) {
          progressContainerRef.current.style.transform = '';
        }

        // Smooth transition with haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(5);
        }

        if (seekingTimeoutRef.current) clearTimeout(seekingTimeoutRef.current);
        seekingTimeoutRef.current = setTimeout(() => {
          setIsSeekingActive(false);
        }, 200);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, localProgress, onProgressChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (seekingTimeoutRef.current) {
        clearTimeout(seekingTimeoutRef.current);
      }
    };
  }, []);



  // Generate playlist colors (same logic as main page)
  const getPlaylistColor = (playlistName: string) => {
    const colors = [
      'from-purple-400 to-pink-500',
      'from-blue-400 to-teal-500',
      'from-amber-400 to-red-500',
      'from-green-400 to-blue-500',
      'from-pink-400 to-purple-500',
      'from-indigo-400 to-cyan-500',
      'from-red-400 to-pink-500',
      'from-teal-400 to-green-500'
    ];

    let hash = 0;
    for (let i = 0; i < playlistName.length; i++) {
      hash = playlistName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleShuffleToggle = () => {
    onShuffleToggle(!isShuffleOn);
  };

  const handleRepeatModeChange = () => {
    onRepeatModeChange((repeatMode + 1) % 3);
  };

  const handleAutoplayToggle = () => {
    onAutoplayToggle?.(!isAutoplayOn);
  };

  // Queue management handlers
  const handleShuffleQueue = useCallback(() => {
    if (onShuffleQueue) {
      onShuffleQueue();
      // Visual feedback - could add a toast notification here
    }
  }, [onShuffleQueue]);

  const handleClearQueue = useCallback(() => {
    if (onClearQueue) {
      onClearQueue();
      // Visual feedback - could add a toast notification here
    }
  }, [onClearQueue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 touch-manipulation">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <motion.div
        ref={cardRef}
        className="w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/60 sm:bg-black/40 text-white hover:text-white p-2 sm:p-1.5 rounded-full z-50 transition-colors touch-manipulation"
          aria-label="Close"
          style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-4 sm:h-4">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Left side - Song info and controls */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 flex flex-col items-center md:w-1/2 overflow-y-auto hide-scrollbar">
          <div className="text-white text-center mb-2">
            <div className="text-xs font-semibold">Now Playing</div>
            <div className="text-xs text-white/60">{song.album}</div>
          </div>

          {/* Album art */}
          <div className="relative mt-2 mb-4 w-40 h-40 sm:w-56 sm:h-56 mx-auto">
            <Image
              src={song.cover}
              alt={`${song.title} album art`}
              width={224}
              height={224}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg transition-opacity duration-200 opacity-0 hover:opacity-100">
              <button
                onClick={onPlayPause}
                className="bg-white text-gray-900 p-3 rounded-full transition-transform hover:scale-105"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Song info */}
          <div className="text-center mb-4 px-2">
            <h2 className="text-white text-lg sm:text-xl font-bold truncate">{song.title}</h2>
            <p className="text-white/80 text-sm sm:text-base mt-1 truncate">{song.artist}</p>
          </div>

          {/* Playback controls */}
          <div className="w-full px-2 sm:px-4">
            {/* Progress bar */}
            <div className="flex justify-between text-xs mb-2 text-white/70">
              <span className={`transition-colors duration-200 ${isDragging ? 'text-blue-400' : 'text-white/70'}`}>
                {formattedProgress}
              </span>
              <span>{formattedDuration}</span>
            </div>

            <div
              className={`w-full bg-gray-700/50 rounded-full overflow-hidden relative cursor-pointer touch-manipulation progress-container group transition-all duration-300 ease-out ${isDragging ? 'h-2.5 bg-gray-600/60' : 'h-1.5 hover:h-2'
                }`}
              ref={progressContainerRef}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouch}
              style={{
                minHeight: '6px',
                willChange: isDragging ? 'transform' : 'auto'
              }}
            >
              {/* Background glow effect when dragging */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm scale-110"></div>
              )}

              {/* Progress bar with smooth gradient */}
              <div
                className={`h-full rounded-full transition-all relative overflow-hidden ${isDragging
                  ? 'duration-100 bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg'
                  : 'duration-300 bg-gradient-to-r from-white to-gray-100'
                  }`}
                style={{
                  width: `${Math.max(0, Math.min(100, isDragging || isSeekingActive ? (localProgress / duration) * 100 : progressPercentage))}%`,
                  minWidth: (isDragging || isSeekingActive ? localProgress : progress) > 0 ? '3px' : '0px',
                  willChange: isDragging ? 'width' : 'auto'
                }}
              >
                {/* Shimmer effect when dragging */}
                {isDragging && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                )}
              </div>

              {/* Enhanced progress thumb with better shadow */}
              <div
                className={`absolute top-1/2 rounded-full transition-all duration-200 bg-white border-2 ${isDragging
                  ? 'w-5 h-5 shadow-2xl border-blue-200 ring-4 ring-blue-400/30'
                  : 'w-3 h-3 shadow-lg border-gray-200'
                  }`}
                style={{
                  left: `calc(${Math.max(0, Math.min(100, isDragging || isSeekingActive ? (localProgress / duration) * 100 : progressPercentage))}% - ${isDragging ? '10px' : '6px'})`,
                  opacity: isDragging || isSeekingActive ? 1 : 0,
                  transform: `translateY(-50%) scale(${isDragging ? 1 : 0.9})`,
                  zIndex: 20,
                  willChange: isDragging ? 'left, transform' : 'auto'
                }}
              ></div>

              {/* Enhanced hover area with better accessibility */}
              <div
                className="absolute inset-0 -top-3 -bottom-3 cursor-pointer"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={isDragging || isSeekingActive ? localProgress : progress}
                aria-label="Seek timeline"
                tabIndex={0}
              ></div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handleShuffleToggle}
                className={`p-2 ${isShuffleOn ? 'text-pink-400' : 'text-white/70'} transition-colors rounded-full`}
                aria-label="Toggle shuffle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </button>

              <button
                onClick={onPrevious}
                className="p-2 text-white/80 hover:text-white transition-colors rounded-full"
                aria-label="Previous track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                </svg>
              </button>

              <button
                onClick={onPlayPause}
                className="p-3 bg-white text-gray-900 rounded-full shadow-md transition-transform hover:scale-105 mx-1 sm:mx-2"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-white/80 hover:text-white transition-colors rounded-full"
                aria-label="Next track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                </svg>
              </button>

              <button
                onClick={handleAutoplayToggle}
                className={`p-2 ${isAutoplayOn ? 'text-green-400' : 'text-white/70'} transition-colors rounded-full`}
                aria-label={isAutoplayOn ? "Autoplay on" : "Autoplay off"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isAutoplayOn ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M6 4v16l12-8L6 4z" />
                  <path d="M20 4v16" />
                </svg>
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={onToggleLike}
                className={`p-2 ${isLiked ? 'text-red-500' : 'text-white/70'} transition-colors rounded-full`}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                {isLiked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
              </button>

              <button
                onClick={onToggleSave}
                className={`p-2 ${isSaved ? 'text-green-400' : 'text-white/70'} transition-colors rounded-full`}
                aria-label={isSaved ? "Remove from saved" : "Save"}
              >
                {isSaved ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                )}
              </button>

              <div className="relative" ref={playlistMenuRef}>
                <button
                  onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                  id="playlist-container"
                  className="p-2 text-white/70 hover:text-white transition-colors rounded-full"
                  aria-label="Add to playlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>

                {/* Playlist Dropdown Menu */}
                {showPlaylistMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50">
                    <div className="p-2">
                      <div className="text-xs font-medium text-neutral-500 px-3 py-2 border-b border-neutral-100">
                        Add to playlist
                      </div>



                      {/* Existing Playlists */}
                      {availablePlaylists.map((playlistName) => (
                        <button
                          key={playlistName}
                          onClick={() => {
                            onAddToPlaylist?.(playlistName);
                            setShowPlaylistMenu(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded bg-gradient-to-br ${getPlaylistColor(playlistName)} flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-neutral-900 truncate">{playlistName}</div>
                            <div className="text-xs text-neutral-600 truncate">Custom playlist</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Volume Control */}
            <div className="mt-4">
              <VolumeControl
                volume={volume}
                onChange={onVolumeChange}
                className="flex justify-center"
              />
            </div>
          </div>
        </div>

        {/* Right side - Next Songs in Queue */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-4 sm:p-6 md:w-1/2 overflow-y-auto hide-scrollbar hidden md:block">
          <div className="mb-6">
            <h2 className="text-white text-base font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Up next
            </h2>
          </div>

          {/* Next 5 Songs (YouTube Music Style) */}
          {suggestedSongs.length > 0 ? (
            <div className="mb-6 space-y-2">
              {suggestedSongs.slice(0, 5).map((queueSong, index) => (
                <div
                  key={queueSong.id}
                  onClick={() => onSelectSong(queueSong.id - 1)}
                  className={`flex items-center bg-white/5 hover:bg-white/10 p-3 rounded-lg cursor-pointer transition-colors group ${index === 0 ? 'bg-white/8' : ''
                    }`}
                >
                  {/* Position indicator for first song */}
                  {index === 0 && (
                    <div className="w-6 h-6 mr-3 flex items-center justify-center text-blue-400 text-xs font-medium flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                    </div>
                  )}

                  {/* Position number for other songs */}
                  {index > 0 && (
                    <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-400 text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                  )}

                  <div className="relative mr-3 flex-shrink-0">
                    <Image
                      src={queueSong.cover}
                      alt={queueSong.title}
                      width={index === 0 ? 48 : 40}
                      height={index === 0 ? 48 : 40}
                      className={`${index === 0 ? 'w-12 h-12' : 'w-10 h-10'} rounded object-cover`}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-white font-medium truncate ${index === 0 ? 'text-base' : 'text-sm'}`}>
                      {queueSong.title}
                    </div>
                    <div className={`text-gray-400 truncate ${index === 0 ? 'text-sm' : 'text-xs'}`}>
                      {queueSong.artist}
                    </div>
                    {index === 0 && (
                      <div className="text-gray-500 text-xs mt-1">{queueSong.duration}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <div className="text-gray-400 text-xs hidden sm:block">
                        {queueSong.duration}
                      </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRemoveFromQueue) {
                            onRemoveFromQueue(index);
                          }
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Remove from queue"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Queue Info */}
              {suggestedSongs.length > 5 && (
                <div className="mt-3 text-gray-400 text-xs flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  {suggestedSongs.length - 5} more in queue
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No songs in queue</div>
              <div className="text-gray-500 text-xs mt-1">Add songs to see what's playing next</div>
            </div>
          )}

          {/* Queue actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleShuffleQueue}
              className="w-full border border-white/20 text-white py-2 rounded-full hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!onShuffleQueue || suggestedSongs.length === 0}
              aria-label="Shuffle queue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Shuffle Queue
            </button>

            <button
              onClick={handleClearQueue}
              className="w-full border border-white/20 text-white py-2 rounded-full hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!onClearQueue || suggestedSongs.length === 0}
              aria-label="Clear queue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear Queue
            </button>
          </div>
        </div>
      </motion.div>



      <style jsx>{`
        /* Progress bar styles */
        .progress-container {
          min-height: 6px !important;
          background-color: rgba(255, 255, 255, 0.2) !important;
          position: relative !important;
          border-radius: 9999px !important;
        }
        
        .progress-container .progress-bar {
          height: 100% !important;
          background-color: white !important;
          border-radius: 9999px !important;
          transition: width 0.1s ease !important;
        }
        
        @media (hover: hover) {
          .progress-container:hover .progress-thumb {
            opacity: 1 !important;
          }
        }

        /* Custom scrollbar styles */
        .hide-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        .hide-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
    </div>
  );
} 