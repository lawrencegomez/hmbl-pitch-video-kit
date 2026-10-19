// Herk mix (Lawrence 2026-10-18): Bright Vox plus the build of the Herk Edit Kit giraffe test he loved
// ("not too much Vox, not too little"). Sticker cut-outs, one world the camera hops through (use <Camera> inside
// <Stepped>), a timeline ruler with a fixed "you are here" marker, numbered chapter tags, and an empty slot planted
// in the hook that fills at the close. No company data in here. How to use them: PLAYBOOK "Herk mix".
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CHARCOAL, glide} from './kit';

// Progress p (0..1) snapped to n visible steps: stop-motion growth, wipes and reveals.
export const stepsOf = (p: number, n: number) => (p >= 1 ? 1 : Math.floor(p * n) / n);

// Any object as a paper cut-out: thick sticker edge, thin ink edge, crisp offset shadow (no blur, no halftone).
// One SVG filter (grow the outline once), not stacked CSS drop-shadows: 17 of those stalled a render for minutes.
export const Cutout: React.FC<{edge?: number; edgeColor?: string; ink?: string; shadow?: [number, number]; style?: React.CSSProperties; children: React.ReactNode}> = ({edge = 10, edgeColor = '#FFFFFF', ink = CHARCOAL, shadow = [12, 14], style, children}) => {
  const id = `cut${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={edge} result="e" />
          <feMorphology in="SourceAlpha" operator="dilate" radius={edge + 2.5} result="k" />
          <feFlood floodColor={edgeColor} /><feComposite in2="e" operator="in" result="edgeL" />
          <feFlood floodColor={ink} /><feComposite in2="k" operator="in" result="inkL" />
          <feOffset in="k" dx={shadow[0]} dy={shadow[1]} result="so" />
          <feFlood floodColor="rgb(38,37,35)" floodOpacity={0.22} /><feComposite in2="so" operator="in" result="shL" />
          <feMerge><feMergeNode in="shL" /><feMergeNode in="inkL" /><feMergeNode in="edgeL" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </svg>
      <div style={{position: 'absolute', filter: `url(#${id})`, ...style}}>{children}</div>
    </>
  );
};

// Top-right chapter tag ("01 · SHORT NECKS"): tells the viewer where they are AND what the current part is.
export const ChapterTag: React.FC<{chapters: {at: number; label: string}[]; font: string; color?: string; top?: number}> = ({chapters, font, color = CHARCOAL, top = 92}) => {
  const f = useCurrentFrame();
  const cur = [...chapters].reverse().find((c) => f >= c.at);
  if (!cur) return null;
  const p = stepsOf(glide(f, cur.at, cur.at + 6), 3);
  return <div style={{position: 'absolute', right: 60, top, fontFamily: font, fontWeight: 800, fontSize: 26, letterSpacing: '0.16em', color, opacity: p, transform: `translateY(${(1 - p) * -12}px)`}}>{cur.label}</div>;
};

// The floor of the world (board space): a line, ticks, and a labelled mark at each stop. Left to right = toward today.
export const TimelineRuler: React.FC<{y: number; width: number; marks: {x: number; label: string}[]; font: string; color?: string; tick?: number}> = ({y, width, marks, font, color = CHARCOAL, tick = 54}) => {
  let d = '';
  for (let x = 0; x <= width; x += tick) d += `M${x},${y} v14 `;
  return (
    <svg width={width} height={y + 90} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={5} />
      <path d={d} stroke={color} strokeWidth={3} />
      {marks.map((m) => (
        <g key={m.label}>
          <line x1={m.x} y1={y} x2={m.x} y2={y + 28} stroke={color} strokeWidth={5} />
          <text x={m.x} y={y + 66} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={34} letterSpacing={5} fill={color}>{m.label}</text>
        </g>
      ))}
    </svg>
  );
};

// Fixed to the frame (outside <Camera>), just above the ruler: the ruler's marks slide under it as the camera hops.
export const YouAreHere: React.FC<{y: number; color?: string}> = ({y, color = CHARCOAL}) => (
  <div style={{position: 'absolute', left: 540 - 14, top: y - 32, width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `20px solid ${color}`}} />
);

// The open question: what the video is about, shown as an empty dashed outline in the hook and filled at the close
// (bottom up, in steps). `emptyAt` = start full and drain top-down (the hook's "here it is... now it's a question").
// `outline` = the dashed version (default: a dashed rounded frame); children = the real thing (logo, product, animal).
export const EmptySlot: React.FC<{fillAt: number; emptyAt?: number; dur?: number; steps?: number; w: number; h: number; outline?: React.ReactNode; style?: React.CSSProperties; children: React.ReactNode}> = ({fillAt, emptyAt, dur = 16, steps = 8, w, h, outline, style, children}) => {
  const f = useCurrentFrame();
  let v = 0;
  if (f >= fillAt) v = stepsOf(glide(f, fillAt, fillAt + dur), steps);
  else if (emptyAt !== undefined) v = 1 - stepsOf(glide(f, emptyAt, emptyAt + dur), steps);
  const P = 80; // room for sticker edges and shadows outside the box
  return (
    <div style={{position: 'absolute', width: w, height: h, ...style}}>
      {outline ?? <div style={{position: 'absolute', inset: 0, border: `6px dashed ${CHARCOAL}`, borderRadius: 24}} />}
      {v > 0 && (
        <div style={{position: 'absolute', left: -P, top: -P, width: w + 2 * P, height: h + 2 * P, padding: P, boxSizing: 'border-box', clipPath: `inset(${(1 - v) * (h + P)}px 0 0 0)`}}>
          <div style={{position: 'relative', width: w, height: h}}>{children}</div>
        </div>
      )}
    </div>
  );
};
