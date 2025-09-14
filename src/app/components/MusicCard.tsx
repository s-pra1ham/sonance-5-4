'use client';

import { motion } from 'framer-motion';
import { cardVariants } from '../utils/transitions';

interface MusicCardProps {
  imageUrl: string;
  title: string;
  artist: string;
  onClick: () => void;
}

export default function MusicCard({ imageUrl, title, artist, onClick }: MusicCardProps) {
  return (
    <motion.div
      className="flex-shrink-0 w-36 cursor-pointer"
      onClick={onClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <motion.div className="rounded-lg overflow-hidden mb-2 relative aspect-square">
        <img
          src={imageUrl}
          alt={`${title} by ${artist}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
      <div className="static-text">
        <h3 className="font-medium text-sm truncate text-gray-800">{title}</h3>
        <p className="text-xs text-gray-600 truncate">{artist}</p>
      </div>
    </motion.div>
  );
} 