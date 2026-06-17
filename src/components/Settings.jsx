import React, { useState, useEffect } from 'react';
import { getSettingsWithDefaults, saveSettings } from '../utils/storage';
import { supabase } from '../utils/supabase';
import PageHeader from './PageHeader';

export default function Settings({ user }) {
  const [s, setS]       = useState({ name: '', notificationTime: '21:00', notificationEnabled: false });
  const [saved, setSaved] = useState(false);
  const [perm, setPerm]   = useState('default');

  useEffect(() => {
    setS(getSettingsWithDefaults());
    if ('Notification' in window) setPerm(Notification.permission);
  }, []);

  const set = (key, val) => setS((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestNotif = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知に対応していません');
      return;
    }
    const result = await Notification.requestPermission();
    setPerm(result);
    if (result === 'granted') {
      set('notificationEnabled', true);
      new Notification('こころの記録 🌱', {
        body: '通知が設定されました！毎日の記録を続けましょう。',
      });
    }
  };

  return (
    <div className="screen settings-screen">
      <PageHeader title="設定" subtitle="アプリのカスタマイズ" emoji="⚙️" />

      {user && (
        <div className="card user-card">
          <div className="user-row">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar" className="user-avatar" />
            ) : (
              <div className="user-avatar-fallback">
                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="user-info">
              <div className="user-name">{user.user_metadata?.full_name || user.user_metadata?.name || 'ユーザー'}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={async () => {
              if (window.confirm('ログアウトしますか？')) await supabase.auth.signOut();
            }}
          >
            ログアウト
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="card-section-title">プロフィール</h2>
        <label className="form-label">お名前（任意）</label>
        <input
          type="text"
          className="form-input"
          value={s.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="ニックネームでもOK"
          maxLength={20}
        />
      </div>

      <div className="card">
        <h2 className="card-section-title">🔔 リマインダー</h2>
        <label className="form-label">通知時刻</label>
        <input
          type="time"
          className="form-input"
          value={s.notificationTime}
          onChange={(e) => set('notificationTime', e.target.value)}
        />
        <div className="notif-block">
          {perm === 'granted' ? (
            <div className="notif-ok">
              <span>✅</span>
              <span>通知が有効です（アプリを開いているとき {s.notificationTime} に通知します）</span>
            </div>
          ) : perm === 'denied' ? (
            <div className="notif-denied">
              <span>🔕</span>
              <span>通知がブロックされています。ブラウザの設定から許可してください。</span>
            </div>
          ) : (
            <button className="notif-request-btn" onClick={requestNotif}>
              🔔 通知を許可する
            </button>
          )}
        </div>
      </div>

      <div className="card privacy-card">
        <h2 className="card-section-title">🔒 プライバシー</h2>
        <p className="privacy-text">
          記録データはSupabaseデータベースに安全に保存されます。<br />
          AI相談機能を使用する場合のみ、状態データがサーバーに送信されます。
        </p>
      </div>

      <div className="card">
        <h2 className="card-section-title">データ管理</h2>
        <button
          className="danger-btn"
          onClick={() => {
            if (window.confirm('すべての記録を削除します。この操作は元に戻せません。')) {
              localStorage.removeItem('kokoro_entries');
              alert('記録を削除しました。');
            }
          }}
        >
          🗑 記録をすべて削除する
        </button>
      </div>

      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ 保存しました！' : '設定を保存する'}
      </button>
    </div>
  );
}
