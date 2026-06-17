import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Login() {
  const [loading, setLoading] = useState('');
  const [error, setError]     = useState('');

  const signIn = async (provider) => {
    setLoading(provider);
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (err) {
      setError(err.message);
      setLoading('');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="login-emoji">🌱</div>
        <h1 className="login-title">こころの記録</h1>
        <p className="login-subtitle">あなたの心と体のバロメーター</p>
      </div>

      <div className="login-card">
        <p className="login-desc">
          ログインするとデータが保護され、<br />どのデバイスからでもアクセスできます。
        </p>

        <button
          className="oauth-btn google"
          onClick={() => signIn('google')}
          disabled={!!loading}
        >
          {loading === 'google' ? (
            <span className="btn-spinner" />
          ) : (
            <GoogleIcon />
          )}
          <span>{loading === 'google' ? '接続中…' : 'Googleでログイン'}</span>
        </button>

        <button
          className="oauth-btn discord"
          onClick={() => signIn('discord')}
          disabled={!!loading}
        >
          {loading === 'discord' ? (
            <span className="btn-spinner white" />
          ) : (
            <DiscordIcon />
          )}
          <span>{loading === 'discord' ? '接続中…' : 'Discordでログイン'}</span>
        </button>

        {error && <p className="login-error">⚠️ {error}</p>}

        <p className="login-note">
          ログインすることで、記録データはあなたのアカウントに安全に紐付けられます。
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 71 55" fill="white">
      <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.7a40.6 40.6 0 0 0-1.8 3.7 54.2 54.2 0 0 0-16.3 0A38.5 38.5 0 0 0 25.6.7 58.4 58.4 0 0 0 11 4.9C1.6 19 -1 32.8.3 46.4a58.9 58.9 0 0 0 17.9 9.1 44.8 44.8 0 0 0 3.9-6.3 38.3 38.3 0 0 1-6.1-2.9l1.5-1.1a42 42 0 0 0 35.8 0l1.5 1.1a38.3 38.3 0 0 1-6.1 2.9 44.8 44.8 0 0 0 3.9 6.3 58.7 58.7 0 0 0 17.9-9.1C71.8 30.7 68 17 60.1 4.9ZM23.7 38.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Z"/>
    </svg>
  );
}
