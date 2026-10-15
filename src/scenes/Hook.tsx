import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {NUDGE_X, ease, easeIn, fonts, pop, sec} from '../theme';

// "Tab chaos": a drawn browser where tool tabs pile up faster and faster, alerts stack, a cursor
// panics, tape gets slapped on, then the whole mess is sucked into the company logo.
const WIN = {x: 90, y: 640, w: 840, h: 640};
const STRIP = {x: WIN.x + 120, w: WIN.w - 140}; // tab strip after the traffic-light dots
const LOGO = [250, 640]; // where the logo lands in the next scene
const TAB_COLORS = ['#E54F23', '#4C8DF6', '#3BB273', '#F2B233', '#9B6CF0', '#1EB8C9', '#EF6CA3', '#7A8794'];

// Tab i opens at this frame: first ones slow, then faster and faster (the "chaos" ramp).
const openAt = (i: number) => Math.round(6 + 20 * Math.sqrt(i) + i);

const TONE = {bad: {bg: '#FDE8E3', fg: '#C23B17', icon: '!'}, warn: {bg: '#FFF6D6', fg: '#8A6400', icon: '•'}};

export const Hook: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const h = c.hook;
  const collapse = easeIn(frame, sec(h.collapseAt), sec(c.sections.what) + 2);
  const head = pop(frame, sec(h.headlineAt));
  const aside = pop(frame, sec(h.asideAt));
  const winIn = pop(frame, 2);

  const open = h.tools.filter((_, i) => frame >= openAt(i)).length;
  const active = Math.max(0, open - 1);
  const tabW = STRIP.w / Math.max(open, 1);
  // Panic shake grows with the number of open tabs.
  const chaos = interpolate(open, [6, h.tools.length], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shakeX = Math.sin(frame * 1.7) * 6 * chaos;
  const shakeR = Math.sin(frame * 1.3) * 0.8 * chaos;

  // Cursor darts to the newest tab, with a jittery overshoot.
  const target = STRIP.x + tabW * (active + 0.5);
  const curX = target + Math.sin(frame / 2.3) * 30 * chaos;
  const curY = WIN.y + 34 + Math.cos(frame / 1.9) * 16 * chaos + 30;
  const lastOpen = openAt(active);
  const click = ease(frame, lastOpen, lastOpen + 8);

  const color = TAB_COLORS[active % TAB_COLORS.length];
  const name = h.tools[active];

  // Collapse: the window flies into the logo spot.
  const cx = (LOGO[0] - NUDGE_X - (WIN.x + WIN.w / 2)) * collapse; // the logo sits at true centre; this layer is nudged
  const cy = (LOGO[1] - (WIN.y + WIN.h / 2)) * collapse;

  return (
    <AbsoluteFill style={{background: c.colors.ink}}>
      {/* faint dot grid */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)', backgroundSize: '36px 36px', opacity: 1 - collapse}} />
      <AbsoluteFill style={{transform: `translateX(${NUDGE_X}px)`}}>

      <div style={{position: 'absolute', top: 230, left: 60, width: 880, textAlign: 'center', fontFamily: fonts.hand, fontWeight: 700, fontSize: 70, color: '#fff', opacity: ease(frame, 0, 8) * (1 - collapse), transform: `rotate(-2deg) translateY(${(1 - ease(frame, 0, 10)) * 30}px)`}}>
        {h.kicker}
      </div>
      <div style={{position: 'absolute', top: 300, left: 60, width: 880, textAlign: 'center', fontFamily: fonts.serif, fontSize: 190, color: '#fff', lineHeight: 1, transform: `scale(${0.6 + 0.4 * head})`, opacity: Math.min(1, head * 1.5) * (1 - collapse)}}>
        {h.headline}
      </div>
      <div style={{position: 'absolute', top: 505, left: 60, width: 880, textAlign: 'center', fontFamily: fonts.hand, fontWeight: 700, fontSize: 68, color: c.colors.accent, transform: `rotate(-3deg) scale(${0.7 + 0.3 * aside})`, opacity: aside * (1 - collapse)}}>
        {h.aside}
      </div>

      {/* the browser */}
      <div
        style={{
          position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 26, background: '#F4F1EC', overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
          transform: `translate(${shakeX + cx}px, ${(1 - winIn) * 200 + cy}px) rotate(${shakeR}deg) scale(${(0.85 + 0.15 * winIn) * (1 - collapse * 0.92)})`,
          opacity: Math.min(1, winIn * 1.5) * (1 - collapse * 0.6),
        }}
      >
        {/* chrome + tab strip */}
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 76, background: '#E4DFD7'}} />
        {['#FF5F57', '#FEBC2E', '#28C840'].map((d, i) => (
          <div key={d} style={{position: 'absolute', left: 26 + i * 28, top: 30, width: 18, height: 18, borderRadius: 9, background: d}} />
        ))}
        {h.tools.slice(0, open).map((t, i) => {
          const p = pop(frame, openAt(i), true);
          const isActive = i === active;
          return (
            <div
              key={t}
              style={{
                position: 'absolute', left: STRIP.x - WIN.x + tabW * i, top: 18, width: tabW - 4, height: 58,
                background: isActive ? '#F4F1EC' : '#D3CDC3', borderRadius: '14px 14px 0 0', overflow: 'hidden',
                transform: `translateY(${(1 - p) * 40}px)`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
                fontFamily: fonts.sans, fontWeight: 600, fontSize: 24, color: c.colors.ink, whiteSpace: 'nowrap',
              }}
            >
              <span style={{width: 12, height: 12, borderRadius: 6, background: TAB_COLORS[i % TAB_COLORS.length], flexShrink: 0}} />
              {tabW > 110 ? t : ''}
            </div>
          );
        })}

        {/* page content: the active tool's name + skeleton UI, flashing on every new tab */}
        <div key={active} style={{position: 'absolute', left: 40, top: 110, right: 40, opacity: ease(frame, lastOpen, lastOpen + 3, [0.5, 1]), transform: `translateY(${(1 - ease(frame, lastOpen, lastOpen + 4)) * 14}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 64, height: 64, borderRadius: 16, background: color}} />
            <div style={{fontFamily: fonts.sans, fontWeight: 800, fontSize: 64, color: c.colors.ink, letterSpacing: '-0.02em'}}>{name}</div>
          </div>
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <div key={r} style={{display: 'flex', gap: 14, marginTop: r ? 22 : 40}}>
              <div style={{width: 36, height: 36, borderRadius: 8, background: '#DDD7CD'}} />
              <div style={{height: 36, width: `${45 + ((r * 37 + active * 13) % 40)}%`, borderRadius: 8, background: '#E2DCD2'}} />
              <div style={{height: 36, flex: 1, borderRadius: 8, background: r % 2 ? color + '33' : '#E9E4DB'}} />
            </div>
          ))}
        </div>

        {/* alerts stack up once the chaos starts */}
        {h.alerts.map((a, i) => {
          const at = sec(h.headlineAt) + 10 + i * 7;
          const p = pop(frame, at, true);
          if (frame < at) return null;
          const tone = TONE[a.tone as keyof typeof TONE];
          return (
            <div
              key={a.text}
              style={{
                position: 'absolute', right: 26, top: 120 + i * 92, background: tone.bg, color: tone.fg, borderRadius: 18, padding: '16px 24px',
                fontFamily: fonts.sans, fontWeight: 800, fontSize: 32, boxShadow: '0 10px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 12,
                transform: `translateX(${(1 - p) * 320}px) rotate(${(i % 2 ? 2 : -2) * p}deg)`,
              }}
            >
              <span style={{width: 34, height: 34, borderRadius: 17, background: tone.fg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24}}>{tone.icon}</span>
              {a.text}
            </div>
          );
        })}

        {/* duct tape slapped on when the voice says "glue" */}
        {[[-8, 300], [6, 430], [-3, 540]].map(([r, y], i) => {
          const at = sec(h.glueAt) + i * 3;
          const p = pop(frame, at, true);
          if (frame < at) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: -40, top: y, width: WIN.w + 80, height: 74, background: 'rgba(248,230,52,0.92)',
                transform: `rotate(${r}deg) scaleX(${p})`, transformOrigin: i % 2 ? 'right center' : 'left center',
                boxShadow: '0 6px 14px rgba(0,0,0,0.25)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 22px)',
              }}
            />
          );
        })}
      </div>

      {/* frantic cursor with a click ripple */}
      {frame > 8 && collapse < 0.5 && (
        <div style={{position: 'absolute', left: curX + shakeX, top: curY, opacity: Math.min(1, winIn) * (1 - collapse * 2)}}>
          <div style={{position: 'absolute', left: -28, top: -28, width: 56, height: 56, borderRadius: 28, border: '4px solid rgba(255,255,255,0.9)', transform: `scale(${0.3 + click})`, opacity: 1 - click}} />
          <svg width={44} height={56} viewBox="0 0 22 28" style={{filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))'}}>
            <path d="M1 1 L1 22 L7 17 L11 26 L15 24 L11 15 L19 15 Z" fill="#fff" stroke="#111" strokeWidth={1.5} strokeLinejoin="round" />
          </svg>
        </div>
      )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
