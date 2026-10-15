import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {Draw} from '../components/Hand';
import {ease, fonts, pop, sec} from '../theme';

export const Traction: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const t = c.traction;
  const countAt = sec(t.countAt);
  const n = Math.round(ease(frame, countAt, countAt + 20) * t.count);
  const big = pop(frame, countAt - 2);
  const r = t.revenue;
  const revAt = sec(r.at);
  // Logos make way for the revenue chart when the voice says "revenue".
  const swap = ease(frame, revAt - 4, revAt + 8);
  const rev = pop(frame, revAt);
  const CHART = 'M 60 280 C 260 280, 400 276, 480 220 S 600 70, 640 40';

  return (
    <AbsoluteFill style={{background: c.colors.bg}}>
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', transform: `scale(${big})`}}>
        <div style={{fontFamily: fonts.serif, fontSize: 240, color: c.colors.brand, lineHeight: 0.95}}>{n}+</div>
        <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 46, color: c.colors.ink, marginTop: 6}}>{t.countLabel}</div>
      </div>

      <div style={{position: 'absolute', left: 90, top: 640, width: 840, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, opacity: 1 - swap, transform: `scale(${1 - swap * 0.08})`}}>
        {t.logos.map((l, i) => {
          const p = pop(frame, countAt + 8 + i * 3, true);
          return (
            <div key={l} style={{height: 150, background: '#fff', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(30,30,30,0.08)', transform: `scale(${p})`}}>
              {/* site logos are light grey; darken them so they read on white */}
              <Img src={staticFile(l)} style={{maxWidth: 230, maxHeight: 66, filter: 'brightness(0.25)'}} />
            </div>
          );
        })}
      </div>

      {/* revenue: hand-drawn growth line, $0 in January to $1M */}
      {frame >= revAt - 4 && (
        <div style={{position: 'absolute', left: 90, top: 620, width: 840, height: 360, background: '#fff', borderRadius: 28, boxShadow: '0 12px 28px rgba(30,30,30,0.12)', opacity: rev, transform: `scale(${0.92 + 0.08 * rev})`}}>
          <div style={{position: 'absolute', left: 34, top: 24, fontFamily: fonts.sans, fontWeight: 700, fontSize: 36, color: c.colors.ink}}>{r.title}</div>
          <div style={{position: 'absolute', left: 50, top: 0, width: 760, height: 360}}>
            <Draw w={760} h={360} d={CHART} at={revAt + 4} dur={26} color={c.colors.brand} width={10} arrow />
          </div>
          {r.months.map((m, i) => (
            <div key={m} style={{position: 'absolute', left: 90 + i * 280, top: 300, fontFamily: fonts.sans, fontWeight: 600, fontSize: 28, color: c.colors.ink, opacity: 0.5 * ease(frame, revAt + 4 + i * 8, revAt + 10 + i * 8)}}>{m}</div>
          ))}
          <div style={{position: 'absolute', left: 92, top: 222, fontFamily: fonts.hand, fontWeight: 700, fontSize: 44, color: c.colors.ink, opacity: ease(frame, revAt + 4, revAt + 10)}}>{r.from}</div>
          <div style={{position: 'absolute', right: 44, top: 96, textAlign: 'right', transform: `scale(${pop(frame, revAt + 26, true)})`, transformOrigin: 'right top'}}>
            <div style={{fontFamily: fonts.serif, fontSize: 120, lineHeight: 1, color: c.colors.brand}}>{r.to}</div>
            <div style={{fontFamily: fonts.hand, fontWeight: 700, fontSize: 48, color: c.colors.ink, marginTop: -4}}>{r.toLabel}</div>
          </div>
        </div>
      )}

      <div style={{position: 'absolute', left: 90, top: 1010, width: 840, display: 'flex', flexDirection: 'column', gap: 16}}>
        {t.stats.map((s, i) => {
          const p = pop(frame, sec(s.at) - 2);
          return (
            <div key={s.big} style={{display: 'flex', alignItems: 'center', gap: 28, background: '#fff', color: c.colors.ink, borderRadius: 28, padding: '18px 32px', boxShadow: '0 12px 28px rgba(30,30,30,0.12)', transform: `translateY(${(1 - p) * 120}px)`, opacity: p}}>
              <div style={{fontFamily: fonts.serif, fontSize: 110, lineHeight: 1, flexShrink: 0, color: c.colors.brand}}>{s.big}</div>
              <div style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 36, lineHeight: 1.2, opacity: 0.9}}>{s.small}</div>
            </div>
          );
        })}
      </div>
      <Draw d="M 300 552 C 420 565, 640 540, 780 558" at={countAt + 12} dur={10} color={c.colors.ink} width={6} />
    </AbsoluteFill>
  );
};
