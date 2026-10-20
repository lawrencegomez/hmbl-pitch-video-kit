// Launch-video parts, each modeled on a move from the reference teardown (~/launch-references/report).
// Every `at` is an absolute frame. All motion is a pure function of the frame.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {LF, LookCtx, between, fontsReady, land, leave, rush, settle, textWidth, useLook, type Look} from './theme';

const c01 = (v: number) => Math.max(0, Math.min(1, v));
// An icon is a real emoji ("💬", the default: Lawrence 2026-10-19, drawn icons "look a little cheap"), an image path
// under companies/ (a product's real app icon), or an inline node. Emoji render as Apple's on a Mac.
export type Icon = string | React.ReactNode;
const isImage = (i: string) => /\.(png|jpe?g|webp|svg|gif)$/i.test(i);
const renderIcon = (i: Icon, size: string) =>
  typeof i === 'string' && isImage(i) ? (
    <Img src={staticFile(i)} style={{height: size, width: size, objectFit: 'contain', borderRadius: '22%'}} />
  ) : typeof i === 'string' ? (
    <span style={{display: 'inline-block', fontSize: size, lineHeight: 1, fontFamily: '"Apple Color Emoji", "Noto Color Emoji", sans-serif'}}>{i}</span>
  ) : (
    <span style={{display: 'inline-flex', height: size, width: size}}>{i}</span>
  );

// Every launch film sits in a Stage: it sets the look and holds the frame until the fonts are in, because parts
// measure text while rendering (a measurement on the fallback font came out ~11% narrow, 2026-10-19).
export const Stage: React.FC<{look: Look; children: React.ReactNode}> = ({look, children}) => {
  const [handle] = useState(() => delayRender('launch fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return (
    <LookCtx.Provider value={look}>
      <AbsoluteFill style={{background: look.bg, overflow: 'hidden'}}>{ready ? children : null}</AbsoluteFill>
    </LookCtx.Provider>
  );
};

// ---------- Words ----------
// Tokens: words, "*word*" (accent), "{name}" (an inline icon from `icons`; an array cycles every `cycleEvery`).
type WordsProps = {text: string; at: number; per?: number; size: number; weight?: number; color?: string; family?: string; icons?: Record<string, Icon | Icon[]>; cycleEvery?: number; outAt?: number; tracking?: number};
export const Words: React.FC<WordsProps> = ({text, at, per = 3, size, weight = 700, color, family = LF.sans, icons = {}, cycleEvery = 14, outAt, tracking = -0.02}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const out = outAt === undefined ? 0 : leave(frame, outAt, 10);
  const toks = text.split(' ').filter(Boolean);
  let hotOn = false;
  return (
    <span style={{fontFamily: family, fontWeight: weight, fontSize: size, letterSpacing: `${tracking}em`, color: color ?? look.ink, opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined, whiteSpace: 'nowrap'}}>
      {toks.map((raw, i) => {
        const t0 = at + i * per;
        const p = settle(frame, t0, 12);
        let tok = raw;
        if (tok.startsWith('*')) (hotOn = true), (tok = tok.slice(1));
        const hot = hotOn;
        if (tok.endsWith('*')) (hotOn = false), (tok = tok.slice(0, -1));
        const icon = /^\{(\w+)\}$/.exec(tok);
        let body: React.ReactNode = hot ? <span style={{color: look.accent}}>{tok}</span> : tok;
        if (icon) {
          const v = icons[icon[1]];
          const list = Array.isArray(v) ? v : [v];
          const k = Math.max(0, frame - t0);
          const idx = Math.floor(k / cycleEvery) % list.length;
          const bounce = list.length > 1 ? 0.75 + 0.25 * settle(k % cycleEvery, 0, 7) : 1;
          const cur = list[idx];
          body = <span style={{display: 'inline-block', verticalAlign: typeof cur === 'string' && !isImage(cur) ? '-0.03em' : '-0.12em', transform: `scale(${(0.4 + 0.6 * land(frame, t0)) * bounce})`}}>{renderIcon(cur, '0.86em')}</span>;
        }
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * 0.25}em)`}}>{body}</span>
          </React.Fragment>
        );
      })}
    </span>
  );
};

// A centred line of Words at a given height.
export const Line: React.FC<WordsProps & {top: number; align?: 'center' | 'left'; x?: number}> = ({top, align = 'center', x = 0, ...w}) => {
  const {width} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 0 : x, width: align === 'center' ? width : undefined, top, textAlign: align, lineHeight: 1.08}}>
      <Words {...w} />
    </div>
  );
};

// Typewriter with a caret. Centred while it fits; with pan, once the caret reaches `anchor` (share of width)
// it parks there and the line grows leftward off the frame (a giant line the camera "follows").
// fitAt: once typed, the camera pulls back until the whole line fits (the payoff of a giant line).
export const Typewriter: React.FC<{text: string; at: number; cps?: number; size: number; weight?: number; top: number; pan?: boolean; anchor?: number; fitAt?: number; color?: string; outAt?: number}> = ({text, at, cps = 16, size, weight = 700, top, pan = false, anchor = 0.72, fitAt, color, outAt}) => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const look = useLook();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - at) * cps) / fps)));
  const done = n >= text.length;
  const blinkOn = !done || Math.floor((frame - at) / (fps / 2)) % 2 === 0;
  const out = outAt === undefined ? 0 : leave(frame, outAt, 10);
  if (frame < at) return null;
  const caret = <span style={{display: 'inline-block', width: Math.max(3, size * 0.055), height: size * 0.92, marginLeft: size * 0.04, verticalAlign: '-0.12em', background: look.accent, opacity: blinkOn ? 1 : 0}} />;
  const style: React.CSSProperties = {position: 'absolute', top, fontFamily: LF.sans, fontWeight: weight, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1, color: color ?? look.ink, whiteSpace: 'nowrap', opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined};
  const w = textWidth(text.slice(0, n), size, weight, LF.sans, -0.03) + size * 0.1;
  const left0 = pan ? Math.min((width - w) / 2, width * anchor - w) : (width - w) / 2;
  const fit = fitAt === undefined ? 0 : between(frame, fitAt, fitAt + 20, 0, 1);
  const sEnd = Math.min(1, (width * 0.86) / w);
  const s = 1 + (sEnd - 1) * fit;
  const left = left0 + ((width - w * sEnd) / 2 - left0) * fit;
  return <div style={{...style, left, transform: `scale(${s})`, transformOrigin: '0 50%'}}>{text.slice(0, n)}{caret}</div>;
};

// The line ladder: each new line lands big; the one before shrinks to a small grey caption above it.
export const LineLadder: React.FC<{lines: {text: string; at: number}[]; top: number; size: number; small?: number; weight?: number; outAt?: number}> = ({lines, top, size, small = size * 0.5, weight = 700, outAt}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const k = small / size;
  return (
    <>
      {lines.map((l, i) => {
        if (frame < l.at) return null;
        const next = lines[i + 1]?.at ?? Infinity;
        const after = lines[i + 2]?.at ?? Infinity;
        const m = frame >= next ? between(frame, next, next + 12, 0, 1) : 0; // big -> caption
        const gone = frame >= after ? between(frame, after, after + 10, 0, 1) : 0;
        if (gone >= 1) return null;
        const y = top - m * (small * 1.9);
        return (
          <div key={i} style={{position: 'absolute', left: 0, width, top: y, textAlign: 'center', lineHeight: 1.1, transform: `scale(${1 - (1 - k) * m})`, transformOrigin: '50% 0%', opacity: (1 - gone) * (1 - 0.55 * m)}}>
            <Words text={l.text} at={l.at} size={size} weight={weight} outAt={outAt} />
          </div>
        );
      })}
    </>
  );
};

// A fixed lead-in with a phrase underneath that rolls (slot-reel style, through a clipped window) on each cue.
export const WordSwap: React.FC<{prefix: string; items: {text: string; at: number}[]; at: number; top: number; size: number; outAt?: number}> = ({prefix, items, at, top, size, outAt}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const look = useLook();
  const o = outAt === undefined ? 0 : leave(frame, outAt, 10);
  const h = size * 1.25;
  return (
    <>
      <Line text={prefix} at={at} top={top} size={size} outAt={outAt} />
      <div style={{position: 'absolute', left: 0, width, top: top + size * 1.08, height: h, overflow: 'hidden', opacity: 1 - o}}>
        {items.map((it, i) => {
          const next = items[i + 1]?.at ?? Infinity;
          if (frame < it.at || frame > next + 14) return null;
          const inP = i === 0 ? settle(frame, it.at, 12) : between(frame, it.at, it.at + 12, 0, 1);
          const outP = frame >= next ? between(frame, next, next + 12, 0, 1) : 0;
          const y = (1 - inP) * h - outP * h;
          return (
            <div key={i} style={{position: 'absolute', left: 0, width, top: 0, height: h, lineHeight: `${h}px`, textAlign: 'center', fontFamily: LF.sans, fontWeight: 700, fontSize: size, letterSpacing: '-0.02em', color: look.accent, transform: `translateY(${y}px)`, opacity: i === 0 ? inP : 1}}>
              {it.text}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Transition: rush into the frame (scale up fast, blur, fade), from a chosen point.
export const ZoomThrough: React.FC<{at: number; origin?: string; children: React.ReactNode}> = ({at, origin = '50% 50%', children}) => {
  const frame = useCurrentFrame();
  const p = rush(frame, at, 14);
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 9 * p * p})`, transformOrigin: origin, opacity: 1 - c01((p - 0.5) * 2), filter: p ? `blur(${p * 8}px)` : undefined}}>{children}</div>;
};

// Show children only in [from, to); blur out over the last frames.
export const Beat: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const o = leave(frame, to - 9, 9);
  return <div style={{position: 'absolute', inset: 0, opacity: 1 - o, filter: o ? `blur(${o * 12}px)` : undefined}}>{children}</div>;
};

// ---------- Numbers ----------
// Slot-machine digits: each column spins two full turns and lands on its digit, left to right. Label below.
export const SlotCounter: React.FC<{value: string; at: number; size: number; top: number; label?: string; spin?: number; stagger?: number; outAt?: number}> = ({value, at, size, top, label, spin = 22, stagger = 3, outAt}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const look = useLook();
  const out = outAt === undefined ? 0 : leave(frame, outAt, 10);
  const appear = settle(frame, at, 8);
  const cell: React.CSSProperties = {display: 'block', height: '1.04em', lineHeight: '1.04em'};
  let d = 0;
  return (
    <div style={{position: 'absolute', left: 0, width, top, opacity: appear * (1 - out), filter: out ? `blur(${out * 10}px)` : undefined}}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-start', fontFamily: LF.sans, fontWeight: 700, fontSize: size, letterSpacing: '-0.03em', color: look.ink, fontVariantNumeric: 'tabular-nums'}}>
        {value.split('').map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i} style={cell}>{ch}</span>;
          const target = Number(ch);
          const stop = at + spin + d++ * stagger;
          const p = between(frame, at, stop, 0, 1);
          const pos = (20 + target) * p;
          const vel = p > 0 && p < 1 ? (20 + target) / (stop - at) : 0; // digits per frame, roughly
          return (
            <span key={i} style={{...cell, overflow: 'hidden'}}>
              <span style={{display: 'block', transform: `translateY(${-pos * 1.04}em)`, filter: vel > 0.3 ? `blur(${Math.min(5, vel * 3)}px)` : undefined}}>
                {Array.from({length: 30}, (_, k) => <span key={k} style={cell}>{k % 10}</span>)}
              </span>
            </span>
          );
        })}
      </div>
      {label && <div style={{textAlign: 'center', marginTop: size * 0.12}}><Words text={label} at={at + spin} size={size * 0.24} weight={600} color={look.sub} tracking={-0.01} /></div>}
    </div>
  );
};

// ---------- Walls ----------
// Rows of real UI pieces drifting sideways behind a stat (abundance without words). Edges fade out.
export const MarqueeWall: React.FC<{rows: React.ReactNode[][]; at: number; tops: number[]; speed?: number; gap?: number; outAt?: number}> = ({rows, at, tops, speed = 2.2, gap = 18, outAt}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const out = outAt === undefined ? 0 : leave(frame, outAt, 10);
  return (
    <>
      {rows.map((items, r) => {
        const dir = r % 2 ? 1 : -1;
        const p = settle(frame, at + r * 2, 16);
        const x = dir * (frame - at) * speed - (r % 2 ? 900 : 300);
        return (
          <div key={r} style={{position: 'absolute', left: 0, width, top: tops[r], overflow: 'hidden', opacity: p * (1 - out), transform: `translateY(${(1 - p) * (r < rows.length / 2 ? -40 : 40)}px)`, maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)'}}>
            <div style={{display: 'flex', gap, transform: `translateX(${x}px)`, width: 'max-content'}}>
              {[...items, ...items, ...items, ...items].map((it, k) => <div key={k} style={{flexShrink: 0}}>{it}</div>)}
            </div>
          </div>
        );
      })}
    </>
  );
};

export const Bubble: React.FC<{text: string; me?: boolean; size?: number}> = ({text, me, size = 22}) => {
  const look = useLook();
  return <div style={{background: me ? look.me : look.them, color: me ? '#fff' : look.themInk, fontFamily: LF.sans, fontWeight: 500, fontSize: size, padding: `${size * 0.42}px ${size * 0.75}px`, borderRadius: size * 1.1, whiteSpace: 'nowrap'}}>{text}</div>;
};

export const NotifCard: React.FC<{app: string; title: string; body: string; tint: string; size?: number}> = ({app, title, body, tint, size = 20}) => {
  const look = useLook();
  return (
    <div style={{width: size * 17, background: look.card, border: `1px solid ${look.faint}`, borderRadius: size * 0.9, padding: size * 0.7, display: 'flex', gap: size * 0.6, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', fontFamily: LF.sans}}>
      <div style={{width: size * 2, height: size * 2, borderRadius: size * 0.5, background: tint, flexShrink: 0}} />
      <div style={{minWidth: 0}}>
        <div style={{fontSize: size * 0.7, color: look.sub, fontWeight: 600}}>{app}</div>
        <div style={{fontSize: size * 0.85, color: look.ink, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</div>
        <div style={{fontSize: size * 0.75, color: look.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{body}</div>
      </div>
    </div>
  );
};

// ---------- Product stage ----------
// A phone with a dynamic island; children fill the screen. Rises in at `at`.
export const Phone: React.FC<{x: number; y: number; w: number; at: number; children?: React.ReactNode; src?: string}> = ({x, y, w, at, children, src}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const p = settle(frame, at, 18);
  const h = w * 2.12;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: h, borderRadius: w * 0.16, background: '#0A0A0B', padding: w * 0.03, opacity: p, transform: `translateY(${(1 - p) * 80}px)`, boxShadow: `0 30px 80px rgba(0,0,0,0.18)${look.name === 'dark' ? `, 0 0 0 2px ${look.faint}` : ''}`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.13, overflow: 'hidden', background: look.name === 'dark' ? '#000' : '#fff'}}>
        {src ? (/\.(mp4|webm|mov)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />) : children}
        <div style={{position: 'absolute', top: w * 0.035, left: '50%', width: w * 0.3, height: w * 0.085, marginLeft: -w * 0.15, borderRadius: w, background: '#0A0A0B'}} />
      </div>
    </div>
  );
};

// A chat that builds message by message (with a typing indicator before replies). Lives inside a screen.
export const ChatThread: React.FC<{messages: {from: 'me' | 'them'; text: string; at: number; typing?: number}[]; size?: number; pad?: number; padTop?: number; anchor?: 'top' | 'bottom'}> = ({messages, size = 17, pad = 16, padTop = pad * 4, anchor = 'top'}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const grow = (at: number) => between(frame, at, at + 8, 0, 1);
  const items: React.ReactNode[] = [];
  messages.forEach((m, i) => {
    const me = m.from === 'me';
    const align = me ? 'flex-end' : 'flex-start';
    if (m.typing && frame >= m.at - m.typing && frame < m.at) {
      const t = frame - (m.at - m.typing);
      items.push(
        <div key={`t${i}`} style={{display: 'flex', justifyContent: align, maxHeight: size * 1.6 * grow(m.at - m.typing)}}>
          <div style={{background: look.them, borderRadius: size, padding: `${size * 0.55}px ${size * 0.8}px`, display: 'flex', gap: size * 0.3}}>
            {[0, 1, 2].map((d) => <div key={d} style={{width: size * 0.42, height: size * 0.42, borderRadius: size, background: look.sub, opacity: 0.4 + 0.6 * Math.abs(Math.sin((t - d * 4) / 5))}} />)}
          </div>
        </div>,
      );
    }
    if (frame >= m.at) {
      const s = land(frame, m.at);
      items.push(
        <div key={i} style={{display: 'flex', justifyContent: align, maxHeight: grow(m.at) >= 1 ? undefined : m.typing ? size * 1.6 + size * 2.4 * grow(m.at) : size * 4 * grow(m.at)}}>
          <div style={{maxWidth: '78%', background: me ? look.me : look.them, color: me ? '#fff' : look.themInk, borderRadius: size * 1.05, padding: `${size * 0.5}px ${size * 0.75}px`, fontFamily: LF.sans, fontSize: size, fontWeight: 500, lineHeight: 1.3, transform: `scale(${0.7 + 0.3 * s})`, transformOrigin: me ? '100% 100%' : '0% 100%', opacity: c01(s * 2)}}>{m.text}</div>
        </div>,
      );
    }
  });
  return <div style={{position: 'absolute', inset: 0, padding: `${padTop}px ${pad}px ${pad * 1.6}px`, display: 'flex', flexDirection: 'column', justifyContent: anchor === 'top' ? 'flex-start' : 'flex-end', gap: size * 0.45, overflow: 'hidden'}}>{items}</div>;
};

// A pointer that glides between points and clicks (press + ripple).
export const Cursor: React.FC<{path: {x: number; y: number; at: number}[]; clicks?: number[]}> = ({path, clicks = []}) => {
  const frame = useCurrentFrame();
  if (frame < path[0].at - 8) return null;
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (frame >= a.at) {
      x = between(frame, a.at, b.at, a.x, b.x);
      y = between(frame, a.at, b.at, a.y, b.y);
    }
  }
  const c = clicks.find((k) => frame >= k && frame < k + 14);
  const press = c === undefined ? 1 : 1 - 0.18 * Math.sin(Math.min(1, (frame - c) / 6) * Math.PI);
  const ring = c === undefined ? 0 : (frame - c) / 14;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: settle(frame, path[0].at - 8, 8)}}>
      {c !== undefined && <div style={{position: 'absolute', left: -30 * ring, top: -30 * ring, width: 60 * ring, height: 60 * ring, borderRadius: 999, border: '3px solid rgba(47,123,255,0.6)', opacity: 1 - ring}} />}
      <svg width={34} height={34} viewBox="0 0 24 24" style={{transform: `scale(${press})`, transformOrigin: '20% 15%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
        <path d="M5 3l14 8-6 1.5L10 19z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// A glossy pill button that can be pressed (and swap to a done state).
export const PillButton: React.FC<{label: string; doneLabel?: string; x: number; y: number; at: number; pressAt?: number; w?: number}> = ({label, doneLabel, x, y, at, pressAt, w = 220}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const p = land(frame, at);
  const pressed = pressAt !== undefined && frame >= pressAt;
  const dip = pressAt === undefined ? 1 : 1 - 0.08 * Math.sin(c01((frame - pressAt) / 6) * Math.PI);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: w * 0.26, borderRadius: w, background: pressed && doneLabel ? look.ok : look.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LF.sans, fontWeight: 600, fontSize: w * 0.1, transform: `scale(${(0.85 + 0.15 * p) * dip})`, opacity: c01(p * 2), boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), 0 10px 24px ${look.accent}55`}}>
      {pressed && doneLabel ? doneLabel : label}
    </div>
  );
};

// Rows that land one by one; a row can turn to a warning colour, get a pill, or dim.
export const StatusTable: React.FC<{rows: {label: string; value: string; at: number; tone?: 'ok' | 'ink'; warnAt?: number; pill?: {text: string; at: number; tone: 'warn' | 'accent' | 'muted'; resolve?: {text: string; at: number}}; dimAt?: number}[]; top: number; w?: number; rowH?: number}> = ({rows, top, w = 900, rowH = 74}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const look = useLook();
  return (
    <div style={{position: 'absolute', left: (width - w) / 2, top, width: w}}>
      {rows.map((r, i) => {
        const p = settle(frame, r.at, 12);
        const warn = r.warnAt !== undefined ? between(frame, r.warnAt, r.warnAt + 8, 0, 1) : 0;
        const pill = r.pill ? land(frame, r.pill.at) : 0;
        const dim = r.dimAt !== undefined ? between(frame, r.dimAt, r.dimAt + 10, 0, 1) : 0;
        const done = r.pill?.resolve && frame >= r.pill.resolve.at;
        const pop = done ? 0.85 + 0.15 * land(frame, r.pill!.resolve!.at) : 1;
        const pillBg = done ? look.ok : r.pill?.tone === 'warn' ? look.warn : r.pill?.tone === 'accent' ? look.accent : look.faint;
        return (
          <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${look.faint}`, fontFamily: LF.sans, fontSize: rowH * 0.36, opacity: p * (1 - dim * 0.6), transform: `translateY(${(1 - p) * 20}px)`}}>
            <span style={{color: look.ink, fontWeight: 600}}>{r.label}</span>
            <span style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 14}}>
              <span style={{color: warn > 0.5 ? look.warn : r.tone === 'ok' ? look.ok : look.ink, fontWeight: 600, opacity: r.pill ? 1 - c01(pill * 1.5) : 1, fontVariantNumeric: 'tabular-nums'}}>{r.value}</span>
              {r.pill && pill > 0.01 && <span style={{position: 'absolute', right: 0, background: pillBg, color: r.pill.tone === 'muted' && !done ? look.sub : '#fff', borderRadius: 99, padding: '6px 16px', fontSize: rowH * 0.28, fontWeight: 700, transform: `scale(${(0.7 + 0.3 * pill) * pop})`, opacity: c01(pill * 2), whiteSpace: 'nowrap'}}>{done ? r.pill.resolve!.text : r.pill.text}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Brand ----------
export const AppIcon: React.FC<{size: number; children?: React.ReactNode; color?: string}> = ({size, children, color}) => {
  const look = useLook();
  return <div style={{width: size, height: size, borderRadius: size * 0.225, background: color ?? look.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 ${size * 0.03}px 0 rgba(255,255,255,0.3), 0 ${size * 0.12}px ${size * 0.3}px rgba(0,0,0,0.15)`}}>{children}</div>;
};

// "The all-new [icon] Name" lockup: the icon lands centre, then the words wipe out from behind it while the
// group slides so it stays centred; URL below.
export const Lockup: React.FC<{pre?: string; name: string; icon: React.ReactNode; url?: string; at: number; size?: number; top: number}> = ({pre = '', name, icon, url, at, size = 72, top}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const look = useLook();
  const iconW = size * 1.15;
  const g = size * 0.32;
  const preW = pre ? textWidth(pre, size, 500, LF.sans, -0.02) : 0;
  const nameW = textWidth(name, size, 700, LF.sans, -0.02);
  const open = between(frame, at + 10, at + 30, 0, 1);
  const total = iconW + (pre ? preW + g : 0) * open + (g + nameW) * open;
  const iconX = (width - total) / 2 + (pre ? preW + g : 0) * open;
  const s = land(frame, at);
  const txt: React.CSSProperties = {position: 'absolute', top: top + (iconW - size * 1.2) / 2, height: size * 1.2, lineHeight: `${size * 1.2}px`, fontFamily: LF.sans, fontSize: size, letterSpacing: '-0.02em', whiteSpace: 'nowrap'};
  return (
    <>
      {pre && <div style={{...txt, left: iconX - g - preW, width: preW, fontWeight: 500, color: look.sub, clipPath: `inset(0 0 0 ${(1 - open) * 100}%)`}}>{pre}</div>}
      <div style={{...txt, left: iconX + iconW + g, width: nameW + size * 0.1, fontWeight: 700, color: look.ink, clipPath: `inset(0 ${(1 - open) * 100}% 0 0)`}}>{name}</div>
      <div style={{position: 'absolute', left: iconX, top, transform: `scale(${0.4 + 0.6 * s})`, opacity: c01(s * 2)}}>{icon}</div>
      {url && <div style={{position: 'absolute', left: 0, width, top: top + iconW + size * 0.7, textAlign: 'center', fontFamily: LF.sans, fontWeight: 500, fontSize: size * 0.42, color: look.sub, opacity: settle(frame, at + 30, 12)}}>{url}</div>}
    </>
  );
};

// Small flat glyphs for inline icons and app icons (no external assets needed).
export const Glyph = {
  bolt: (c = '#fff') => <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill={c} /></svg>,
  chat: (c = '#fff') => <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M4 5h16v11H9l-5 4z" fill={c} /></svg>,
  link: (c = '#8E8E93') => <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1" fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round" /></svg>,
  mail: (c = '#fff') => <svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="3" y="5.5" width="18" height="13" rx="2.5" fill={c} /><path d="M4.5 7.5l7.5 5.5 7.5-5.5" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>,
  phone: (c = '#fff') => <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3A2.5 2.5 0 0 1 18 19.5 14.5 14.5 0 0 1 4.5 6 2.5 2.5 0 0 1 7 3.5z" fill={c} /></svg>,
  globe: (c = '#fff') => <svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="8.5" fill="none" stroke={c} strokeWidth={2.2} /><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z" fill="none" stroke={c} strokeWidth={2} /></svg>,
  dot: (c: string) => <svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="2" y="2" width="20" height="20" rx="5" fill={c} /></svg>,
};
