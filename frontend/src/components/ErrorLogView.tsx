import { useState, useEffect } from 'react';
import { api, type ConvertLog } from '../utils/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface ErrorLogViewProps {
  userId?: number;
}

export function ErrorLogView({ userId }: ErrorLogViewProps) {
  const [logs, setLogs] = useState<ConvertLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadErrors();
  }, [userId]);

  const loadErrors = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.getErrors(userId);
      setLogs(result.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : '에러 로그를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 rounded-2xl shadow-lg p-8 border border-purple-100/70">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">에러 로그</h2>
        <Button onClick={loadErrors} disabled={loading} variant="outline" size="sm">
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
          <AlertDescription>에러 로그가 없습니다.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.log_id} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">
                    {log.playlist_title || '제목 없음'} ({new Date(log.created_at).toLocaleString('ko-KR')})
                  </h3>
                  <div className="space-y-1 text-sm text-red-800">
                    <div>
                      실패: {log.fail_count}곡 / 전체: {log.total_count}곡
                    </div>
                    {log.error_msg && (
                      <div className="mt-2 p-2 bg-white rounded border border-red-200">
                        <strong>오류 메시지:</strong>
                        <pre className="mt-1 text-xs whitespace-pre-wrap">{log.error_msg}</pre>
                      </div>
                    )}
                    {log.src_playlist && (
                      <div className="mt-2 text-xs text-red-600">
                        원본 URL: <a href={log.src_playlist} target="_blank" rel="noopener noreferrer" className="underline">{log.src_playlist}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






