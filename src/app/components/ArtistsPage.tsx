import React, { useState } from 'react';
import { songs } from '../data/songs';
import SongList from './SongList';
import Image from 'next/image';

interface ArtistsPageProps {
  onClose: () => void;
  onSongSelect: (index: number) => void;
}

// Get unique artists from songs
const uniqueArtists = Array.from(new Set(songs.map(song => song.artist)))
  .filter(artist => artist); // Remove any empty artists

// Generate artist data
const artists = uniqueArtists.map((name, index) => {
  const artistSongs = songs.filter(song => song.artist === name);
  const primaryCover = artistSongs[0]?.cover || '';
  
  return {
    id: index + 1,
    name,
    cover: primaryCover,
    followers: Math.floor(Math.random() * 900000) + 100000,
    monthlyListeners: Math.floor(Math.random() * 5000000) + 1000000,
    bio: `${name} is a renowned artist known for a unique blend of musical styles and captivating performances.`,
    topSongs: artistSongs.slice(0, 5),
    relatedArtists: uniqueArtists
      .filter(a => a !== name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
  };
});

const ArtistsPage: React.FC<ArtistsPageProps> = ({ onClose, onSongSelect }) => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'related'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [songFilterQuery, setSongFilterQuery] = useState<string>('');
  
  // Filter artists based on search query
  const filteredArtists = searchQuery.trim()
    ? artists.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : artists;
  
  const currentArtist = selectedArtist 
    ? artists.find(artist => artist.name === selectedArtist)
    : null;
    
  // Find related artists
  const relatedArtists = currentArtist 
    ? currentArtist.relatedArtists.map(name => artists.find(a => a.name === name)).filter(Boolean)
    : [];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {selectedArtist && currentArtist ? (
        /* Artist Detail View */
        <>
          {/* Artist Header */}
          <div 
            className="relative overflow-hidden bg-gradient-to-b from-rose-900 to-rose-800 h-80 md:h-96"
          >
            <div className="absolute inset-0 overflow-hidden opacity-30" style={{ mixBlendMode: 'overlay' }}>
              <Image 
                src={currentArtist.cover} 
                alt={currentArtist.name}
                width={800}
                height={600}
                className="w-full h-full object-cover blur-sm"
              />
            </div>
            
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between">
              <button 
                onClick={() => setSelectedArtist(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 p-8 flex flex-col md:flex-row items-end md:items-center">
              <div className="w-40 h-40 overflow-hidden rounded-xl shadow-2xl mr-6 mb-4 md:mb-0 border-4 border-white">
                <Image 
                  src={currentArtist.cover} 
                  alt={currentArtist.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white text-sm font-medium mb-1">ARTIST</div>
                <h1 className="text-white text-5xl font-bold mb-2">{currentArtist.name}</h1>
                <div className="text-white/80 text-sm mb-4">{(currentArtist.monthlyListeners / 1000000).toFixed(1)}M monthly listeners</div>
                <div className="flex items-center gap-3">
                  <button className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium transition-colors">
                    Play
                  </button>
                  <button className="px-6 py-2.5 border border-white/30 text-white hover:bg-white/10 rounded-full font-medium transition-colors">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="bg-white border-b border-neutral-200">
            <div className="flex px-6">
              <button 
                className={`px-6 py-4 font-medium text-sm relative ${activeTab === 'overview' ? 'text-rose-600' : 'text-neutral-500 hover:text-neutral-800'} transition-colors`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600"></div>}
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm relative ${activeTab === 'songs' ? 'text-rose-600' : 'text-neutral-500 hover:text-neutral-800'} transition-colors`}
                onClick={() => {
                  setActiveTab('songs');
                  setSongFilterQuery('');
                }}
              >
                Songs
                {activeTab === 'songs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600"></div>}
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm relative ${activeTab === 'related' ? 'text-rose-600' : 'text-neutral-500 hover:text-neutral-800'} transition-colors`}
                onClick={() => setActiveTab('related')}
              >
                Related Artists
                {activeTab === 'related' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600"></div>}
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {/* Popular Songs */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Popular</h2>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {currentArtist.topSongs.map((song, index) => (
                        <div 
                          key={song.id}
                          className="flex items-center p-4 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                          onClick={() => onSongSelect(songs.findIndex(s => s.id === song.id))}
                        >
                          <div className="mr-5 text-neutral-400 w-5 text-center font-medium">{index + 1}</div>
                          <div className="w-12 h-12 rounded-md overflow-hidden mr-4 flex-shrink-0">
                            <Image 
                              src={song.cover} 
                              alt={song.title} 
                              width={48}
                              height={48}
                              className="w-full h-full object-cover" 
                              loading="lazy" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1 truncate text-gray-800">{song.title}</h3>
                            <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                          </div>
                          <div className="text-sm text-gray-600 mr-4">{song.duration}</div>
                          <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Artist Bio */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">About</h2>
                    <p className="text-gray-700">{currentArtist.bio}</p>
                    <p className="text-gray-600 mt-4 text-sm">{(currentArtist.followers).toLocaleString()} followers</p>
                  </div>
                </div>
                
                <div>
                  {/* Similar Artists */}
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Fans also like</h2>
                  <div className="grid gap-4">
                    {relatedArtists.map(artist => (
                      <div 
                        key={artist?.id}
                        className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedArtist(artist?.name || null);
                          setSongFilterQuery('');
                          setActiveTab('overview');
                        }}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden mr-4 flex-shrink-0">
                          <Image 
                            src={artist?.cover || ''} 
                            alt={artist?.name || 'Artist'} 
                            width={56}
                            height={56}
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm mb-1 text-gray-800">{artist?.name}</h3>
                          <p className="text-xs text-neutral-500">Artist</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'songs' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">All Songs</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                      </svg>
                    </button>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Filter" 
                        value={songFilterQuery}
                        onChange={(e) => setSongFilterQuery(e.target.value)}
                        className="pl-8 pr-4 py-2 rounded-full border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <SongList 
                  songs={songs
                    .filter(song => song.artist === currentArtist.name)
                    .filter(song => 
                      songFilterQuery.trim() === '' || 
                      song.title.toLowerCase().includes(songFilterQuery.toLowerCase()) ||
                      song.artist.toLowerCase().includes(songFilterQuery.toLowerCase())
                    )
                  }
                  currentSongIndex={-1}
                  onSongSelect={onSongSelect}
                />
              </>
            )}
            
            {activeTab === 'related' && (
              <>
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Related Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {artists
                    .filter(artist => artist.name !== currentArtist.name)
                    .slice(0, 10)
                    .map(artist => (
                      <div 
                        key={artist.id} 
                        className="group cursor-pointer"
                        onClick={() => {
                          setSelectedArtist(artist.name);
                          setSongFilterQuery('');
                          setActiveTab('overview');
                        }}
                      >
                        <div className="rounded-full overflow-hidden aspect-square group-hover:shadow-xl transition-all duration-300 mb-3 relative">
                          <Image 
                            src={artist.cover} 
                            alt={artist.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3">
                          <h3 className="font-medium text-sm mb-1 text-gray-800">{artist.name}</h3>
                          <p className="text-xs text-neutral-500">Artist</p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* Artists List View */
        <>
          {/* Header */}
          <div className="relative overflow-hidden h-72 bg-gradient-to-r from-rose-800 to-orange-700">
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute inset-0">
                {Array(5).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute rounded-full bg-white"
                    style={{
                      width: `${Math.random() * 300 + 100}px`,
                      height: `${Math.random() * 300 + 100}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.3,
                      mixBlendMode: 'overlay'
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="absolute top-0 left-0 p-6">
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 p-8 flex items-end">
              <div className="mr-6 bg-rose-700 rounded-xl p-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-white">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
              <div>
                <div className="text-white text-sm font-medium mb-1">BROWSE</div>
                <h1 className="text-white text-5xl font-bold mb-3">Artists</h1>
                <div className="flex items-center text-white/80 text-sm">
                  <span className="font-medium">{artists.length} popular artists</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 bg-gradient-to-b from-rose-900/10 to-neutral-50/0">
            {/* Search */}
            <div className="relative mb-8 max-w-xl">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by artist name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white text-neutral-800 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm shadow-sm"
              />
            </div>
            
            {/* Featured Artists */}
            {searchQuery.trim() === '' && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Featured Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {artists.slice(0, 6).map(artist => (
                  <div 
                    key={artist.id} 
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedArtist(artist.name);
                      setSongFilterQuery('');
                      setActiveTab('overview');
                    }}
                  >
                    <div className="bg-white p-5 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                      <div className="aspect-square rounded-full overflow-hidden mb-4 border-2 border-rose-100">
                        <Image 
                          src={artist.cover} 
                          alt={artist.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="font-medium text-sm mb-1 text-center text-gray-800">{artist.name}</h3>
                      <p className="text-xs text-neutral-500 text-center">
                        {(artist.monthlyListeners / 1000000).toFixed(1)}M listeners
                      </p>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Results or All Artists */}
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {searchQuery.trim() ? `Search Results (${filteredArtists.length})` : 'All Artists'}
              </h2>
              {filteredArtists.length === 0 && searchQuery.trim() ? (
                <div className="text-center py-12">
                  <div className="text-neutral-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-600 mb-1">No artists found</h3>
                  <p className="text-neutral-500">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(searchQuery.trim() ? filteredArtists : artists.slice(6)).map(artist => (
                  <div 
                    key={artist.id} 
                    className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedArtist(artist.name);
                      setSongFilterQuery('');
                      setActiveTab('overview');
                    }}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <Image 
                        src={artist.cover} 
                        alt={artist.name} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover" 
                        loading="lazy" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 truncate text-gray-800">{artist.name}</h3>
                      <p className="text-sm text-neutral-500">
                        {artist.topSongs.length} songs • {(artist.monthlyListeners / 1000000).toFixed(1)}M monthly listeners
                      </p>
                    </div>
                    <button className="w-10 h-10 bg-rose-50 hover:bg-rose-100 rounded-full flex items-center justify-center ml-2 text-rose-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArtistsPage; 