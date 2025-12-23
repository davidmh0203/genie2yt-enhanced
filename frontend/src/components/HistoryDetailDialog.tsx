import { useState, useEffect } from 'react';
import { api, type ConvertLogItem } from '../utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Loader2, CheckCircle2, XCircle, Youtube } from 'lucide-react';
import { Button } from './ui/button';

interface HistoryDetailDialogProps {
  logId: number;
  playlistTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDetailDialog({
  logId,
  playlistTitle,
  open,
  onOpenChange,
}: HistoryDetailDialogProps) {
  const [items, setItems] = useState<ConvertLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && logId) {
      loadItems();
    }
  }, [open, logId]);

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.getConvertLogItems(logId);
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '세부 내용을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const successItems = items.filter((item) => item.is_success === 1);
  const failItems = items.filter((item) => item.is_success === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{playlistTitle || '변환 세부 내용'}</DialogTitle>
          <DialogDescription>
            성공: {successItems.length}곡 / 실패: {failItems.length}곡 / 전체: {items.length}곡
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* 성공한 곡들 */}
            {successItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  성공한 곡 ({successItems.length}곡)
                </h3>
                <div className="space-y-2">
                  {successItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {item.song_title}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{item.song_artist}</div>
                          {item.matched_video_title && (
                            <div className="text-xs text-slate-500 mt-1 truncate">
                              → {item.matched_video_title}
                            </div>
                          )}
                          {item.confidence !== undefined && (
                            <div className="text-xs text-slate-500 mt-1">
                              신뢰도: {(item.confidence * 100).toFixed(1)}% ({item.match_strategy})
                            </div>
                          )}
                        </div>
                        {item.matched_video_id && (
                          <a
                            href={`https://www.youtube.com/watch?v=${item.matched_video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                              <Youtube className="w-4 h-4" />
                              <span className="hidden sm:inline">보기</span>
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실패한 곡들 */}
            {failItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  실패한 곡 ({failItems.length}곡)
                </h3>
                <div className="space-y-2">
                  {failItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="border border-red-200 rounded-lg p-3 bg-red-50/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {item.song_title}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{item.song_artist}</div>
                          {item.error_msg && (
                            <div className="text-xs text-red-600 mt-1">{item.error_msg}</div>
                          )}
                          {item.confidence !== undefined && (
                            <div className="text-xs text-slate-500 mt-1">
                              신뢰도: {(item.confidence * 100).toFixed(1)}% ({item.match_strategy})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                세부 내용이 없습니다.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

