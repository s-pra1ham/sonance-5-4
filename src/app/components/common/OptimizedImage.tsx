'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  loading = 'lazy',
  objectFit = 'cover',
  priority = false,
  onClick,
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);
  
  // Fallback image for errors
  const fallbackSrc = '/images/placeholder.jpg';
  
  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      <Image
        src={isError ? fallbackSrc : src}
        alt={alt || 'Image'}
        width={width}
        height={height}
        priority={priority}
        loading={loading}
        style={{ 
          objectFit, 
          width: '100%', 
          height: '100%'
        }}
        onError={() => setIsError(true)}
      />
    </div>
  );
}