import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Music, Loader2, AlertCircle, Youtube, History, FileX } from 'lucide-react';
import { LoginButton } from './components/LoginButton';
import { UserProfile } from './components/UserProfile';
import { SongList } from './components/SongList';
import { ProgressDisplay } from './components/ProgressDisplay';
import { HistoryView } from './components/HistoryView';
import { ErrorLogView } from './components/ErrorLogView';
import { api, type Song, type ConversionResult } from './utils/api';

interface UserProfile {
  name: string;
  email?: string;
  picture?: string;
  userId?: number;
}

type ProgressStatus = 'parsing' | 'creating' | 'adding' | 'completed' | 'error';

const getDefaultPlaylistTitle = (count: number) => {
  const date = new Date().toLocaleDateString('ko-KR');
  return `지니 플레이리스트 ${count > 0 ? `(${count}곡, ${date})` : ''}`.trim();
};

export default function App() {
  const [genieUrl, setGenieUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistProgress, setPlaylistProgress] = useState<{
    current: number;
    total: number;
    status: ProgressStatus;
  }>({
    current: 0,
    total: 0,
    status: 'creating',
  });
  const [playlistResult, setPlaylistResult] = useState<ConversionResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('convert');
  const [matchedSongs, setMatchedSongs] = useState<Set<string>>(new Set());

  const validateUrl = (url: string): boolean => {
    return url.includes('genie.co.kr');
  };

  const handleParse = async () => {
    setError('');
    setSongs([]);
    setPlaylistResult(null);
    setPlaylistTitle('');
    setMatchedSongs(new Set());

    if (!genieUrl) {
      setError('지니뮤직 URL을 입력해주세요.');
      return;
    }

    if (!validateUrl(genieUrl)) {
      setError('올바른 지니뮤직 URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.parseGenie(genieUrl);
      setSongs(result.songs);
      setPlaylistTitle(result.title || getDefaultPlaylistTitle(result.songs.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!accessToken) {
      setError('Google 계정으로 로그인한 뒤 다시 시도해주세요.');
      return;
    }

    if (songs.length === 0) {
      setError('먼저 지니뮤직 플레이리스트를 파싱해주세요.');
      return;
    }

    const title = playlistTitle.trim() || getDefaultPlaylistTitle(songs.length);

    setError('');
    setPlaylistResult(null);
    setIsCreatingPlaylist(true);
    setPlaylistProgress({
      status: 'creating',
      current: 0,
      total: songs.length,
    });

    try {
      const result = await api.convert(genieUrl, title, accessToken, userProfile?.email);
      setPlaylistResult(result);
      
      // userId 업데이트 (변환 시 사용자가 생성/업데이트됨)
      if (result.userId && userProfile) {
        setUserProfile({
          ...userProfile,
          userId: result.userId,
        });
      }
      
      // 변환 로그 아이템을 가져와서 매칭된 곡들 표시
      if (result.logId) {
        try {
          const logItems = await api.getConvertLogItems(result.logId);
          const matched = new Set<string>();
          logItems.items.forEach((item) => {
            if (item.is_success === 1 && item.matched_video_id) {
              matched.add(`${item.song_title}|${item.song_artist}`);
            }
          });
          setMatchedSongs(matched);
        } catch (err) {
          console.error('Failed to load log items', err);
        }
      }
      
      setPlaylistProgress({
        status: 'completed',
        current: result.totalCount,
        total: result.totalCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '변환에 실패했습니다.');
      setPlaylistProgress({
        status: 'error',
        current: 0,
        total: songs.length,
      });
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // 백엔드에서 userId 조회
        let userId: number | undefined;
        if (data.email) {
          try {
            const userData = await api.getUserByEmail(data.email);
            if (userData) {
              userId = userData.userId;
            }
          } catch (err) {
            console.error('Failed to fetch user ID', err);
            // 사용자가 없어도 계속 진행 (첫 로그인일 수 있음)
          }
        }
        
        setUserProfile({
          name: data.name || data.given_name || 'Google 사용자',
          email: data.email,
          picture: data.picture,
          userId: userId,
        });
      }
    } catch (error) {
      console.error('Failed to load Google profile', error);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAccessToken(token);
    void fetchUserProfile(token);
  };

  const handleLogout = () => {
    setAccessToken('');
    setUserProfile(null);
    setPlaylistResult(null);
    setSongs([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <nav className="flex flex-wrap items-center justify-between gap-3 mb-10 rounded-2xl border border-purple-100/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
              <Music className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Genie2YT Enhanced</p>
              <p className="text-xs text-slate-500">Genie → YouTube 플레이리스트</p>
            </div>
          </div>
          {accessToken && userProfile ? (
            <UserProfile
              name={userProfile.name}
              picture={userProfile.picture}
              onLogout={handleLogout}
            />
          ) : (
            <LoginButton onLoginSuccess={handleLoginSuccess} isLoggedIn={Boolean(accessToken)} />
          )}
        </nav>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="convert">
              <Music className="w-4 h-4 mr-2" />
              변환
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              이력
            </TabsTrigger>
            <TabsTrigger value="errors">
              <FileX className="w-4 h-4 mr-2" />
              에러 로그
            </TabsTrigger>
          </TabsList>

          <TabsContent value="convert" className="mt-6">
            <div className="bg-white/90 rounded-2xl shadow-lg p-8 mb-10 border border-purple-100/70">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="genie-url">지니뮤직 URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="genie-url"
                      type="text"
                      placeholder="https://www.genie.co.kr/..."
                      value={genieUrl}
                      onChange={(e) => setGenieUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                          handleParse();
                        }
                      }}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={handleParse} disabled={isLoading} className="gap-2 px-8">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          파싱 중...
                        </>
                      ) : (
                        <>
                          <Music className="w-4 h-4" />
                          파싱
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {songs.length > 0 && (
                  <div className="pt-6 border-t">
                    <SongList songs={songs} matchedSongs={matchedSongs} />
                  </div>
                )}

                {accessToken && songs.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">YouTube 플레이리스트 생성</p>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div className="flex-1">
                        <Label htmlFor="youtube-playlist-title">플레이리스트 제목</Label>
                        <Input
                          id="youtube-playlist-title"
                          type="text"
                          value={playlistTitle}
                          onChange={(e) => setPlaylistTitle(e.target.value)}
                          placeholder="YouTube 플레이리스트 제목"
                          disabled={isCreatingPlaylist}
                        />
                      </div>
                      <Button
                        onClick={handleConvert}
                        disabled={isCreatingPlaylist}
                        className="gap-2 md:w-60 md:self-end md:ml-4"
                      >
                        {isCreatingPlaylist ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Youtube className="w-4 h-4" />
                            재생목록 만들기
                          </>
                        )}
                      </Button>
                    </div>

                    {isCreatingPlaylist && (
                      <ProgressDisplay
                        current={playlistProgress.current}
                        total={playlistProgress.total}
                        status={playlistProgress.status}
                      />
                    )}

                    {playlistResult && (
                      <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4">
                        <p className="font-semibold text-slate-900">
                          변환이 완료되었습니다! ({playlistResult.successCount}/{playlistResult.totalCount}곡 성공)
                        </p>
                        <a
                          href={playlistResult.playlistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <Youtube className="w-5 h-5" />
                          YouTube에서 열기
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryView userId={userProfile?.userId} />
          </TabsContent>

          <TabsContent value="errors" className="mt-6">
            <ErrorLogView userId={userProfile?.userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}






