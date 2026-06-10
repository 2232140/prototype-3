import React, { useState, useEffect } from 'react';
import { getEntries } from '../utils/storage';
import { getLast7Days, MOOD_OPTIONS, ENERGY_OPTIONS, calculateImprovement } from '../utils/analysis';
import PageHeader from './PageHeader';

function BarChart({ days, metric }) {
  const baseColor = metric === 'mood' ? '#7C6FCD' : '#64B6AC';
  const todayColor = metric === 'mood' ? '#A89FDE' : '#95E1D3';
  const W = 320, H = 140, padL = 16, padR = 16, padT = 8, padB = 36;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const slot = cW / 7;
  const bW   = slot * 0.55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bar-chart">
      {[1, 2, 3, 4, 5].map((v) => {
        const y = padT + cH - (v / 5) * cH;
        return <line key={v} x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F0F4F8" strokeWidth="1" />;
      })}
      {days.map((day, i) => {
        const cx  = padL + (i + 0.5) * slot;
        const val = day.entry ? day.entry[metric] : 0;
        const bH  = (val / 5) * cH || 3;
        const by  = padT + cH - bH;
        const fill = day.entry ? (day.isToday ? todayColor : baseColor) : '#E5E7EB';
        return (
          <g key={i}>
            <rect
              x={cx - bW / 2} y={by} width={bW} height={bH}
              rx={5} fill={fill} opacity={day.entry ? 0.9 : 0.4}
            />
            <text
              x={cx} y={H - 18}
              textAnchor="middle" fontSize="11"
              fill={day.isToday ? baseColor : '#9CA3AF'}
              fontWeight={day.isToday ? '800' : '400'}
            >
              {day.label}
            </text>
            {day.isToday && (
              <circle cx={cx} cy={H - 6} r={3} fill={baseColor} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function History() {
  const [entries, setEntries] = useState([]);
  const [metric, setMetric]   = useState('mood');

  useEffect(() => { getEntries().then(setEntries); }, []);

  const days    = getLast7Days(entries);
  const improve = calculateImprovement(entries);

  return (
    <div className="screen history-screen">
      <PageHeader title="履歴" subtitle="直近7日間の記録" emoji="📊" />

      <div className="card" style={{ marginTop: 20 }}>
        <div className="tab-row">
          {['mood', 'energy'].map((m) => (
            <button
              key={m}
              className={`tab-btn ${metric === m ? 'active' : ''}`}
              onClick={() => setMetric(m)}
            >
              {m === 'mood' ? '😊 気分' : '⚡ 体調'}
            </button>
          ))}
        </div>
        <BarChart days={days} metric={metric} />
        {improve !== null && (
          <p className="chart-note" style={{ color: improve >= 0 ? '#64B6AC' : '#E07B7B' }}>
            {improve >= 0 ? '📈' : '📉'} 前週比 {improve >= 0 ? '+' : ''}{improve}% 改善しました！
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-section-title">日別の記録</h2>
        <div className="day-list">
          {[...days].reverse().map((day, i) => (
            day.entry ? (
              <div key={i} className="day-row">
                <div className="day-date">
                  <span className="day-label" style={day.isToday ? { color: 'var(--primary)', fontWeight: 800 } : {}}>
                    {day.isToday ? '今日' : day.label}
                  </span>
                  <span className="day-mmdd">
                    {day.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
                <div className="day-content">
                  <span className="day-score-emoji">
                    {MOOD_OPTIONS[day.entry.mood - 1]?.emoji}
                    {ENERGY_OPTIONS[day.entry.energy - 1]?.emoji}
                  </span>
                  {day.entry.memo && (
                    <p className="day-memo">"{day.entry.memo}"</p>
                  )}
                </div>
              </div>
            ) : (
              <div key={i} className="day-row day-row-empty">
                <div className="day-date">
                  <span className="day-label">{day.label}</span>
                  <span className="day-mmdd">
                    {day.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
                <div className="day-empty-content">
                  <span className="day-empty-icon">＋</span>
                  <span className="day-empty-text">この日はお休み</span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
