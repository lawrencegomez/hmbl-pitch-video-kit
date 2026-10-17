// Bright Vox "moving parts": small cut-paper illustrations drawn in code (people, envelopes, chips, stamps, cash,
// tiles, radar, confetti). No company data in here. Everything takes a frame `at` and animates itself.
import React from 'react';
import {Img, random, staticFile, useCurrentFrame} from 'remotion';
import {CHARCOAL, VOX_YELLOW, glide} from './kit';

// Short pop for small parts (camera moves keep the long eases); 0 before `at`, overshoots a touch, settles at 1.
export const popIn = (f: number, at: number, dur = 9) => {
  if (f < at) return 0;
  const p = Math.min(1, (f - at) / dur);
  return 1 + Math.sin(p * Math.PI) * 0.12 * (1 - p) - Math.pow(1 - p, 3);
};

const SHIRTS = ['#7A8FB8', '#E08E6D', '#6FB59B', '#E3B04B', '#9C7FC1', '#5E9FC8', '#D97A8C', '#8AA36A'];
const SKIN = ['#F2C9A5', '#D9A07A', '#A8714E', '#F5D7BE', '#7B5236', '#E8B48A'];

// A paper person (no face). dim: greyed and faded; shirt overrides the colour.
export const Person: React.FC<{x: number; y: number; size?: number; seed: string; dim?: number; shirt?: string; bob?: boolean}> = ({x, y, size = 70, seed, dim = 0, shirt, bob = true}) => {
  const f = useCurrentFrame();
  const c = shirt ?? SHIRTS[Math.floor(random(`${seed}s`) * SHIRTS.length)];
  const k = SKIN[Math.floor(random(`${seed}k`) * SKIN.length)];
  const dy = bob ? Math.sin(f / 9 + random(seed) * 6) * 3 : 0;
  const h = size * 1.3;
  return (
    <svg width={size} height={h} viewBox="0 0 70 91" style={{position: 'absolute', left: x - size / 2, top: y - h / 2 + dy, overflow: 'visible', filter: `saturate(${1 - 0.8 * dim}) brightness(${1 + 0.06 * dim}) drop-shadow(0 3px 2px rgba(40,30,20,${0.25 - dim * 0.15}))`, opacity: 1 - dim * 0.35}}>
      <path d="M6 91 Q6 52 35 49 Q64 52 64 91 Z" fill={c} />
      <circle cx={35} cy={24} r={17} fill={k} />
      <path d="M18 22 Q20 4 35 5 Q52 5 52 22 Q46 12 35 12 Q24 12 18 22 Z" fill="#2B2420" opacity={0.85} />
    </svg>
  );
};

// A paper envelope. rotate in degrees.
export const Envelope: React.FC<{x: number; y: number; w?: number; color?: string; rotate?: number; open?: number}> = ({x, y, w = 60, color = '#F7F4EC', rotate = 0, open = 0}) => {
  const h = w * 0.66;
  return (
    <svg width={w} height={h} viewBox="0 0 60 40" style={{position: 'absolute', left: x - w / 2, top: y - h / 2, transform: `rotate(${rotate}deg)`, overflow: 'visible', filter: 'drop-shadow(0 3px 3px rgba(40,30,20,0.25))'}}>
      <rect x={0} y={0} width={60} height={40} rx={3} fill={color} stroke="rgba(30,25,20,0.35)" strokeWidth={1.5} />
      <path d={open ? 'M0 0 L30 -16 L60 0' : 'M0 0 L30 22 L60 0'} fill="none" stroke="rgba(30,25,20,0.45)" strokeWidth={2} />
      <path d="M0 40 L24 20 M60 40 L36 20" stroke="rgba(30,25,20,0.2)" strokeWidth={1.5} />
    </svg>
  );
};

// A small signal chip (paper tag with a dot); hi = yellow box on the label.
export const Chip: React.FC<{x: number; y: number; at: number; label: string; font: string; size?: number; hi?: boolean; rotate?: number}> = ({x, y, at, label, font, size = 26, hi = false, rotate = 0}) => {
  const f = useCurrentFrame();
  const p = popIn(f, at);
  if (p <= 0) return null;
  const h = glide(f, at + 4, at + 10);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${p})`, background: '#FBF8F1', borderRadius: 999, padding: `${size * 0.32}px ${size * 0.6}px`, boxShadow: '0 6px 10px rgba(40,30,20,0.22)', fontFamily: font, fontWeight: 700, fontSize: size, color: CHARCOAL, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: size * 0.35}}>
      <span style={{width: size * 0.42, height: size * 0.42, borderRadius: 99, background: hi ? '#E54F23' : '#9a958c'}} />
      <span style={{position: 'relative'}}>
        {hi && <span style={{position: 'absolute', left: '-0.15em', right: '-0.15em', top: '0.02em', bottom: 0, background: VOX_YELLOW, transform: `scaleX(${h})`, transformOrigin: 'left'}} />}
        <span style={{position: 'relative'}}>{label}</span>
      </span>
    </div>
  );
};

// Radar sweep around a point: rings + a rotating wedge.
export const Radar: React.FC<{x: number; y: number; r: number; at: number; color?: string}> = ({x, y, r, at, color = '#E54F23'}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = glide(f, at, at + 10);
  const a = (f - at) * 7;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${p})`}}>
      {[1, 0.66, 0.33].map((s) => (
        <div key={s} style={{position: 'absolute', inset: `${(1 - s) * r}px`, borderRadius: '50%', border: `2px dashed ${color}`, opacity: 0.45}} />
      ))}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${a}deg, ${color}55, transparent 70deg)`}} />
    </div>
  );
};

// Rubber stamp that slams down (overshoot + tiny shake), ink texture via a rough edge filter.
// bold: thicker double border, denser ink, a harder slam and impact lines.
export const Stamp: React.FC<{x: number; y: number; at: number; lines: string[]; font: string; size?: number; color?: string; rotate?: number; bold?: boolean}> = ({x, y, at, lines, font, size = 54, color = '#D9381E', rotate = -8, bold = false}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = Math.min(1, (f - at) / (bold ? 5 : 6));
  const s = (bold ? 2.3 : 1.7) - (bold ? 1.3 : 0.7) * t;
  const shake = f - at < (bold ? 10 : 8) ? Math.sin(f * 2.7) * (bold ? 6 : 3) : 0;
  const id = bold ? 'stampInkBold' : 'stampInk';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateX(${shake}px) rotate(${rotate}deg) scale(${s})`, opacity: Math.min(1, t * 2)}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} /><feColorMatrix type="matrix" values={bold ? '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.45 1.3' : '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.1'} /><feComposite in="SourceGraphic" operator="in" /></filter>
      </svg>
      <div style={{filter: `url(#${id})`, border: `${size * (bold ? 0.15 : 0.11)}px solid ${color}`, borderRadius: size * 0.2, padding: bold ? size * 0.1 : `${size * 0.2}px ${size * 0.45}px`, color, fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
        <div style={bold ? {border: `${size * 0.05}px solid ${color}`, borderRadius: size * 0.1, padding: `${size * 0.16}px ${size * 0.4}px`} : undefined}>
          {lines.map((l) => <div key={l}>{l}</div>)}
        </div>
      </div>
    </div>
  );
};

// Comic impact lines bursting out from a point (a slam, a hit word): spikes shoot out and fade in ~10 frames.
export const Burst: React.FC<{x: number; y: number; at: number; r0?: number; r1?: number; n?: number; color?: string; width?: number; seed?: string}> = ({x, y, at, r0 = 120, r1 = 230, n = 12, color = CHARCOAL, width = 8, seed = 'bu'}) => {
  const t = useCurrentFrame() - at;
  if (t < 0 || t > 12) return null;
  const p = Math.min(1, t / 5);
  const fade = t > 6 ? 1 - (t - 6) / 6 : 1;
  return (
    <svg width={0} height={0} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
      {[...Array(n)].map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (random(`${seed}a${i}`) - 0.5) * 0.3;
        const l = 0.75 + random(`${seed}l${i}`) * 0.5;
        const a0 = r0 + (r1 - r0) * 0.4 * p, a1 = r0 + (r1 - r0) * l * p;
        return <line key={i} x1={Math.cos(a) * a0} y1={Math.sin(a) * a0} x2={Math.cos(a) * a1} y2={Math.sin(a) * a1} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={fade} />;
      })}
    </svg>
  );
};

// A jagged starburst sticker with a short label ("NEW", "HOT TAKE"); pops in with a wobble.
export const Starburst: React.FC<{x: number; y: number; at: number; label: string; font: string; r?: number; size?: number; color?: string; ink?: string; rotate?: number}> = ({x, y, at, label, font, r = 120, size = 40, color = VOX_YELLOW, ink = CHARCOAL, rotate = 12}) => {
  const f = useCurrentFrame();
  const p = popIn(f, at, 8);
  if (p <= 0) return null;
  const pts = [...Array(28)].map((_, i) => {
    const rr = i % 2 ? r * 0.74 : r;
    const a = (i / 28) * Math.PI * 2;
    return `${r + Math.cos(a) * rr},${r + Math.sin(a) * rr}`;
  }).join(' ');
  const wob = Math.sin((f - at) / 3) * 2.5;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${p}) rotate(${rotate + wob}deg)`, filter: 'drop-shadow(0 8px 8px rgba(40,25,10,0.3))'}}>
      <svg width={r * 2} height={r * 2} style={{position: 'absolute', overflow: 'visible'}}><polygon points={pts} fill={color} stroke={ink} strokeWidth={5} strokeLinejoin="round" /></svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', whiteSpace: 'pre-line', fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 0.95, color: ink}}>{label}</div>
    </div>
  );
};

// A paper rocket that accelerates from (x0, y0) to (x1, y1), pointing along its path, leaving smoke puffs.
export const Rocket: React.FC<{x0: number; y0: number; x1: number; y1: number; at: number; dur?: number; size?: number; color?: string}> = ({x0, y0, x1, y1, at, dur = 26, size = 90, color = '#E54F23'}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0) return null;
  const pos = (u: number) => {
    const k = Math.pow(Math.min(1, Math.max(0, u)), 1.8); // ease in: it speeds up
    return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
  };
  const [x, y] = pos(t / dur);
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90;
  const flame = 0.8 + 0.4 * random(`fl${Math.floor(f / 2)}`);
  return (
    <>
      {[...Array(9)].map((_, i) => {
        const born = (i / 9) * dur;
        const age = t - born;
        if (age < 0 || age > 16) return null;
        const [px, py] = pos(born / dur);
        const s = size * (0.25 + age * 0.03);
        return <div key={i} style={{position: 'absolute', left: px - s / 2, top: py + size * 0.5 - s / 2, width: s, height: s, borderRadius: '50%', background: '#FBF8F1', opacity: 0.85 * (1 - age / 16), boxShadow: '0 2px 3px rgba(40,30,20,0.15)'}} />;
      })}
      {t <= dur && (
        <svg width={size} height={size * 1.6} viewBox="0 0 50 80" style={{position: 'absolute', left: x - size / 2, top: y - size * 0.8, transform: `rotate(${ang}deg)`, overflow: 'visible', filter: 'drop-shadow(0 4px 4px rgba(40,25,10,0.3))'}}>
          <path d={`M18 62 L25 ${62 + 16 * flame} L32 62 Z`} fill={VOX_YELLOW} stroke="#E8912C" strokeWidth={2} />
          <path d="M25 2 C38 14 40 34 36 62 L14 62 C10 34 12 14 25 2 Z" fill="#FBF8F1" stroke={CHARCOAL} strokeWidth={2.5} />
          <path d="M25 2 C31 7 35 13 37 20 L13 20 C15 13 19 7 25 2 Z" fill={color} />
          <circle cx={25} cy={33} r={6} fill="#5E9FC8" stroke={CHARCOAL} strokeWidth={2.5} />
          <path d="M14 46 L4 64 L14 60 Z M36 46 L46 64 L36 60 Z" fill={color} stroke={CHARCOAL} strokeWidth={2} strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
};

// A paper banknote.
export const Bill: React.FC<{x: number; y: number; w?: number; rotate?: number}> = ({x, y, w = 260, rotate = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: w * 0.45, transform: `rotate(${rotate}deg)`, background: 'linear-gradient(135deg, #9ED39A, #7FC07E)', borderRadius: 6, boxShadow: '0 4px 6px rgba(30,60,30,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{position: 'absolute', inset: 8, border: '2px solid rgba(30,80,40,0.45)', borderRadius: 4}} />
    <div style={{width: w * 0.22, height: w * 0.22, borderRadius: 99, background: '#C8EBC3', border: '2px solid rgba(30,80,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: w * 0.13, color: '#2F6B3A'}}>$</div>
  </div>
);

// Confetti burst from a point.
export const Confetti: React.FC<{x: number; y: number; at: number; n?: number; seed?: string}> = ({x, y, at, n = 26, seed = 'cf'}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 60) return null;
  const cols = [VOX_YELLOW, '#E54F23', '#5E9FC8', '#6FB59B', '#9C7FC1'];
  return (
    <>
      {[...Array(n)].map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI - Math.PI;
        const v = 9 + random(`${seed}v${i}`) * 12;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.55 * t * t;
        return <div key={i} style={{position: 'absolute', left: px, top: py, width: 16, height: 9, background: cols[i % cols.length], transform: `rotate(${t * 18 + i * 40}deg)`, opacity: t > 45 ? (60 - t) / 15 : 1}} />;
      })}
    </>
  );
};

// A photo cut-out with a thick white sticker edge.
export const StickerImg: React.FC<{src: string; style?: React.CSSProperties; outline?: number}> = ({src, style, outline = 8}) => {
  const o = outline;
  const f = [`${o}px 0`, `-${o}px 0`, `0 ${o}px`, `0 -${o}px`, `${o * 0.7}px ${o * 0.7}px`, `-${o * 0.7}px ${o * 0.7}px`, `${o * 0.7}px -${o * 0.7}px`, `-${o * 0.7}px -${o * 0.7}px`].map((d) => `drop-shadow(${d} 0 #fff)`).join(' ');
  return <Img src={staticFile(src)} style={{filter: `${f} drop-shadow(0 16px 18px rgba(40,25,10,0.3))`, ...style}} />;
};

// A disc of halftone dots (comic print), drawn behind a subject.
export const DotDisc: React.FC<{x: number; y: number; d: number; color: string; at: number}> = ({x, y, d, color, at}) => {
  const p = popIn(useCurrentFrame(), at, 10);
  return <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', transform: `scale(${p})`, backgroundImage: `radial-gradient(${color} 34%, transparent 36%)`, backgroundSize: '18px 18px', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 72%)', maskImage: 'radial-gradient(circle, black 55%, transparent 72%)'}} />;
};
