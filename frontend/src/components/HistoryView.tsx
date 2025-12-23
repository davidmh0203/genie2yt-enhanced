import { useState, useEffect } from 'react';
import { api, type ConvertLog } from '../utils/api';
import { Loader2, Calendar, Youtube, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { HistoryDetailDialog } from './HistoryDetailDialog';

interface HistoryViewProps {
  userId?: number;
}

export function HistoryView({ userId }: HistoryViewProps) {
  const [logs, setLogs] = useState<ConvertLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.getHistory(userId);
      setLogs(result.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이력을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="bg-white/90 rounded-2xl shadow-lg p-8 border border-purple-100/70">
        <Alert>
          <AlertDescription>로그인 후 변환 이력을 확인할 수 있습니다.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-2xl shadow-lg p-8 border border-purple-100/70">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">변환 이력</h2>
        <Button onClick={loadHistory} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '새로고침'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : logs.length === 0 ? (
        <Alert>
          <AlertDescription>변환 이력이 없습니다.</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.log_id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedLogId(log.log_id);
                  setDetailDialogOpen(true);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{log.playlist_title || '제목 없음'}</h3>
                      <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(log.created_at).toLocaleString('ko-KR')}</span>
                      </div>
                      <div>
                        성공: <span className="text-emerald-600 font-medium">{log.success_count}</span>곡 / 실패: <span className="text-red-600 font-medium">{log.fail_count}</span>곡 / 전체: {log.total_count}곡
                      </div>
                      {log.processing_time_ms && (
                        <div>처리 시간: {(log.processing_time_ms / 1000).toFixed(1)}초</div>
                      )}
                      {log.error_msg && (
                        <div className="text-red-600 mt-2">
                          <strong>오류:</strong> {log.error_msg}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {log.dest_playlist && (
                      <a
                        href={`https://www.youtube.com/playlist?list=${log.dest_playlist}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                          <Youtube className="w-4 h-4" />
                          열기
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedLogId && (
            <HistoryDetailDialog
              logId={selectedLogId}
              playlistTitle={logs.find((log) => log.log_id === selectedLogId)?.playlist_title}
              open={detailDialogOpen}
              onOpenChange={setDetailDialogOpen}
            />
          )}
        </>
      )}
    </div>
  );
}






