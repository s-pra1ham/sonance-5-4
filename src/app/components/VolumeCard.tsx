'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface VolumeCardProps {
  volume: number;
  onChange: (volume: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

const VolumeCard: React.FC<VolumeCardProps> = ({
  volume,
  onChange,
  isVisible,
  onClose
}) => {
  const [isMuted, setIsMuted] = useState(volume === 0);
  const [previousVolume, setPreviousVolume] = useState(volume > 0 ? volume : 0.7);

  // Inject CSS styles for the volume slider
  useEffect(() => {
    const volumeSliderStyles = `
      .volume-slider::-webkit-slider-thumb {
        appearance: none;
        height: 22px;
        width: 22px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        transition: all 0.2s ease;
      }

      .volume-slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
      }

      .volume-slider::-webkit-slider-track {
        height: 9px;
        cursor: pointer;
        background: linear-gradient(to right, #ffffff 0%, #ffffff var(--volume-percent, 0%), #374151 var(--volume-percent, 0%), #374151 100%);
        border-radius: 4.5px;
      }

      @media (max-width: 768px) {
        .volume-slider::-webkit-slider-thumb {
          height: 24px;
          width: 24px;
        }
        
        .volume-slider::-webkit-slider-track {
          height: 10px;
          border-radius: 5px;
        }
      }

      .volume-slider::-moz-range-thumb {
        height: 22px;
        width: 22px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        border: none;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      }

      .volume-slider::-moz-range-track {
        height: 9px;
        cursor: pointer;
        background: #374151;
        border-radius: 4.5px;
      }

      .volume-slider::-moz-range-progress {
        height: 9px;
        background: #ffffff;
        border-radius: 4.5px;
      }

      @media (max-width: 768px) {
        .volume-slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
        }
        
        .volume-slider::-moz-range-track {
          height: 10px;
          border-radius: 5px;
        }
        
        .volume-slider::-moz-range-progress {
          height: 10px;
          border-radius: 5px;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = volumeSliderStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVolume = parseFloat(e.target.value);
    // Round to nearest 5% interval (0.05 increments)
    const roundedVolume = Math.round(rawVolume * 20) / 20;
    const safeVolume = Math.max(0, Math.min(1, roundedVolume));
    
    onChange(safeVolume);
    
    if (safeVolume > 0) {
      setIsMuted(false);
      setPreviousVolume(safeVolume);
    } else {
      setIsMuted(true);
    }
  }, [onChange]);

  const toggleMute = useCallback(() => {
    if (isMuted || volume === 0) {
      setIsMuted(false);
      onChange(previousVolume);
    } else {
      setIsMuted(true);
      setPreviousVolume(volume);
      onChange(0);
    }
  }, [isMuted, volume, previousVolume, onChange]);

  const setVolumePreset = useCallback((preset: number) => {
    const safeVolume = Math.max(0, Math.min(1, preset));
    onChange(safeVolume);
    setIsMuted(false);
    setPreviousVolume(safeVolume);
  }, [onChange]);

  const getVolumeIcon = () => {
    if (isMuted && volume > 0) {
      // Muted (but volume is not 0) - X through speaker
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-2.25 0L12 9.75m0 0L9.75 12M12 9.75 9.75 7.5M12 9.75l2.25-2.25" />
        </svg>
      );
    } else if (volume === 0) {
      // 0% Volume - Speaker only (no X)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else if (volume <= 0.2) {
      // Very Low (1-20%) - Speaker only
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else if (volume <= 0.5) {
      // Low (21-50%) - Speaker with one wave
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 0 1 0 6M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else if (volume <= 0.8) {
      // Medium (51-80%) - Speaker with two waves
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75a6 6 0 0 1 0 10.5M15.75 9a3.75 3.75 0 0 1 0 6M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else {
      // High (81-100%) - Speaker with three waves
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    }
  };

  const volumePercent = Math.round((isMuted ? 0 : volume) * 100);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-6 border border-zinc-800/40 shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Volume Control</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full p-2"
            aria-label="Close volume control"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Volume Icon and Level */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-white mb-4">
            {getVolumeIcon()}
          </div>
          <div className="text-3xl font-bold mb-2">
            {volumePercent}%
          </div>
          <div className="text-sm text-gray-400">
            {isMuted && volume > 0 ? 'Muted' : volume === 0 ? 'Silent' : volume <= 0.2 ? 'Very Low' : volume <= 0.5 ? 'Low' : volume <= 0.8 ? 'Medium' : 'High'}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="mb-6 px-1">
          <div className="py-3 md:py-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-2.5 md:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer volume-slider"
              style={{ '--volume-percent': `${volumePercent}%` } as React.CSSProperties}
              aria-label="Volume"
            />
          </div>
        </div>

        {/* Quick Volume Presets */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => setVolumePreset(0)}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white py-2.5 md:py-2 px-3 rounded-lg transition-colors text-sm"
          >
            0%
          </button>
          <button
            onClick={() => setVolumePreset(0.25)}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white py-2.5 md:py-2 px-3 rounded-lg transition-colors text-sm"
          >
            25%
          </button>
          <button
            onClick={() => setVolumePreset(0.50)}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white py-2.5 md:py-2 px-3 rounded-lg transition-colors text-sm"
          >
            50%
          </button>
          <button
            onClick={() => setVolumePreset(1)}
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white py-2.5 md:py-2 px-3 rounded-lg transition-colors text-sm"
          >
            100%
          </button>
        </div>

        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className={`w-full py-3.5 md:py-3 px-4 rounded-lg font-medium transition-colors ${
            isMuted 
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white' 
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
          }`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
};

export default VolumeCard;