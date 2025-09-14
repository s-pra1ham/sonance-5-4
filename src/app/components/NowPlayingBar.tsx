'use client';

import { useState, useMemo } from 'react';
import type { Song } from '../data/songs';
import Image from 'next/image';
import VolumeControl from './VolumeControl';



interface NowPlayingBarProps {
  currentSong: Song;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isLiked: boolean;
  isSaved: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onProgressChange: (newProgress: number) => void;
  onVolumeChange: (volume: number) => void;
  onExpand: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
}

const NowPlayingBar: React.FC<NowPlayingBarProps> = ({
  currentSong,
  isPlaying,
  progress,
  duration,
  volume,
  isLiked,
  isSaved,
  onPlayPause,
  onNext,
  onPrevious,
  onProgressChange,
  onVolumeChange,
  onExpand,
  onToggleLike,
  onToggleSave
}) => {
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: repeat all, 2: repeat one

  // Calculate progress percentage once to avoid recalculations during render
  const progressPercentage = useMemo(() => {
    if (duration > 0) {
      return (progress / duration) * 100;
    }
    return 0;
  }, [progress, duration]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
      onProgressChange(newTime);
    } else {
      console.warn('Invalid time value in progress change:', newTime);
    }
  };

  // Fix for progress bar max=0 issue before metadata loads
  const progressMax = duration > 0 ? duration : 1;

  const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Prevent expand if a button, link, or input was clicked
    if (target.closest('button, a, input')) {
      return;
    }
    onExpand();
  };

  if (!currentSong) return null;

  return (
    <div
      className="relative bg-gray-900/90 backdrop-blur-md text-white rounded-xl px-4 sm:px-8 py-4 sm:py-3 border border-zinc-800/40 shadow-lg w-full cursor-pointer hover:bg-gray-900/95 transition-colors mb-4"
      onClick={handleWrapperClick}
    >
      <div className="flex items-center justify-between">
        {/* Mobile Timeline - positioned above center controls only */}
        <div className="sm:hidden absolute top-3 left-1/2 transform -translate-x-1/2 w-1/2 pointer-events-none z-0">
          <div className="relative h-1">
            <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden pointer-events-none">
              <div
                className="h-full bg-white/80 rounded-full pointer-events-none"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <input
              type="range"
              min="0"
              max={progressMax}
              value={progress}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer touch-manipulation pointer-events-auto"
              aria-label="Seek timeline"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        {/* Current Song Info */}
        <div className="flex items-center w-2/5 sm:w-1/3 relative z-10">
          <div className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 mr-3 sm:mr-4 rounded-lg overflow-hidden">
            <Image
              src={currentSong.cover}
              alt={`${currentSong.title} by ${currentSong.artist}`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-base font-semibold leading-tight mb-1">
              {currentSong.title}
            </p>
            <p className="text-sm text-gray-400 leading-tight">
              {currentSong.artist}
            </p>
          </div>
          {/* Mobile song title - visible only on small screens */}
          <div className="flex-1 min-w-0 sm:hidden">
            <p className="text-sm font-semibold leading-tight mb-0.5">
              {currentSong.title.length > 8 
                ? `${currentSong.title.substring(0, 8)}...` 
                : currentSong.title}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls - Hidden on mobile */}
        <div className="hidden sm:flex flex-col items-center w-1/3">
          <div className="flex items-center justify-center gap-1 sm:gap-3 mb-0.5 sm:mb-1">
            <button
              onClick={() => setIsShuffleOn(!isShuffleOn)}
              className={`text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors touch-manipulation hidden xs:flex xs:items-center xs:justify-center ${isShuffleOn ? 'text-green-400' : ''}`}
              aria-label="Shuffle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3M9 12h6m-6 0a3 3 0 11-6 0 3 3 0 016 0zm6 0a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </button>
            <button
              onClick={onPrevious}
              className="text-white hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors touch-manipulation"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
              </svg>
            </button>
            <button
              onClick={onPlayPause}
              className="bg-white text-black p-1.5 sm:p-2 rounded-full hover:scale-105 transition-transform touch-manipulation"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              )}
            </button>
            <button
              onClick={onNext}
              className="text-white hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors touch-manipulation"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
              </svg>
            </button>
            <button
              onClick={() => setRepeatMode((prev) => (prev + 1) % 3)}
              className={`text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors touch-manipulation hidden xs:flex xs:items-center xs:justify-center ${repeatMode === 1 ? 'text-green-400' : repeatMode === 2 ? 'text-blue-400' : ''
                }`}
              aria-label="Repeat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full flex items-center gap-1 sm:gap-2">
            <span className="text-[8px] sm:text-[10px] text-gray-400 xs:inline">{formatTime(progress)}</span>
            <div className="relative flex-grow">
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max={progressMax}
                value={progress}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full opacity-0 cursor-pointer touch-manipulation"
                aria-label="Seek timeline"
              />
            </div>
            <span className="text-[8px] sm:text-[10px] text-gray-400 xs:inline">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mobile Controls - Centered play controls for mobile */}
        <div className="sm:hidden flex items-center justify-center w-2/5 mt-2">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="text-white hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors touch-manipulation flex items-center justify-center z-10 relative"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayPause();
              }}
              className="bg-white text-black p-3 rounded-full hover:scale-105 transition-transform touch-manipulation flex items-center justify-center z-10 relative"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="text-white hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors touch-manipulation flex items-center justify-center z-10 relative"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Controls - Volume Control and additional buttons */}
        <div className="hidden sm:flex items-center justify-end w-1/3 relative z-10 h-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            className="text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1.5 mr-0.5 hidden md:flex md:items-center md:justify-center"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            {isLiked ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-500">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1.5 mr-0.5 hidden md:flex md:items-center md:justify-center"
            aria-label={isSaved ? "Remove from library" : "Save to library"}
          >
            {isSaved ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-400">
                <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.0/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center h-full">
            <VolumeControl
              volume={volume}
              onChange={onVolumeChange}
              className="flex items-center"
            />
          </div>

          {/* Volume Button for smaller screens */}
          <button
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('open-volume-card');
              window.dispatchEvent(event);
            }}
            className="text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1.5 lg:hidden"
            aria-label="Open volume control"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}

export default NowPlayingBar;