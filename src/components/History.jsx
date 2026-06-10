import React, { useState, useEffect } from 'react';
import { getEntries } from '../utils/storage';
import { getLast7Days, MOOD_OPTIONS, ENERGY_OPTIONS, calculateImprovement } from '../utils/analysis';
import PageHeader from './PageHeader';

function CalendarView({ entries }) {
  const [month, setMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [selected, setSelected] = useState(null);

  const year = month.getFullYear();
  const mon  = month.getMonth();

  const entryMap = {};
  entries.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    entryMap[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = e;
  });

  const startDow = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, mon, i + 1)),
  ];

  const moodColor = (mood) =>
    ['', '#E07B7B', '#F5A623', '#F5D76E', '#7ECBA1', '#64B6AC'][mood] || null;

  const today = new Date();

  const changeMonth = (dir) => {
    setSelected(null);
    setMonth(m => new Date(m.getFullYear(), m.getMonth() + dir, 1));
  };

  return (
    <div className="calendar-view">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
        <span className="cal-nav-title">{year}年{mon + 1}月</span>
        <button className="cal-nav-btn" onClick={() => changeMonth(1)}>›</button>
      </div>

      <div className="cal-grid">
        {['日','月','火','水','木','金','土'].map(d => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} className="cal-cell cal-empty" />;
          const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const entry   = entryMap[key];
          const isToday = date.toDateString() === today.toDateString();
          const isSel   = selected && date.toDateString() === selected.date.toDateString();
          const color   = entry ? moodColor(entry.mood) : null;
          return (
            <div
              key={key}
              className={`cal-cell${isToday ? ' cal-today' : ''}${isSel ? ' cal-selected' : ''}${entry ? ' cal-has' : ''}`}
              style={color ? { background: color + '40', borderColor: color } : {}}
              onClick={() => entry && setSelected(isSel ? null : { date, entry })}
            >
              <span className="cal-day-num">{date.getDate()}</span>
              {entry && <span className="cal-mood-emoji">{MOOD_OPTIONS[entry.mood - 1]?.emoji}</span>}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="cal-detail">
          <div className="cal-detail-date">
            {selected.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
          <div className="cal-detail-scores">
            <span>気分　{MOOD_OPTIONS[selected.entry.mood - 1]?.emoji} {MOOD_OPTIONS[selected.entry.mood - 1]?.label}</span>
            <span>体調　{ENERGY_OPTIONS[selected.entry.energy - 1]?.emoji} {ENERGY_OPTIONS[selected.entry.energy - 1]?.label}</span>
          </div>
          {selected.entry.memo && (
            <p className="cal-detail-memo">「{selected.entry.memo}」</p>
          )}
        </div>
      )}

      <div className="cal-legend">
        {MOOD_OPTIONS.map(o => (
          <span key={o.value} className="cal-legend-item">
            <span className="cal-legend-dot" style={{ background: o.color + '60', borderColor: o.color }} />
            {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}

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
  const [view, setView]       = useState('chart');

  useEffect(() => { getEntries().then(setEntries); }, []);

  const days    = getLast7Days(entries);
  const improve = calculateImprovement(entries);

  return (
    <div className="screen history-screen">
      <PageHeader title="履歴" subtitle="記録の振り返り" emoji="📊" />

      <div className="card" style={{ marginTop: 20 }}>
        <div className="tab-row">
          <button className={`tab-btn ${view === 'chart' ? 'active' : ''}`} onClick={() => setView('chart')}>
            📈 グラフ
          </button>
          <button className={`tab-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
            📅 カレンダー
          </button>
        </div>

        {view === 'chart' && (
          <>
            <div className="tab-row" style={{ marginTop: 8 }}>
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
          </>
        )}

        {view === 'calendar' && <CalendarView entries={entries} />}
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
