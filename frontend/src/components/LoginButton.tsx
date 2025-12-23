import { useCallback, useEffect, useRef, useState } from 'react';

interface LoginButtonProps {
  onLoginSuccess: (accessToken: string) => void;
  isLoggedIn?: boolean;
}

interface AuthMessage {
  source?: string;
  type?: 'success' | 'error';
  accessToken?: string | null;
  error?: {
    description?: string | null;
  };
}

export function LoginButton({ onLoginSuccess, isLoggedIn }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const handlerRef = useRef<((event: MessageEvent<AuthMessage>) => void) | null>(null);

  const resetAuthFlow = useCallback((closePopup = true) => {
    if (handlerRef.current) {
      window.removeEventListener('message', handlerRef.current);
      handlerRef.current = null;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (closePopup && popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    popupRef.current = null;
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => resetAuthFlow();
  }, [resetAuthFlow]);

  const handleGoogleLogin = () => {
    resetAuthFlow();
    setIsLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
    const redirectUri = `${window.location.origin}/authorize`;
    const scope = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.upload',
    ].join(' ');

    if (!clientId) {
      alert('Google Client ID가 설정되지 않았습니다. .env 파일에 VITE_GOOGLE_CLIENT_ID를 추가해주세요.');
      setIsLoading(false);
      return;
    }

    const authUrl =
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=token' +
      `&scope=${encodeURIComponent(scope)}` +
      '&include_granted_scopes=true';

    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(authUrl, 'google-oauth', `width=${width},height=${height},left=${left},top=${top}`);

    if (!popup) {
      setIsLoading(false);
      alert('팝업이 차단되었습니다. 팝업 차단을 해제한 뒤 다시 시도해주세요.');
      return;
    }

    popupRef.current = popup;

    const handleMessage = (event: MessageEvent<AuthMessage>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.source !== 'playlist-converter-auth') {
        return;
      }

      if (event.data.type === 'success' && event.data.accessToken) {
        onLoginSuccess(event.data.accessToken);
      } else if (event.data.type === 'error') {
        alert(event.data.error?.description ?? 'Google 로그인에 실패했습니다.');
      } else {
        alert('예상치 못한 응답입니다. 다시 시도해주세요.');
      }

      resetAuthFlow();
    };

    handlerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);

    timeoutRef.current = window.setTimeout(() => {
      resetAuthFlow();
      alert('로그인이 제한 시간 안에 완료되지 않았습니다. 다시 시도해주세요.');
    }, 60_000);
  };

  if (isLoggedIn) {
    return null; // 로그인된 경우 UserProfile 컴포넌트가 표시됨
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="relative inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
      aria-label="Google 계정으로 로그인"
    >
      <img
        src="/images/google-signin.svg"
        alt="Google 계정으로 로그인"
        className="h-9 sm:h-10 w-auto max-w-full"
        style={{ minWidth: '140px' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[19.5px]">
          <span className="text-xs sm:text-sm text-slate-600">로그인 중...</span>
        </div>
      )}
    </button>
  );
}






