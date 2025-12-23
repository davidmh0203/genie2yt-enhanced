import { Music2, Copy, CheckCircle, Disc3, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import type { Song } from '../utils/api';

interface SongListProps {
  songs: Song[];
  matchedSongs?: Set<string>; // 매칭된 곡들의 키 (title + artist)
}

export function SongList({ songs, matchedSongs }: SongListProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyList = async () => {
    const text = songs.map((song, i) => `${i + 1}. ${song.title} - ${song.artist}${song.album ? ` (${song.album})` : ''}`).join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (songs.length === 0) {
    return null;
  }

  const hasAlbumInfo = songs.some((s) => s.album || s.albumImage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">곡 목록 ({songs.length}곡)</h3>
        </div>
        <Button onClick={handleCopyList} variant="outline" size="sm" className="gap-2">
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              목록 복사
            </>
          )}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b">
                <th className="text-left p-3 w-12">#</th>
                {hasAlbumInfo && <th className="text-left p-3 w-16">앨범</th>}
                <th className="text-left p-3">곡명</th>
                <th className="text-left p-3">아티스트</th>
                {hasAlbumInfo && <th className="text-left p-3">앨범명</th>}
                <th className="text-left p-3 w-16">상태</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => {
                const songKey = `${song.title}|${song.artist}`;
                const isMatched = matchedSongs?.has(songKey) || song.youtubeUrl;
                
                return (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    {hasAlbumInfo && (
                      <td className="p-3">
                        {song.albumImage ? (
                          <img src={song.albumImage} alt={song.album || song.title} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                            <Disc3 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                    )}
                    <td className="p-3">
                      <p className="line-clamp-2">{song.title}</p>
                    </td>
                    <td className="p-3 text-gray-600">
                      <p className="line-clamp-1">{song.artist}</p>
                    </td>
                    {hasAlbumInfo && (
                      <td className="p-3 text-gray-500">
                        <p className="line-clamp-1">{song.album || '-'}</p>
                      </td>
                    )}
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        <Youtube 
                          className={`w-5 h-5 transition-colors ${
                            isMatched ? 'text-red-600' : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}






