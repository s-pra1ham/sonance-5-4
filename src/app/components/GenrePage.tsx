'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { songs, Song } from '../data/songs';

interface GenrePageProps {
  genreName: string;
  onClose: () => void;
  onSongSelect: (songIndex: number) => void;
}

const genreArtists = {
  "Pop": ["Katy Perry", "David Kushner", "Lady Gaga & Bruno Mars", "Harry Styles"],
  "Rock": ["Bastille", "KALEO", "OneRepublic"],
  "Indie": ["Girl in Red", "Hollow Coves", "Lord Huron"],
  "Electronic": ["Eiffel 65", "The Neighbourhood", "Cigarettes After Sex"],
  "Acoustic": ["Vance Joy", "SYML", "Tom Rosenthal"],
  "Alternative": ["New West", "The Rare Occasions", "Dr. Dog"]
};

function GenrePage({ genreName, onClose, onSongSelect }: GenrePageProps) {
  const [genreSongs, setGenreSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Filter songs by genre based on artists
    const artists = genreArtists[genreName as keyof typeof genreArtists] || [];
    const filteredSongs = songs.filter(song => artists.includes(song.artist));
    setGenreSongs(filteredSongs);
    setIsLoading(false);
  }, [genreName]);

  const getGradientClass = () => {
    switch(genreName) {
      case "Pop": return "from-pink-400 to-red-500";
      case "Rock": return "from-red-400 to-amber-500";
      case "Indie": return "from-emerald-400 to-cyan-500";
      case "Electronic": return "from-blue-400 to-indigo-500";
      case "Acoustic": return "from-violet-400 to-purple-500";
      case "Alternative": return "from-amber-400 to-yellow-500";
      default: return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="p-4 md:p-6">
        {/* Back button row */}
        <div className="mb-6">
          <button 
            onClick={onClose}
            className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Header with gradient background */}
        <div className={`bg-gradient-to-br ${getGradientClass()} rounded-2xl py-8 px-6 text-white mb-8`}>
          <div className="max-w-screen-xl mx-auto">
            <span className="text-sm font-medium uppercase tracking-wider opacity-90">Genre</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{genreName}</h1>
            <p className="opacity-80">{genreSongs.length} songs</p>
          </div>
        </div>
        
        <div className="max-w-screen-xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">All Songs</h2>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Play All
                  </button>
                  <button className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                {genreSongs.length > 0 ? (
                  genreSongs.map((song, index) => (
                    <div 
                      key={song.id}
                      className="flex items-center p-4 hover:bg-neutral-100 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                      onClick={() => onSongSelect(song.id - 1)}
                    >
                      <div className="mr-5 text-neutral-400 w-5 text-center font-medium">{index + 1}</div>
                      <div className="w-14 h-14 rounded-md overflow-hidden mr-4 flex-shrink-0">
                        <Image src={song.cover} alt={song.title} className="w-full h-full object-cover" width={56} height={56} loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 truncate text-gray-800">{song.title}</h3>
                        <p className="text-sm text-neutral-500 truncate">{song.artist}</p>
                      </div>
                      <div className="text-sm text-neutral-500 mr-4">{song.duration}</div>
                      <button 
                        className="text-neutral-400 hover:text-neutral-700 transition-colors"
                        aria-label={`Like ${song.title}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-neutral-500">
                    No songs found in this genre.
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">About {genreName}</h2>
                <p className="text-neutral-600 leading-relaxed">
                  {genreName === "Pop" && "Pop music is characterized by catchy melodies, repetitive structures, and accessibility to wide audiences. It often incorporates elements from other styles, making it diverse and evolving."}
                  {genreName === "Rock" && "Rock music centers around electric guitars, drums, and emotive vocals. From classic rock to alternative, it emphasizes energy, attitude, and often addresses social themes."}
                  {genreName === "Indie" && "Independent or 'indie' music emerged from artists outside the commercial mainstream. It values creative freedom, authenticity, and DIY ethics, spanning various genres with a distinctive approach."}
                  {genreName === "Electronic" && "Electronic music is created primarily with digital instruments and technology. From ambient to dance, it explores sound design, rhythmic patterns, and atmospheric textures."}
                  {genreName === "Acoustic" && "Acoustic music prioritizes unplugged instruments like acoustic guitars, pianos, and natural vocals. It creates an intimate, warm sound that highlights songwriting and vocal performance."}
                  {genreName === "Alternative" && "Alternative music began as an alternative to mainstream rock, embracing experimental approaches and diverse influences. It's characterized by innovation and a willingness to break conventions."}
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Featured Artists</h3>
                  <div className="space-y-3">
                    {genreArtists[genreName as keyof typeof genreArtists]?.map((artist, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">
                          {artist.charAt(0)}
                        </div>
                        <span className="text-gray-800">{artist}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Similar Genres</h3>
                  <div className="space-y-2">
                    {genreName === "Pop" && ["Electronic", "R&B", "Dance"].map((genre, i) => 
                      <div key={i} className="py-2 border-b last:border-b-0 border-gray-200 text-gray-700">{genre}</div>
                    )}
                    {genreName === "Rock" && ["Alternative", "Metal", "Punk"].map((genre, i) => 
                      <div key={i} className="py-2 border-b last:border-b-0 border-gray-200 text-gray-700">{genre}</div>
                    )}
                    {genreName === "Indie" && ["Alternative", "Folk", "Rock"].map((genre, i) => 
                      <div key={i} className="py-2 border-b last:border-b-0 border-gray-200 text-gray-700">{genre}</div>
                    )}
                    {genreName === "Electronic" && ["Dance", "Ambient", "Pop"].map((genre, i) => 
                      <div key={i} className="py-2 border-b last:border-b-0 border-gray-200 text-gray-700">{genre}</div>
                    )}
                    {genreName === "Acoustic" && ["Folk", "Indie", "Singer-Songwriter"].map((genre, i) => 
                      <div key={i} className="py-2 border-b last:border-b-0 border-gray-200 text-gray-700">{genre}</div>
                    )}
                    {genreName === "Alternative" && ["Indie", "Rock", "Grunge"].map((genre, i) => 
                      <div key={i} className="py-2 border-b last:border-b-0 border-gray-200 text-gray-700">{genre}</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {genreName === "Pop" && ["upbeat", "catchy", "vocals", "trending", "melodic", "commercial"].map((tag, i) => 
                      <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">{tag}</span>
                    )}
                    {genreName === "Rock" && ["guitar", "drums", "energetic", "band", "powerful", "anthem"].map((tag, i) => 
                      <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">{tag}</span>
                    )}
                    {genreName === "Indie" && ["authentic", "alternative", "underground", "DIY", "unique", "creative"].map((tag, i) => 
                      <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">{tag}</span>
                    )}
                    {genreName === "Electronic" && ["synth", "beats", "digital", "ambient", "atmospheric", "produced"].map((tag, i) => 
                      <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">{tag}</span>
                    )}
                    {genreName === "Acoustic" && ["unplugged", "intimate", "organic", "vocals", "guitar", "piano"].map((tag, i) => 
                      <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">{tag}</span>
                    )}
                    {genreName === "Alternative" && ["experimental", "diverse", "innovative", "unconventional", "eclectic", "edgy"].map((tag, i) => 
                      <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">{tag}</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenrePage; 