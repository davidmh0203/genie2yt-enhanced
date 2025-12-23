import { Progress } from './ui/progress';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ProgressDisplayProps {
  current: number;
  total: number;
  status: 'parsing' | 'creating' | 'adding' | 'completed' | 'error';
}

export function ProgressDisplay({ current, total, status }: ProgressDisplayProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const getStatusText = () => {
    switch (status) {
      case 'parsing':
        return '지니뮤직 플레이리스트 분석 중...';
      case 'creating':
        return 'YouTube 플레이리스트 생성 중...';
      case 'adding':
        return '곡 추가 중...';
      case 'completed':
        return '변환 완료!';
      case 'error':
        return '오류 발생';
      default:
        return '준비 중...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="text-sm text-gray-600">{getStatusText()}</p>
        </div>
      </div>

      {total > 0 && (
        <>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {current} / {total} 곡
            </span>
            <span>{percentage}%</span>
          </div>
        </>
      )}
    </div>
  );
}










