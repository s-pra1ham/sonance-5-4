import { useState, useEffect } from 'react';
import Image from 'next/image';
import { songs } from '../data/songs';

interface PlaylistPageProps {
  playlistName: string;
  onClose: () => void;
  onSongSelect: (songIndex: number) => void;
  playlistSongs?: Set<number>; // Add this to receive actual playlist songs
}

// Mock playlist data - in a real app, this would come from a database
const playlists = {
  "Top Hits 2025": {
    description: "The hottest tracks of the year, all in one playlist.",
    color: "from-purple-400 to-pink-500",
    creator: "Sonance",
    followers: "2.3M",
    songIds: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28] // These are IDs from the songs array
  },
  "Chill Vibes": {
    description: "Relaxing tunes to help you unwind and destress.",
    color: "from-blue-400 to-teal-500",
    creator: "Sonance",
    followers: "1.8M",
    songIds: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29]
  },
  "Party Mix": {
    description: "Upbeat tracks to keep the energy high all night long.",
    color: "from-amber-400 to-red-500",
    creator: "Sonance",
    followers: "1.5M",
    songIds: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]
  }
};

function PlaylistPage({ playlistName, onClose, onSongSelect, playlistSongs: actualPlaylistSongs }: PlaylistPageProps) {
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const playlist = playlists[playlistName as keyof typeof playlists] || {
    description: "Custom playlist",
    color: "from-gray-400 to-gray-600",
    creator: "User",
    followers: "0",
    songIds: []
  };

  useEffect(() => {
    // Use actual playlist songs if provided, otherwise fall back to mock data
    if (actualPlaylistSongs) {
      const filteredSongs = songs.filter(song => actualPlaylistSongs.has(song.id));
      setPlaylistSongs(filteredSongs);
    } else {
      // Fallback to mock data
      const filteredSongs = songs.filter(song => playlist.songIds.includes(song.id));
      setPlaylistSongs(filteredSongs);
    }
    setIsLoading(false);
  }, [playlistName, playlist.songIds, actualPlaylistSongs]);

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
        <div className={`bg-gradient-to-br ${playlist.color} rounded-2xl p-6 text-white mb-8`}>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="w-40 h-40 md:w-52 md:h-52 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
              {playlistSongs.length > 0 ? (
                <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                  {playlistSongs.slice(0, 4).map((song, index) => (
                    <div key={index} className="overflow-hidden">
                      <Image
                        src={song.cover}
                        alt={song.title}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${playlist.color}`}></div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <span className="text-sm font-medium uppercase tracking-wider opacity-90">Playlist</span>
                <h1 className="text-4xl md:text-6xl font-bold mt-2">{playlistName}</h1>
              </div>

              <p className="opacity-90 mb-6">{playlist.description}</p>

              <div className="flex items-center text-sm">
                <span className="font-semibold">{playlist.creator}</span>
                <span className="mx-2 opacity-80">•</span>
                <span className="opacity-80">{playlist.followers} followers</span>
                <span className="mx-2 opacity-80">•</span>
                <span className="opacity-80">{playlistSongs.length} songs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Playlist Songs</h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (playlistSongs.length > 0) {
                        onSongSelect(playlistSongs[0].id - 1);
                      }
                    }}
                    className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Play All
                  </button>
                </div>
              </div>

              {/* Song list with additional information */}
              <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm mb-10">
                {/* Table header */}
                <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <div className="col-span-1 flex items-center justify-center">#</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-3">Album</div>
                  <div className="col-span-2">Added</div>
                  <div className="col-span-1 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                </div>

                {playlistSongs.length > 0 ? (
                  playlistSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-200 last:border-b-0"
                      onClick={() => onSongSelect(song.id - 1)}
                    >
                      <div className="col-span-1 text-center text-gray-500">{index + 1}</div>
                      <div className="col-span-5 flex items-center">
                        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                          <Image
                            src={song.cover}
                            alt={song.title}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                            style={{ objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1 text-gray-800">{song.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{song.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 line-clamp-1">
                        {song.album || song.artist + " - Album"}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {Math.floor(Math.random() * 4) + 1} days ago
                      </div>
                      <div className="col-span-1 flex items-center justify-center text-gray-500">
                        {song.duration}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-500">
                    This playlist is empty. Add some songs to get started.
                  </div>
                )}
              </div>

              {/* About section */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-gray-800">About</h2>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-gray-700 mb-4">
                    {playlist.description} This playlist is curated by {playlist.creator} and has {playlist.followers} followers.
                  </p>
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-medium">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Followed by {Math.floor(Math.random() * 5) + 3} of your friends
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended section - show similar playlists */}
              <div className="pb-24">
                <h2 className="text-xl font-bold mb-4 text-gray-800">You might also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {Object.entries(playlists)
                    .filter(([name]) => name !== playlistName)
                    .map(([name, data], index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            onSongSelect(data.songIds[0] - 1);
                            window.dispatchEvent(new CustomEvent('navigate-to-playlist', { detail: { playlistName: name } }));
                          }, 100);
                        }}
                      >
                        <div className={`w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br ${data.color}`}></div>
                        <h3 className="font-medium mb-1 text-gray-800">{name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{data.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistPage; 