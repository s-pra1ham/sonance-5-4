'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../data/songs';
import Image from 'next/image';


interface MusicPlayerProps {
  songs: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onProgressChange: (time: number) => void;
}

interface ProgressBarProps {
  progress: number;
  duration: number;
  onProgressChange: (time: number) => void;
}

export default function MusicPlayer({
  songs,
  currentSongIndex,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onProgressChange
}: MusicPlayerProps) {
  const currentSong = songs[currentSongIndex];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);


  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };



  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const ProgressBar = ({ progress, duration, onProgressChange }: ProgressBarProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [localProgress, setLocalProgress] = useState(progress);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const lastUpdateTime = useRef<number>(0);
    const isUpdating = useRef<boolean>(false);

    // Update local progress when not dragging and progress changes
    useEffect(() => {
      if (!isDragging && !isUpdating.current) {
        setLocalProgress(progress);
      }
    }, [progress, isDragging]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      isUpdating.current = true;
      updateProgress(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        updateProgress(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        isUpdating.current = false;
        onProgressChange(localProgress);
      }
    };

    const updateProgress = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;

      // Throttle updates to prevent excessive re-renders
      const now = performance.now();
      if (now - lastUpdateTime.current > 16) { // ~60fps
        setLocalProgress(newTime);
        lastUpdateTime.current = now;
      }
    };

    // Add event listeners for mouse up and move on the window
    useEffect(() => {
      const handleGlobalMouseUp = () => {
        if (isDragging) {
          setIsDragging(false);
          isUpdating.current = false;
          onProgressChange(localProgress);
        }
      };

      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDragging && progressBarRef.current) {
          const rect = progressBarRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, x / rect.width));
          const newTime = percentage * duration;

          const now = performance.now();
          if (now - lastUpdateTime.current > 16) {
            setLocalProgress(newTime);
            lastUpdateTime.current = now;
          }
        }
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);

      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }, [isDragging, duration, onProgressChange, localProgress]);

    const progressPercentage = (localProgress / duration) * 100;

    return (
      <div className="w-full h-1 bg-gray-200 rounded-full cursor-pointer group">
        <div
          ref={progressBarRef}
          className="relative h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute right-0 w-3 h-3 -mt-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 text-white rounded-lg overflow-hidden shadow-xl">
      <div className="p-4">
        {/* Album Cover */}
        <div className="relative aspect-square w-full mb-4">
          <Image
            src={currentSong.cover}
            alt={`${currentSong.album || currentSong.title} cover`}
            className="rounded-md"
            width={500}
            height={500}
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Song Info */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold truncate">{currentSong.title}</h2>
          <p className="text-sm text-gray-400">{currentSong.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs">{formatTime(progress)}</span>
          <ProgressBar progress={progress} duration={duration} onProgressChange={onProgressChange} />
          <span className="text-xs">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-6 mb-4">
          <button
            onClick={onPrevious}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
            </svg>
          </button>
          <button
            onClick={onPlayPause}
            className="bg-white text-black p-3 rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
            )}
          </button>
          <button
            onClick={onNext}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
            </svg>
          </button>
        </div>


      </div>

      {/* Audio Element (hidden) */}
      <audio
        ref={audioRef}
        src={currentSong.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
        className="hidden"
      />
    </div>
  );
} 