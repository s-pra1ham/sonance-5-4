/**
 * This script provides guidance on how to replace <img> tags with Next.js <Image> components
 */

/**
 * For each img tag, replace with the following pattern:
 *
 * BEFORE:
 * <img 
 *   src={song.cover} 
 *   alt={song.title} 
 *   className="w-full h-full object-cover" 
 *   loading="lazy" 
 * />
 *
 * AFTER:
 * <Image 
 *   src={song.cover} 
 *   alt={song.title || 'Music cover'} 
 *   width={300}
 *   height={300}
 *   className="w-full h-full" 
 *   style={{ objectFit: 'cover' }}
 *   loading="lazy"
 * />
 *
 * Make sure to:
 * 1. Add 'import Image from "next/image";' at the top of your file
 * 2. Always specify width and height props
 * 3. Move object-fit from className to style prop
 * 4. Make sure to wrap Image in a parent div when needed for sizing
 */

// Replace image tags in components:
// - src/app/components/ArtistsPage.tsx
// - src/app/components/AudiobooksPage.tsx
// - src/app/components/ExpandedSongCard.tsx
// - src/app/components/GenrePage.tsx
// - src/app/components/MusicPlayer.tsx
// - src/app/components/NowPlayingBar.tsx
// - src/app/components/PlaylistPage.tsx
// - src/app/components/PodcastsPage.tsx
// - src/app/components/SavesPage.tsx
// - src/app/page.tsx

// Add domains to next.config.js domains array for external images
// Fix TypeScript errors one by one
// Fix React Hook dependencies by adding them to dependency arrays 