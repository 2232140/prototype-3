import React, { useState, useEffect } from 'react';
import { saveEntry, getTodayEntry } from '../utils/storage';
import { MOOD_OPTIONS, ENERGY_OPTIONS } from '../utils/analysis';

const MESSAGES = [
  '記録してくれてありがとう！\nあなたのことを、ちゃんと知っていけるね。🌱',
  '今日も記録できたね！\nその積み重ねが、あなたの力になっていくよ。✨',
  'えらい！継続は力なり。\nあなたは今日も一歩前進した。🎉',
  '自分の状態に気づくこと、\nそれだけで十分すごいことだよ。🌸',
];

export default function CheckIn({ onNavigate }) {
  const [step, setStep]     = useState(1);
  const [mood, setMood]     = useState(null);
  const [energy, setEnergy] = useState(null);
  const [memo, setMemo]     = useState('');
  const [msg, setMsg]       = useState('');
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    (async () => {
      const today = await getTodayEntry();
      if (today) {
        setMood(today.mood);
        setEnergy(today.energy);
        setMemo(today.memo || '');
      }
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    })();
  }, []);

  const submit = () => {
    if (!mood || !energy) return;
    setRipple(true);
    setTimeout(async () => {
      await saveEntry({ mood, energy, memo });
      setStep(4);
    }, 650);
    setTimeout(() => setRipple(false), 1500);
  };

  const pickMood = (v) => {
    setMood(v);
    setTimeout(() => setStep(2), 250);
  };

  const pickEnergy = (v) => {
    setEnergy(v);
    setTimeout(() => setStep(3), 250);
  };

  return (
    <div className={`screen ${step === 4 ? '' : 'checkin-screen'}`}>

      {ripple && (
        <div className="ripple-overlay">
          <div className="ripple-circle r1" />
          <div className="ripple-circle r2" />
          <div className="ripple-circle r3" />
        </div>
      )}

      {step === 4 ? (
        <div className="checkin-done">
          <div className="done-emoji-big">🎉</div>
          <h2 className="done-title-big">記録完了！</h2>
          <p className="done-msg">{msg}</p>
          <button className="primary-btn full" onClick={() => onNavigate('home')}>
            ホームに戻る
          </button>
        </div>
      ) : (
        <>
          <div className="checkin-header">
            <h1 className="checkin-title">今日の記録</h1>
            <div className="step-dots">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`step-dot ${step >= s ? 'on' : ''}`} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="step-body" key="step1">
              <h2 className="step-q">今日の気分は？</h2>
              <p className="step-hint">一番近いものを選んでください</p>
              <div className="options-row">
                {MOOD_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    className={`opt-btn ${mood === o.value ? 'selected' : ''}`}
                    style={mood === o.value ? { borderColor: o.color, background: o.color + '22' } : {}}
                    onClick={() => pickMood(o.value)}
                  >
                    <span className="opt-emoji">{o.emoji}</span>
                    <span className="opt-label">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-body" key="step2">
              <h2 className="step-q">体の調子は？</h2>
              <p className="step-hint">エネルギーレベルを教えてください</p>
              <div className="options-row">
                {ENERGY_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    className={`opt-btn ${energy === o.value ? 'selected' : ''}`}
                    style={energy === o.value ? { borderColor: o.color, background: o.color + '22' } : {}}
                    onClick={() => pickEnergy(o.value)}
                  >
                    <span className="opt-emoji">{o.emoji}</span>
                    <span className="opt-label">{o.label}</span>
                  </button>
                ))}
              </div>
              <button className="back-btn" onClick={() => setStep(1)}>← 戻る</button>
            </div>
          )}

          {step === 3 && (
            <div className="step-body" key="step3">
              <h2 className="step-q">一言メモ（任意）</h2>
              <p className="step-hint">今日感じたことを自由に書いてみましょう</p>
              <textarea
                className="memo-area"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="今日あったこと、感じたこと… 書かなくてもOK！"
                rows={5}
              />
              <div className="step-actions">
                <button className="back-btn" onClick={() => setStep(2)}>← 戻る</button>
                <button className="primary-btn" onClick={submit}>記録する ✓</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
