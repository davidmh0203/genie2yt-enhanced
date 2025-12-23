import { useEffect } from 'react';

const sendMessageToOpener = (payload: Record<string, unknown>) => {
  try {
    if (window.opener) {
      window.opener.postMessage({ source: 'playlist-converter-auth', ...payload }, window.location.origin);
    }
  } catch (error) {
    console.error('OAuth 메시지 전달에 실패했습니다.', error);
  }
};

export function AuthorizeCallback() {
  useEffect(() => {
    document.title = 'Google OAuth 처리 중...';

    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : '';
    const params = new URLSearchParams(hash);

    if (params.has('error')) {
      sendMessageToOpener({
        type: 'error',
        error: {
          code: params.get('error'),
          description: params.get('error_description') ?? 'Google 로그인에 실패했습니다.',
        },
      });
    } else if (params.has('access_token')) {
      sendMessageToOpener({
        type: 'success',
        accessToken: params.get('access_token'),
        expiresIn: Number(params.get('expires_in') ?? '0'),
        tokenType: params.get('token_type') ?? 'Bearer',
      });
    } else {
      sendMessageToOpener({
        type: 'error',
        error: {
          code: 'missing_token',
          description: 'OAuth 토큰이 포함되지 않았습니다.',
        },
      });
    }

    const timeout = window.setTimeout(() => {
      try {
        window.close();
      } catch (error) {
        console.warn('팝업을 자동으로 닫지 못했습니다.', error);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <h1 className="text-xl font-semibold text-zinc-900">Google 계정 확인 중...</h1>
        <p className="text-sm text-zinc-500">잠시만 기다려주세요. 창이 자동으로 닫힙니다.</p>
        <p className="text-xs text-zinc-400">자동으로 닫히지 않으면 이 창을 닫고 앱으로 돌아가세요.</p>
      </div>
    </div>
  );
}






