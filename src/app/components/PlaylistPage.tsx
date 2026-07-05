import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Song } from '../data/songs';

interface PlaylistPageProps {
  playlistName: string;
  onClose: () => void;
  onSongSelect: (songIndex: number) => void;
  playlistSongs?: Song[];
}

const mockPlaylistsMeta = {
  "Top Hits 2025": {
    description: "The hottest tracks of the year, all in one playlist.",
    color: "from-purple-400 to-pink-500",
    creator: "Sonance",
    followers: "2.3M"
  },
  "Chill Vibes": {
    description: "Relaxing tunes to help you unwind and destress.",
    color: "from-blue-400 to-teal-500",
    creator: "Sonance",
    followers: "1.8M"
  },
  "Party Mix": {
    description: "Upbeat tracks to keep the energy high all night long.",
    color: "from-amber-400 to-red-500",
    creator: "Sonance",
    followers: "1.5M"
  }
};

function PlaylistPage({ playlistName, onClose, onSongSelect, playlistSongs: actualPlaylistSongs = [] }: PlaylistPageProps) {
  const [playlistSongsList, setPlaylistSongsList] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const playlistMeta = mockPlaylistsMeta[playlistName as keyof typeof mockPlaylistsMeta] || {
    description: "Custom playlist",
    color: "from-gray-400 to-gray-600",
    creator: "User",
    followers: "0"
  };

  useEffect(() => {
    setPlaylistSongsList(actualPlaylistSongs);
    setIsLoading(false);
  }, [playlistName, actualPlaylistSongs]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="p-4 md:p-6 pb-28">
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
            Back
          </button>
        </div>

        {/* Header with gradient background */}
        <div className={`bg-gradient-to-br ${playlistMeta.color} rounded-2xl p-6 text-white mb-8`}>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="w-40 h-40 md:w-52 md:h-52 flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-black/10 relative">
              {playlistSongsList.length > 0 ? (
                <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                  {playlistSongsList.slice(0, 4).map((song, index) => (
                    <div key={index} className="relative w-full h-full">
                      <Image
                        src={song.cover}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${playlistMeta.color}`}></div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <span className="text-sm font-medium uppercase tracking-wider opacity-90">Playlist</span>
                <h1 className="text-4xl md:text-6xl font-bold mt-2">{playlistName}</h1>
              </div>

              <p className="opacity-90 mb-6">{playlistMeta.description}</p>

              <div className="flex items-center text-sm">
                <span className="font-semibold">{playlistMeta.creator}</span>
                <span className="mx-2 opacity-80">•</span>
                <span className="opacity-80">{playlistMeta.followers} followers</span>
                <span className="mx-2 opacity-80">•</span>
                <span className="opacity-80">{playlistSongsList.length} songs</span>
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
                      if (playlistSongsList.length > 0) {
                        onSongSelect(0);
                      }
                    }}
                    className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    disabled={playlistSongsList.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Play All
                  </button>
                </div>
              </div>

              {/* Song list table */}
              <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm mb-10 border border-gray-100">
                <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <div className="col-span-1 flex items-center justify-center">#</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-4">Album</div>
                  <div className="col-span-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                </div>

                {playlistSongsList.length > 0 ? (
                  playlistSongsList.map((song, index) => (
                    <div
                      key={song.id}
                      className="grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-200 last:border-b-0"
                      onClick={() => onSongSelect(index)}
                    >
                      <div className="col-span-1 text-center text-gray-500">{index + 1}</div>
                      <div className="col-span-5 flex items-center">
                        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0 relative bg-neutral-200">
                          <Image
                            src={song.cover}
                            alt={song.title}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1 text-gray-800">{song.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{song.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-4 text-sm text-gray-600 line-clamp-1">
                        {song.album}
                      </div>
                      <div className="col-span-2 flex items-center justify-center text-gray-500 text-sm">
                        {song.duration}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    This playlist is empty.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistPage;