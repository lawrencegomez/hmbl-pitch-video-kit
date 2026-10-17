// Vox "Mode A" toolkit (the vox-style-video skill's 10 rules as reusable parts). No company data in here.
// Rule map: 2 Stepped/stepped(), 3 glide()/VOX_EASE, 4 PrintTexture + Bokeh, 5 Shot (cut the curve),
// 6 Depth (parallax layers), 7 Bokeh, 8 YellowBox + tools/vox-halftone.sh, 9 VoxText + HandCircle, 10 MapFocus.
// Rule 1 (chromatic aberration) runs on the finished file: tools/vox-ca.sh.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';

export const VOX_YELLOW = '#F8E634';
export const CHARCOAL = '#262523';

// ---------------------------------------------------------------- rule 2 + 3: time
export const STEP = 2.5; // 30 fps file, ~12 new images a second
export const stepped = (f: number) => Math.floor(Math.floor(f / STEP) * STEP);
export const VOX_EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const glide = (f: number, a: number, b: number, out: [number, number] = [0, 1]) =>
  interpolate(f, [a, b], out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: VOX_EASE});
const vel = (p: number) => (VOX_EASE(Math.min(1, p + 0.01)) - VOX_EASE(Math.max(0, p - 0.01))) / 0.02;

// Everything visual goes inside; audio stays outside so it never stutters.
export const Stepped: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return <Freeze frame={stepped(frame)}>{children}</Freeze>;
};

// ---------------------------------------------------------------- rule 4 + 7: surfaces
const useId = (p: string) => `${p}${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

// Background: four-colour muted gradient + rough, softened grid + paper relief. Oversized so camera moves never show an edge.
export const Bokeh: React.FC<{c: [string, string, string, string]; base: string; line: string; cell?: number; seed?: number}> = ({c, base, line, cell = 84, seed = 3}) => {
  const id = useId('bk');
  return (
    <div style={{position: 'absolute', inset: -360}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(at 0% 0%, ${c[0]}, transparent 62%), radial-gradient(at 100% 0%, ${c[1]}, transparent 62%), radial-gradient(at 100% 100%, ${c[2]}, transparent 62%), radial-gradient(at 0% 100%, ${c[3]}, transparent 62%), ${base}`}} />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, filter: 'blur(1.3px)'}}>
        <defs>
          <pattern id={`${id}p`} width={cell} height={cell} patternUnits="userSpaceOnUse">
            <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke={line} strokeWidth={2} />
          </pattern>
          <filter id={`${id}r`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} />
            <feDisplacementMap in="SourceGraphic" scale={9} />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}p)`} filter={`url(#${id}r)`} />
      </svg>
    </div>
  );
};

// Over the whole frame: crumpled-paper relief, fibres, a faint graph-paper grid (real Vox lays it over footage too), vignette.
// vignette: edge darkening (0.3 = moody, ~0.1 for bright videos).
export const PrintTexture: React.FC<{strength?: number; grid?: boolean; vignette?: number}> = ({strength = 1, grid = true, vignette = 0.3}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.32 * strength}}>
      <filter id="voxRelief">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={4} seed={11} />
        <feDiffuseLighting lightingColor="#fff" surfaceScale={3.2}>
          <feDistantLight azimuth={235} elevation={58} />
        </feDiffuseLighting>
      </filter>
      <rect width="100%" height="100%" filter="url(#voxRelief)" />
    </svg>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.2 * strength}}>
      <filter id="voxFibre">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.37  0 0 0 0 0.3  0 0 0 0.45 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#voxFibre)" />
    </svg>
    {grid && (
      <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.06 * strength, backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '26px 26px'}} />
    )}
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(30,22,12,${vignette}) 100%)`}} />
  </AbsoluteFill>
);

// Film grain; the seed follows the (stepped) frame.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.2}) => {
  const frame = useCurrentFrame();
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <filter id="voxGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={frame % 97} />
      </filter>
      <rect width="100%" height="100%" filter="url(#voxGrain)" />
    </svg>
  );
};

// Torn paper polygon for clippings, tags and prints.
export const tornPath = (seed: string, rough = 1, teeth = 22) => {
  const pts: string[] = [];
  const r = (k: string, a: number) => random(`${seed}${k}`) * a * rough;
  for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * 100}% ${r(`t${i}`, 2.4)}%`);
  for (let i = 0; i <= teeth; i++) pts.push(`${100 - r(`r${i}`, 1.3)}% ${(i / teeth) * 100}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${(i / teeth) * 100}% ${100 - r(`b${i}`, 2.4)}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${r(`l${i}`, 1.3)}% ${(i / teeth) * 100}%`);
  return `polygon(${pts.join(',')})`;
};

// A piece of paper (mottled, never a flat fill) with torn edges and a soft shadow.
export const Paper: React.FC<{seed: string; w: number; h?: number; tone?: string; rotate?: number; rough?: number; style?: React.CSSProperties; children?: React.ReactNode; pad?: number}> = ({seed, w, h, tone = '#F4EFE4', rotate = 0, rough = 1, style, children, pad = 28}) => (
  <div style={{position: 'absolute', width: w, height: h, transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 16px 22px rgba(40,28,14,0.30))', ...style}}>
    <div style={{width: '100%', height: '100%', padding: pad, boxSizing: 'border-box', clipPath: tornPath(seed, rough), background: `radial-gradient(at 20% 15%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(at 85% 90%, rgba(120,95,60,0.12), transparent 65%), ${tone}`}}>
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------- rule 5: cut the curve
export type Move = {kind: 'whip'; dx: number; dy: number} | {kind: 'push'; k: number};

// One shot between two hard cuts. The exit move speeds up into `to`, the next shot's enter move continues at the same
// speed and settles, so the cut sits at peak velocity. Directional blur follows the speed. No fades.
// inHalf / outHalf: frames each side of a cut; the next shot's inHalf must equal this shot's outHalf.
export const Shot: React.FC<{from: number; to: number; enter?: Move; exit?: Move; inHalf?: number; outHalf?: number; bg?: React.ReactNode; bgDepth?: number; children: React.ReactNode}> = ({from, to, enter, exit, inHalf = 18, outHalf = 18, bg, bgDepth = 0.45, children}) => {
  const f = useCurrentFrame();
  const id = useId('shot');
  if (f < from || f >= to) return null;
  let move: Move | undefined;
  let p = 1;
  let half = outHalf;
  if (exit && f >= to - outHalf) {
    move = exit;
    p = 0.5 * ((f - (to - outHalf)) / outHalf);
  } else if (enter && f < from + inHalf) {
    move = enter;
    half = inHalf;
    p = 0.5 + 0.5 * ((f - from) / inHalf);
  }
  let tx = 0, ty = 0, sc = 1, bx = 0, by = 0, bsc = 1, sx = 0, sy = 0, iso = 0;
  if (move) {
    const e = VOX_EASE(p);
    const k = p < 0.5 ? -e : 1 - e; // exit: 0 -> -0.5 ; enter: +0.5 -> 0
    const v = vel(p) / (2 * half);
    if (move.kind === 'whip') {
      tx = k * move.dx; ty = k * move.dy; bx = tx * bgDepth; by = ty * bgDepth;
      sx = Math.min(70, Math.abs(move.dx) * v * 0.55); sy = Math.min(70, Math.abs(move.dy) * v * 0.55);
    } else {
      const l = Math.log(move.k) * (p < 0.5 ? e : e - 1);
      sc = Math.exp(l); bsc = Math.exp(l * bgDepth);
      iso = Math.min(9, Math.log(move.k) * v * 700 * 0.05);
    }
  }
  const blurOn = sx > 0.4 || sy > 0.4;
  return (
    <AbsoluteFill style={{filter: blurOn ? `url(#${id})` : iso > 0.4 ? `blur(${iso}px)` : undefined, overflow: 'hidden'}}>
      {blurOn && (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${sx} ${sy}`} edgeMode="duplicate" />
          </filter>
        </svg>
      )}
      {bg && <AbsoluteFill style={{transform: `translate(${bx}px, ${by}px) scale(${bsc})`}}>{bg}</AbsoluteFill>}
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${sc})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// A camera inside one shot: looks at board point (x, y) at zoom s; each key glides in over `dur` frames.
export type Key = {at: number; x: number; y: number; s: number; dur?: number};
export const camAt = (f: number, keys: Key[]) => {
  let {x, y, s} = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const p = glide(f, k.at, k.at + (k.dur ?? 42));
    x += (k.x - x) * p; y += (k.y - y) * p; s *= Math.pow(k.s / s, p);
  }
  return {x, y, s};
};
export const Camera: React.FC<{keys: Key[]; children: React.ReactNode}> = ({keys, children}) => {
  const {x, y, s} = camAt(useCurrentFrame(), keys);
  return <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${s}) translate(${-x}px, ${-y}px)`}}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- rule 6: depth layers
// Layers of one still (each a transparent PNG, the back plate patched). `drift` (-1..1) is the camera; near layers move more.
export const Depth: React.FC<{layers: {src: string; depth: number; blur?: number}[]; w: number; h: number; drift: number; push?: number; travel?: number}> = ({layers, w, h, drift, push = 0, travel = 46}) => (
  <div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
    {layers.map((l) => (
      <Img key={l.src} src={staticFile(l.src)} style={{position: 'absolute', left: -w * 0.06, top: -h * 0.06, width: w * 1.12, height: h * 1.12, objectFit: 'cover', transform: `translateX(${drift * travel * l.depth}px) scale(${1 + push * (0.4 + l.depth)})`, filter: l.blur ? `blur(${l.blur}px)` : undefined}} />
    ))}
  </div>
);

// ---------------------------------------------------------------- rule 8: yellow box behind the key word
// until: the frame the next highlight arrives; this one then wipes off (one yellow box at a time).
export const YellowBox: React.FC<{at: number; children: React.ReactNode; dur?: number; color?: string; until?: number}> = ({at, children, dur = 7, color = VOX_YELLOW, until = Infinity}) => {
  const f = useCurrentFrame();
  const p = f >= until ? 1 - glide(f, until, until + dur) : glide(f, at, at + dur);
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span style={{position: 'absolute', left: '-0.12em', right: '-0.12em', top: '0.04em', bottom: '0.0em', background: color, transform: `scaleX(${p})`, transformOrigin: f >= until ? 'right center' : 'left center'}} />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

// ---------------------------------------------------------------- rule 9: text presets (use one at a time)
export type Preset = 'fill' | 'random' | 'odometer' | 'type' | 'none';
const GLYPHS = {d: '0123456789', u: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', l: 'abcdefghijklmnopqrstuvwxyz'};
const mix = (a: string, b: string, t: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

// stroke: thin ink outline so yellow letters stay readable on bright backgrounds (invisible once they turn ink).
export const VoxText: React.FC<{text: string; at: number; preset: Preset; size: number; font: string; weight?: number; italic?: boolean; ink?: string; hi?: string; style?: React.CSSProperties; seed?: string; spread?: number; settle?: boolean; stroke?: boolean}> = ({text, at, preset, size, font, weight = 700, italic = false, ink = CHARCOAL, hi = VOX_YELLOW, style, seed = text, spread = 16, settle = true, stroke = false}) => {
  const f = useCurrentFrame();
  const chars = [...text];
  const toInk = (start: number) => (settle ? mix(hi, ink, glide(f, start, start + 4)) : hi);
  return (
    <div style={{fontFamily: font, fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', lineHeight: 1.05, whiteSpace: 'pre', color: ink, ...(stroke ? {WebkitTextStroke: `${Math.max(1.5, size * 0.022)}px ${ink}`, paintOrder: 'stroke fill'} : {}), ...style}}>
      {chars.map((ch, i) => {
        const key = `${i}`;
        if (preset === 'none') return <span key={key}>{ch}</span>;
        if (preset === 'type') return <span key={key} style={{opacity: f >= at + i * 1.3 ? 1 : 0}}>{ch}</span>;
        if (preset === 'random') {
          const t = at + Math.round(random(`${seed}${i}`) * spread);
          return <span key={key} style={{opacity: f >= t ? 1 : 0, color: toInk(t + 2)}}>{ch}</span>;
        }
        if (preset === 'fill') {
          const t = at + 6 + i * 0.7;
          return <span key={key} style={{opacity: f >= at ? 1 : 0, color: toInk(t)}}>{ch}</span>;
        }
        // odometer: letters and digits roll like a slot machine and land left to right; other characters just appear
        // in a number ("$5M+") only digits roll: a rolling unit letter flashes wrong values like "$5B+"
        const set = /\d/.test(ch) ? GLYPHS.d : /\d/.test(text) ? '' : /[A-Z]/.test(ch) ? GLYPHS.u : /[a-z]/.test(ch) ? GLYPHS.l : '';
        const start = at + i * 1.6;
        const land = start + 10;
        if (!set) return <span key={key} style={{opacity: f >= start ? 1 : 0, color: toInk(land)}}>{ch}</span>;
        if (f >= land) return <span key={key} style={{color: toInk(land)}}>{ch}</span>;
        // the target glyph (invisible) sets the width; the reel rolls in a window exactly that wide
        const reel = [...Array(7)].map((_, k) => set[Math.floor(random(`${seed}${i}${k}`) * set.length)]).concat(ch);
        const p = glide(f, start, land);
        return (
          <span key={key} style={{position: 'relative', display: 'inline-block', opacity: f >= start ? 1 : 0, color: hi, clipPath: 'inset(-0.1em -0.3em -0.12em -0.3em)'}}>
            <span style={{visibility: 'hidden'}}>{ch}</span>
            <span style={{position: 'absolute', left: '50%', top: 0, transform: `translate(-50%, ${-p * (reel.length - 1) * 1.6}em)`}}>
              {reel.map((g, k) => <span key={k} style={{display: 'block', height: '1.6em', textAlign: 'center'}}>{g}</span>)}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// A pen line that draws itself on (Trim Paths). Optional wobble from the seed.
export const DrawPath: React.FC<{d: string; at: number; dur?: number; color?: string; width?: number; w?: number; h?: number; style?: React.CSSProperties}> = ({d, at, dur = 20, color = CHARCOAL, width = 6, w = 1080, h = 1920, style}) => {
  const p = glide(useCurrentFrame(), at, at + dur);
  if (p <= 0) return null;
  const {strokeDasharray, strokeDashoffset} = evolvePath(p, d);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style}}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
    </svg>
  );
};

// Hand-drawn loop around something: a bit more than one turn, uneven, slightly tilted (like a real pen).
export const circlePath = (cx: number, cy: number, w: number, h: number, seed = 'c', tilt = -0.07) => {
  const pts: string[] = [];
  const turns = 1.14;
  const ph = random(seed) * 6;
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const a = -2.5 + t * turns * Math.PI * 2;
    const g = 1 + 0.06 * t;
    const rx = (w / 2) * g * (1 + 0.035 * Math.sin(a * 3 + ph));
    const ry = (h / 2) * g * (1 + 0.05 * Math.cos(a * 2 + ph));
    const x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push(`${(cx + x * Math.cos(tilt) - y * Math.sin(tilt)).toFixed(1)} ${(cy + x * Math.sin(tilt) + y * Math.cos(tilt)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};
export const HandCircle: React.FC<{cx: number; cy: number; w: number; h: number; at: number; dur?: number; color?: string; width?: number; seed?: string}> = ({cx, cy, w, h, at, dur = 18, color = CHARCOAL, width = 6, seed}) => (
  <DrawPath d={circlePath(cx, cy, w, h, seed)} at={at} dur={dur} color={color} width={width} />
);

// Circle drawn around inline words; w/h = the circle's size in px, centred on the words (so it can't drift off them).
export const Circled: React.FC<{at: number; w: number; h: number; children: React.ReactNode; dur?: number; color?: string; width?: number; seed?: string; tilt?: number}> = ({at, w, h, children, dur = 18, color = CHARCOAL, width = 6, seed = 'cw', tilt}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    {children}
    <span style={{position: 'absolute', left: '50%', top: '52%', width: w, height: h, transform: 'translate(-50%, -50%)'}}>
      <DrawPath d={circlePath(w / 2, h / 2, w * 0.94, h * 0.86, seed, tilt)} at={at} dur={dur} color={color} width={width} w={w} h={h} />
    </span>
  </span>
);

// ---------------------------------------------------------------- rule 10: map focus
// The map goes grey, dark and soft everywhere except a circle whose centre glides to where the viewer should look.
// sharp: optional full-colour version for the focus area (src stays the soft, toned one around it).
// bright: keep the outside light and lightly tinted instead of dark grey (for bright videos).
export const MapFocus: React.FC<{src: string; sharp?: string; w: number; h: number; from: [number, number]; to: [number, number]; at: number; dur?: number; r?: number; bright?: boolean}> = ({src, sharp = src, w, h, from, to, at, dur = 42, r = 230, bright = false}) => {
  const p = glide(useCurrentFrame(), at, at + dur);
  const cx = from[0] + (to[0] - from[0]) * p;
  const cy = from[1] + (to[1] - from[1]) * p;
  const rr = r * (1.6 - 0.6 * p);
  const mask = `radial-gradient(circle ${rr}px at ${cx}px ${cy}px, transparent 0%, transparent 45%, black 100%)`;
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
      <Img src={staticFile(sharp)} style={{position: 'absolute', inset: 0, width: w, height: h, filter: bright ? 'saturate(0.95) contrast(1.06)' : 'saturate(0.4) contrast(1.15) brightness(1.03)'}} />
      <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: w, height: h, filter: bright ? `grayscale(0.55) blur(${2 + 5 * p}px)` : `grayscale(0.95) blur(${2 + 5 * p}px) brightness(0.92)`, WebkitMaskImage: mask, maskImage: mask}} />
      <div style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', background: bright ? `radial-gradient(circle ${rr * 1.9}px at ${cx}px ${cy}px, #fff 0%, #fff 32%, rgb(${210 - 40 * p},${226 - 26 * p},${242 - 12 * p}) 100%)` : `radial-gradient(circle ${rr * 1.9}px at ${cx}px ${cy}px, #fff 0%, #fff 32%, rgb(${170 - 90 * p},${170 - 90 * p},${170 - 90 * p}) 100%)`}} />
    </div>
  );
};
