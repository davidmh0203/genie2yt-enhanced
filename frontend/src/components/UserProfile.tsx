import { LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface UserProfileProps {
  name: string;
  picture?: string;
  onLogout: () => void;
}

export function UserProfile({ name, picture, onLogout }: UserProfileProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* 프로필 사진과 이름 */}
      <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white/80 border border-purple-100/70 shadow-sm">
        {picture ? (
          <img
            src={picture}
            alt={name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs sm:text-sm font-semibold border-2 border-purple-200 flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline-block max-w-[120px] truncate">
          {name}
        </span>
        {/* 모바일에서 이름 첫 글자만 표시 */}
        <span className="text-xs font-medium text-slate-700 sm:hidden">
          {name.length > 10 ? `${name.substring(0, 8)}...` : name}
        </span>
      </div>

      {/* 로그아웃 버튼 */}
      <Button
        onClick={onLogout}
        variant="outline"
        size="sm"
        className="gap-1.5 sm:gap-2 px-2 sm:px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm"
      >
        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">로그아웃</span>
      </Button>
    </div>
  );
}

