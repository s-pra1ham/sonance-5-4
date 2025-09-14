'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
  className?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onChange,
  className = ""
}) => {
  const [isMuted, setIsMuted] = useState(volume === 0);
  const [previousVolume, setPreviousVolume] = useState(volume > 0 ? volume : 0.7);

  // Inject CSS styles for the slider
  useEffect(() => {
    const sliderStyles = `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        transition: all 0.2s ease;
      }

      .slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      }

      .slider::-webkit-slider-track {
        height: 5px;
        cursor: pointer;
        background: linear-gradient(to right, #ffffff 0%, #ffffff var(--volume-percent, 0%), #374151 var(--volume-percent, 0%), #374151 100%);
        border-radius: 2.5px;
      }

      @media (max-width: 768px) {
        .slider::-webkit-slider-thumb {
          height: 16px;
          width: 16px;
        }
        
        .slider::-webkit-slider-track {
          height: 6px;
          border-radius: 3px;
        }
      }

      .slider::-moz-range-thumb {
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      }

      .slider::-moz-range-track {
        height: 5px;
        cursor: pointer;
        background: #374151;
        border-radius: 2.5px;
      }

      .slider::-moz-range-progress {
        height: 5px;
        background: #ffffff;
        border-radius: 2.5px;
      }

      @media (max-width: 768px) {
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
        }
        
        .slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
        }
        
        .slider::-moz-range-progress {
          height: 6px;
          border-radius: 3px;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = sliderStyles;
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

  const getVolumeIcon = () => {
    if (isMuted && volume > 0) {
      // Muted (but volume is not 0) - X through speaker
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-2.25 0L12 9.75m0 0L9.75 12M12 9.75 9.75 7.5M12 9.75l2.25-2.25" />
        </svg>
      );
    } else if (volume === 0) {
      // 0% Volume - Speaker only (no X)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else if (volume <= 0.2) {
      // Very Low (1-20%) - Speaker only
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else if (volume <= 0.5) {
      // Low (21-50%) - Speaker with one wave
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 0 1 0 6M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else if (volume <= 0.8) {
      // Medium (51-80%) - Speaker with two waves
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75a6 6 0 0 1 0 10.5M15.75 9a3.75 3.75 0 0 1 0 6M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    } else {
      // High (81-100%) - Speaker with three waves
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      );
    }
  };

  const volumePercent = Math.round((isMuted ? 0 : volume) * 100);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={toggleMute}
        className="text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full p-2 md:p-1.5 flex-shrink-0"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {getVolumeIcon()}
      </button>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex-1 py-2 md:py-0">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 md:h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{ '--volume-percent': `${volumePercent}%` } as React.CSSProperties}
            aria-label="Volume"
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">
          {volumePercent}%
        </span>
      </div>
    </div>
  );
};

export default VolumeControl;