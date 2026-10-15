// Vox-style building blocks: paper + grain, sticker cut-outs, torn clippings, highlighter sweeps, marker circles,
// 2.5D camera drift, halftone dots, slam type. Mix and match per concept; see the skill's "Vox toolkit" list.
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadElite} from '@remotion/google-fonts/SpecialElite';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {Draw} from './Hand';
import {ease, pop} from '../theme';

export const voxFonts = {
  slam: loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily,
  type: loadElite('normal', {weights: ['400'], subsets: ['latin']}).fontFamily,
  marker: loadMarker('normal', {weights: ['400'], subsets: ['latin']}).fontFamily,
};

export const HIGHLIGHT = '#F8E634';
export const MARKER_RED = '#E0321C';

// Paper: base colour + static fibre texture + a soft vignette. Put <Grain/> on top of the whole frame.
export const Paper: React.FC<{color?: string; children?: React.ReactNode}> = ({color = '#F6EBD7', children}) => (
  <AbsoluteFill style={{background: color}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.32}}>
      <filter id="paperFibre">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={7} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.35 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paperFibre)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(90,55,20,0.14) 100%)'}} />
    {children}
  </AbsoluteFill>
);

// Moving film grain over everything (re-seeded every 2 frames).
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.16}) => {
  const frame = useCurrentFrame();
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <filter id="filmGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={Math.floor(frame / 2)} />
      </filter>
      <rect width="100%" height="100%" filter="url(#filmGrain)" />
    </svg>
  );
};

// 2.5D: children drift with the camera; depth 0 = background (slow), 1 = foreground (fast).
// slide={false}: push in only, so a full-page layer stays centred.
export const Drift: React.FC<{depth: number; from: number; children: React.ReactNode; push?: number; slide?: boolean}> = ({depth, from, children, push = 0.05, slide = true}) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  const x = slide ? -t * 0.35 * depth : 0;
  const s = 1 + t * 0.0008 * depth + push * ease(frame, from, from + 90);
  return <AbsoluteFill style={{transform: `translateX(${x}px) scale(${s})`}}>{children}</AbsoluteFill>;
};

// White sticker outline + drop shadow around a transparent PNG cut-out.
export const Sticker: React.FC<{src: string; style?: React.CSSProperties; outline?: number}> = ({src, style, outline = 7}) => {
  const o = outline;
  const f = [`${o}px 0`, `-${o}px 0`, `0 ${o}px`, `0 -${o}px`, `${o * 0.7}px ${o * 0.7}px`, `-${o * 0.7}px ${o * 0.7}px`, `${o * 0.7}px -${o * 0.7}px`, `-${o * 0.7}px -${o * 0.7}px`]
    .map((d) => `drop-shadow(${d} 0 #fff)`)
    .join(' ');
  return <Img src={staticFile(src)} style={{filter: `${f} drop-shadow(0 14px 18px rgba(0,0,0,0.35))`, ...style}} />;
};

// Torn-edge polygon (deterministic per seed), for clippings.
const torn = (seed: string, teeth = 26) => {
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * 100}% ${random(`${seed}t${i}`) * 2.2}%`);
  for (let i = 0; i <= teeth; i++) pts.push(`${100 - random(`${seed}r${i}`) * 1.2}% ${(i / teeth) * 100}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${(i / teeth) * 100}% ${100 - random(`${seed}b${i}`) * 2.2}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${random(`${seed}l${i}`) * 1.2}% ${(i / teeth) * 100}%`);
  return `polygon(${pts.join(',')})`;
};

// A paper clipping: torn edges, tilt, shadow, optional tape on top.
export const Clipping: React.FC<{seed: string; rotate?: number; width: number; children: React.ReactNode; tape?: boolean; bg?: string; style?: React.CSSProperties}> = ({
  seed, rotate = -2, width, children, tape = true, bg = '#FFFDF8', style,
}) => {
  const clip = useMemo(() => torn(seed), [seed]);
  return (
    <div style={{position: 'absolute', width, transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 16px 22px rgba(40,25,10,0.35))', ...style}}>
      <div style={{background: bg, clipPath: clip, padding: '34px 36px'}}>{children}</div>
      {tape && <Tape style={{left: '50%', top: -22, marginLeft: -80}} rotate={rotate * -2 + 3} />}
    </div>
  );
};

export const Tape: React.FC<{style?: React.CSSProperties; rotate?: number; w?: number}> = ({style, rotate = 4, w = 160}) => (
  <div
    style={{
      position: 'absolute', width: w, height: 46, background: 'rgba(236,226,200,0.82)', transform: `rotate(${rotate}deg)`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)', clipPath: 'polygon(2% 0,98% 6%,100% 94%,1% 100%,0 50%)', ...style,
    }}
  />
);

// Highlighter that sweeps left to right behind inline text.
export const Highlight: React.FC<{at: number; dur?: number; children: React.ReactNode; color?: string}> = ({at, dur = 10, children, color = HIGHLIGHT}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + dur);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(100deg, transparent 0.4em, ${color} 0.5em, ${color} calc(100% - 0.4em), transparent calc(100% - 0.3em))`,
        backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 78%`, backgroundPosition: '0 70%',
        boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '0 0.12em',
      }}
    >
      {children}
    </span>
  );
};

// Highlighter rectangle over an image region (for real screenshots): x/y/w/h in px of the parent.
export const HighlightBox: React.FC<{at: number; x: number; y: number; w: number; h: number; dur?: number}> = ({at, x, y, w, h, dur = 12}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + dur);
  return <div style={{position: 'absolute', left: x, top: y, width: w * p, height: h, background: HIGHLIGHT, mixBlendMode: 'multiply', borderRadius: 4, transform: 'skewX(-4deg)'}} />;
};

// Hand-drawn marker loop around a box (x, y, w, h in px of the parent).
export const MarkerCircle: React.FC<{at: number; x: number; y: number; w: number; h: number; color?: string}> = ({at, x, y, w, h, color = MARKER_RED}) => {
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2 + 18, ry = h / 2 + 14;
  const d = `M ${cx + rx * 0.2} ${cy - ry} C ${cx + rx * 1.15} ${cy - ry * 1.05}, ${cx + rx * 1.1} ${cy + ry * 1.1}, ${cx} ${cy + ry} S ${cx - rx * 1.1} ${cy - ry * 0.4}, ${cx - rx * 0.1} ${cy - ry * 1.1} L ${cx + rx * 0.45} ${cy - ry * 0.95}`;
  return <Draw d={d} at={at} dur={14} color={color} width={8} />;
};

// Halftone dot disc (comic print texture) behind a subject.
export const Halftone: React.FC<{x: number; y: number; size: number; color?: string; at: number}> = ({x, y, size, color = MARKER_RED, at}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  return (
    <div
      style={{
        position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%',
        backgroundImage: `radial-gradient(${color} 32%, transparent 34%)`, backgroundSize: '22px 22px',
        transform: `scale(${p}) rotate(${interpolate(frame, [at, at + 200], [0, 12])}deg)`, opacity: 0.85,
      }}
    />
  );
};

// Condensed headline that slams in (overshoot + tiny shake), Vox style.
export const Slam: React.FC<{at: number; children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({at, children, size, color = '#141414', style}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, true);
  const shake = frame >= at && frame < at + 6 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <div style={{fontFamily: voxFonts.slam, fontSize: size, lineHeight: 0.95, color, textTransform: 'uppercase', letterSpacing: '0.01em', transform: `scale(${1.5 - 0.5 * p}) translateX(${shake}px)`, opacity: Math.min(1, p * 2), ...style}}>
      {children}
    </div>
  );
};

// Redaction bar that wipes off (left to right) at `at`, revealing what's underneath.
export const Redact: React.FC<{at: number; children: React.ReactNode; dur?: number}> = ({at, children, dur = 10}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + dur);
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <span style={{position: 'absolute', left: '-4%', right: '-4%', top: '6%', bottom: '2%', background: '#141414', transform: `scaleX(${1 - p})`, transformOrigin: 'right center'}} />
    </span>
  );
};

// A torn sheet of paper that sweeps across the frame, hiding a cut. `at` = the frame of the cut.
export const TornWipe: React.FC<{at: number; color?: string; seed?: string}> = ({at, color = '#EADBC0', seed = 'wipe'}) => {
  const frame = useCurrentFrame();
  const t = (frame - (at - 7)) / 14;
  if (t <= 0 || t >= 1) return null;
  const x = -1500 + t * 2700;
  const teeth = 30;
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${random(`${seed}a${i}`) * 4}% ${(i / teeth) * 100}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${96 + random(`${seed}b${i}`) * 4}% ${(i / teeth) * 100}%`);
  return (
    <div style={{position: 'absolute', top: -40, left: x, width: 1500, height: 2000, transform: 'rotate(4deg)', filter: 'drop-shadow(0 0 18px rgba(60,40,20,0.35))', pointerEvents: 'none'}}>
      <div style={{width: '100%', height: '100%', background: color, clipPath: `polygon(${pts.join(',')})`}} />
    </div>
  );
};

// Torn-paper reveal: the NEW page slides in over the old one with ONE torn, slightly tilted edge.
// It carries its own paper, so the old page underneath stays put until it is covered (no second sheet, no double view).
export const TornReveal: React.FC<{at: number; dur?: number; seed?: string; paper?: string; children: React.ReactNode}> = ({at, dur = 12, seed = 'reveal', paper = '#F6EBD7', children}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const t = Math.min(1, (frame - at) / dur);
  if (t >= 1) return <Paper color={paper}>{children}</Paper>;
  const e = -160 + (1 - Math.pow(1 - t, 2)) * 1400; // ease-out, edge travels past both tilted corners
  const teeth = 34;
  const pts = ['-10px -10px'];
  for (let i = 0; i <= teeth; i++) {
    const y = (i / teeth) * 1940 - 10;
    pts.push(`${e + (960 - y) * 0.07 + random(`${seed}${i}`) * 26}px ${y}px`);
  }
  pts.push('-10px 1930px');
  return (
    <AbsoluteFill style={{filter: 'drop-shadow(10px 0 16px rgba(60,40,20,0.35))'}}>
      <AbsoluteFill style={{clipPath: `polygon(${pts.join(',')})`}}>
        <Paper color={paper}>{children}</Paper>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Map pin that drops in and bounces, with a shadow.
export const Pin: React.FC<{x: number; y: number; at: number; color?: string}> = ({x, y, at, color = MARKER_RED}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  return (
    <div style={{position: 'absolute', left: x - 30, top: y - 78}}>
      <div style={{position: 'absolute', left: 14, top: 70, width: 32, height: 10, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', transform: `scale(${p})`}} />
      <svg width={60} height={80} viewBox="0 0 30 40" style={{transform: `translateY(${(1 - p) * -260}px)`, opacity: p > 0.02 ? 1 : 0, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))'}}>
        <path d="M15 1 C7 1 1 7 1 15 C1 26 15 39 15 39 C15 39 29 26 29 15 C29 7 23 1 15 1 Z" fill={color} stroke="#fff" strokeWidth={2} />
        <circle cx={15} cy={15} r={5} fill="#fff" />
      </svg>
    </div>
  );
};
