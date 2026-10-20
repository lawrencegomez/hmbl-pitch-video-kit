// Spec Explainer building blocks. Flat 2D only: thin ink lines, one orange, no gradients, no glow.
// Every `at` here is a frame number relative to the scene (the scene resolves word cues for you).
import React, {useId} from 'react';
import {Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import {F, SPEC, accentRuns, draw, enter, glide} from './theme';

const pad = (n: number) => String(n).padStart(2, '0');
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Any SVG shape (circle, line, path, ellipse) drawn on from start to end. With `dash`, the shape is dashed
// and the draw-on runs through a mask, since one stroke cannot be dashed and drawn on at the same time.
export const DrawShape: React.FC<{shape: React.ReactElement; p: number; stroke?: string; sw?: number; dash?: string}> = ({shape, p, stroke = SPEC.ink, sw = 2.5, dash}) => {
  const id = `m${useId().replace(/:/g, '')}`;
  const on = {fill: 'none', pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p};
  if (!dash) return React.cloneElement(shape, {...on, stroke, strokeWidth: sw});
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse">{React.cloneElement(shape, {...on, stroke: '#fff', strokeWidth: sw + 10})}</mask>
      {React.cloneElement(shape, {fill: 'none', stroke, strokeWidth: sw, strokeDasharray: dash, mask: `url(#${id})`})}
    </>
  );
};

const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>
);

// Top HUD on every frame: product code, chapter tag, running timecode, a thin progress bar with an orange playhead.
export const Hud: React.FC<{code: string; tag: string; total: number; marks: number[]; dark?: boolean}> = ({code, tag, total, marks, dark}) => {
  const frame = useCurrentFrame();
  const ink = dark ? SPEC.bg : SPEC.ink;
  const p = frame / Math.max(1, total - 1);
  const s = Math.floor(frame / FPS);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 66, color: ink, fontFamily: F.mono, fontSize: 25, fontWeight: 500, letterSpacing: '0.08em'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <span style={{fontWeight: 700}}>{code}</span>
        <span style={{opacity: 0.6}}>{tag}</span>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{`${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(frame % FPS)}`}</span>
      </div>
      <div style={{position: 'relative', height: 2, marginTop: 20, background: dark ? 'rgba(234,229,219,0.3)' : SPEC.faint}}>
        {marks.map((m, i) => (
          <div key={i} style={{position: 'absolute', left: `${m * 100}%`, top: -4, width: 2, height: 10, background: ink, opacity: 0.45}} />
        ))}
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: ink}} />
        <div style={{position: 'absolute', left: `${p * 100}%`, top: -8, width: 6, height: 18, marginLeft: -3, background: SPEC.accent}} />
      </div>
    </div>
  );
};

// Heavy all-caps headline, line by line on its cues. "*word*" turns orange.
export const Headline: React.FC<{lines: string[]; at: number[]; top: number; size?: number; color?: string}> = ({lines, at, top, size, color = SPEC.ink}) => {
  const frame = useCurrentFrame();
  // shortcut: Inter Black caps run ~0.7 em a letter, so this keeps the longest line inside 960 px; set `size` by hand if a line still crowds.
  const longest = Math.max(...lines.map((l) => l.replace(/\*/g, '').length));
  const fs = size ?? Math.min(132, Math.floor(960 / (longest * 0.7)));
  return (
    <div style={{position: 'absolute', left: 60, width: 960, top, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: fs, lineHeight: 0.94, letterSpacing: '-0.025em', color, textTransform: 'uppercase'}}>
      {lines.map((l, i) => {
        const s = enter(frame, at[i] ?? at[0] + i * 3);
        return (
          <div key={i} style={{opacity: clamp01(s * 3), transform: `translateY(${(1 - s) * 46}px) scale(${0.92 + 0.08 * s})`}}>
            {accentRuns(l).map(([txt, hot], k) => (
              <span key={k} style={{color: hot ? SPEC.accent : undefined}}>{txt}</span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// An orange line drawn across whatever it wraps.
export const StrikeThrough: React.FC<{at: number; children: React.ReactNode; color?: string; thickness?: number}> = ({at, children, color = SPEC.accent, thickness = 7}) => {
  const frame = useCurrentFrame();
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <span style={{position: 'absolute', left: -10, right: -10, top: '54%', height: thickness, marginTop: -thickness / 2, background: color, transformOrigin: 'left center', transform: `scaleX(${draw(frame, at, 7)})`}} />
    </span>
  );
};

// Lowercase italic serif quip ("a ball?", "nope."). Centred on x.
export const Aside: React.FC<{text: string; at: number; x: number; y: number; size?: number; color?: string; tilt?: number; strikeAt?: number}> = ({text, at, x, y, size = 70, color = SPEC.ink, tilt = -5, strikeAt}) => {
  const frame = useCurrentFrame();
  const s = enter(frame, at);
  const body = <span>{text}</span>;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${0.7 + 0.3 * s})`, opacity: clamp01(s * 3), fontFamily: F.aside, fontStyle: 'italic', fontWeight: 500, fontSize: size, color, whiteSpace: 'nowrap', textTransform: 'lowercase'}}>
      {strikeAt !== undefined ? <StrikeThrough at={strikeAt}>{body}</StrikeThrough> : body}
    </div>
  );
};

// White card that pops up whenever a fact is stated: small source label, orange rule, the quote.
export const SourceCard: React.FC<{source: string; quote: string; at: number; top: number; width?: number}> = ({source, quote, at, top, width = 820}) => {
  const frame = useCurrentFrame();
  const s = enter(frame, at);
  return (
    <div
      style={{
        position: 'absolute', left: 540, width: 'max-content', maxWidth: width, minWidth: 460, top, background: SPEC.card, borderRadius: 14, padding: '26px 34px 30px',
        boxShadow: '0 16px 40px rgba(17,17,17,0.10), 0 2px 6px rgba(17,17,17,0.06)',
        opacity: clamp01(s * 3), transform: `translate(-50%, ${(1 - s) * 34}px) scale(${0.94 + 0.06 * s})`,
      }}
    >
      <div style={{fontFamily: F.mono, fontSize: 22, fontWeight: 500, letterSpacing: '0.1em', color: 'rgba(17,17,17,0.55)'}}>SOURCE · {source.toUpperCase()}</div>
      <div style={{width: 72 * draw(frame, at + 4, 10), height: 4, background: SPEC.accent, margin: '14px 0 18px'}} />
      <div style={{fontFamily: F.head, fontWeight: 800, fontSize: 36, lineHeight: 1.22, letterSpacing: '-0.01em', color: SPEC.ink}}>“{quote}”</div>
    </div>
  );
};

// Numbered orange badge. Positioned by its centre when x / y are given.
export const Badge: React.FC<{n: number | string; at: number; size?: number; x?: number; y?: number}> = ({n, at, size = 64, x, y}) => {
  const frame = useCurrentFrame();
  const s = enter(frame, at);
  return (
    <div
      style={{
        position: x === undefined ? 'relative' : 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: SPEC.accent,
        color: '#fff', fontFamily: F.mono, fontWeight: 700, fontSize: size * 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `${x === undefined ? '' : 'translate(-50%, -50%) '}scale(${s})`, flexShrink: 0,
        boxShadow: `0 0 0 4px ${SPEC.bg}`, // a flat page-coloured ring keeps it readable on top of anything orange
      }}
    >
      {n}
    </div>
  );
};

export const DashedCircle: React.FC<{cx: number; cy: number; r: number; at: number; dur?: number; color?: string; sw?: number; dash?: string}> = ({cx, cy, r, at, dur = 18, color = SPEC.ink, sw = 2.5, dash = '9 12'}) => {
  const frame = useCurrentFrame();
  return (
    <Frame>
      <DrawShape shape={<circle cx={cx} cy={cy} r={r} />} p={draw(frame, at, dur)} stroke={color} sw={sw} dash={dash} />
    </Frame>
  );
};

// A thin leader line from a point to a mono label (spec callouts like "Ø 70 MM").
export const Callout: React.FC<{from: [number, number]; to: [number, number]; text: string; at: number; color?: string}> = ({from, to, text, at, color = SPEC.ink}) => {
  const frame = useCurrentFrame();
  const left = to[0] < from[0];
  const s = enter(frame, at + 8);
  return (
    <>
      <Frame>
        <circle cx={from[0]} cy={from[1]} r={6 * clamp01(draw(frame, at, 4) * 2)} fill={SPEC.accent} />
        <DrawShape shape={<line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />} p={draw(frame, at, 10)} stroke={color} sw={2} />
      </Frame>
      <div style={{position: 'absolute', top: to[1] - 46, left: left ? to[0] : undefined, right: left ? undefined : 1080 - to[0], fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: '0.06em', color, background: SPEC.bg, padding: '2px 8px', margin: '0 -8px', opacity: clamp01(s * 3), transform: `translateY(${(1 - s) * 12}px)`}}>
        {text}
      </div>
    </>
  );
};

// Concentric dashed rings, crosshair, 10-degree ticks, degree labels, an optional orange sweep.
export const RadarGrid: React.FC<{cx: number; cy: number; r: number; at: number; color?: string; sweep?: boolean}> = ({cx, cy, r, at, color = SPEC.ink, sweep = true}) => {
  const frame = useCurrentFrame();
  const ticks = Array.from({length: 36}, (_, i) => i * 10);
  const tp = glide(frame, at + 12, 14);
  const ang = ((frame - at - 20) * 2.4 * Math.PI) / 180;
  return (
    <>
      <Frame>
        {[1 / 3, 2 / 3, 1].map((k, i) => (
          <DrawShape key={k} shape={<circle cx={cx} cy={cy} r={r * k} />} p={draw(frame, at + i * 3, 16)} stroke={color} sw={k === 1 ? 2.5 : 1.6} dash={k === 1 ? undefined : '6 10'} />
        ))}
        <DrawShape shape={<line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />} p={draw(frame, at + 4, 14)} stroke={color} sw={1.4} dash="4 8" />
        <DrawShape shape={<line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />} p={draw(frame, at + 6, 14)} stroke={color} sw={1.4} dash="4 8" />
        {ticks.map((d) => {
          const a = (d * Math.PI) / 180;
          const len = d % 30 === 0 ? 18 : 9;
          return <line key={d} x1={cx + Math.sin(a) * r} y1={cy - Math.cos(a) * r} x2={cx + Math.sin(a) * (r + len)} y2={cy - Math.cos(a) * (r + len)} stroke={color} strokeWidth={1.6} opacity={tp} />;
        })}
        {sweep && frame > at + 20 && (
          <>
            <path d={`M${cx},${cy} L${cx + Math.sin(ang) * r},${cy - Math.cos(ang) * r} A${r},${r} 0 0 0 ${cx + Math.sin(ang - 0.5) * r},${cy - Math.cos(ang - 0.5) * r} Z`} fill={SPEC.accent} opacity={0.1} />
            <line x1={cx} y1={cy} x2={cx + Math.sin(ang) * r} y2={cy - Math.cos(ang) * r} stroke={SPEC.accent} strokeWidth={3} />
          </>
        )}
      </Frame>
      {[0, 180].map((d) => {
        const a = (d * Math.PI) / 180;
        return (
          <div key={d} style={{position: 'absolute', left: cx + Math.sin(a) * (r + 48), top: cy - Math.cos(a) * (r + 48), transform: 'translate(-50%, -50%)', fontFamily: F.mono, fontSize: 22, fontWeight: 500, color, opacity: tp}}>
            {d}°
          </div>
        );
      })}
    </>
  );
};

// Flat wireframe globe (front view), with an optional orange pin at a real latitude / longitude.
export const WireGlobe: React.FC<{cx: number; cy: number; r: number; at: number; pin?: {lat: number; lon: number; label?: string; at: number}; lon0?: number}> = ({cx, cy, r, at, pin, lon0}) => {
  const frame = useCurrentFrame();
  const centre = lon0 ?? (pin ? pin.lon + 18 : 0);
  const rad = (d: number) => (d * Math.PI) / 180;
  const px = pin ? cx + r * Math.cos(rad(pin.lat)) * Math.sin(rad(pin.lon - centre)) : 0;
  const py = pin ? cy - r * Math.sin(rad(pin.lat)) : 0;
  const ps = pin ? enter(frame, pin.at) : 0;
  return (
    <>
      <Frame>
        <DrawShape shape={<circle cx={cx} cy={cy} r={r} />} p={draw(frame, at, 18)} sw={2.6} />
        {[-60, -30, 30, 60].map((d, i) => (
          <DrawShape key={`m${d}`} shape={<ellipse cx={cx} cy={cy} rx={Math.abs(Math.sin(rad(d))) * r} ry={r} />} p={draw(frame, at + 4 + i * 2, 16)} sw={1.5} dash="6 9" />
        ))}
        <DrawShape shape={<line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />} p={draw(frame, at + 4, 14)} sw={1.5} dash="6 9" />
        {[-60, -30, 0, 30, 60].map((d, i) => {
          const y = cy - r * Math.sin(rad(d));
          const hw = r * Math.cos(rad(d));
          return <DrawShape key={`l${d}`} shape={<line x1={cx - hw} y1={y} x2={cx + hw} y2={y} />} p={draw(frame, at + 6 + i * 2, 14)} sw={d === 0 ? 2 : 1.5} dash={d === 0 ? undefined : '6 9'} />;
        })}
        {pin && (
          <>
            <circle cx={px} cy={py} r={34 * ps} fill="none" stroke={SPEC.accent} strokeWidth={2.5} strokeDasharray="5 6" />
            <circle cx={px} cy={py} r={13 * ps} fill={SPEC.accent} />
          </>
        )}
      </Frame>
      {pin?.label && (
        <div style={{position: 'absolute', left: px + 50, top: py - 22, fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: '0.06em', color: SPEC.ink, background: SPEC.bg, padding: '4px 10px', opacity: clamp01(enter(frame, pin.at + 6) * 3)}}>
          {pin.label}
        </div>
      )}
    </>
  );
};

// Boxes joined by dashed lines, top to bottom, each with a numbered badge.
export const FlowChart: React.FC<{steps: {text: string; at: number}[]; top: number; width?: number; boxH?: number; gap?: number}> = ({steps, top, width = 640, boxH = 124, gap = 92}) => {
  const frame = useCurrentFrame();
  const x = 540 - width / 2;
  return (
    <>
      <Frame>
        {steps.slice(1).map((st, i) => {
          const y1 = top + i * (boxH + gap) + boxH;
          const y2 = y1 + gap;
          const p = draw(frame, st.at - 8, 10);
          return (
            <g key={i}>
              <DrawShape shape={<line x1={540} y1={y1} x2={540} y2={y2 - 6} />} p={p} sw={2.5} dash="7 9" />
              <path d={`M${528},${y2 - 18} L540,${y2 - 4} L${552},${y2 - 18}`} fill="none" stroke={SPEC.ink} strokeWidth={2.5} opacity={p > 0.95 ? 1 : 0} />
            </g>
          );
        })}
      </Frame>
      {steps.map((st, i) => {
        const s = enter(frame, st.at);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: top + i * (boxH + gap), width, height: boxH, opacity: clamp01(s * 3), transform: `scale(${0.9 + 0.1 * s})`}}>
            <div style={{position: 'absolute', inset: 0, border: `3px solid ${SPEC.ink}`, borderRadius: 8, background: SPEC.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 36, letterSpacing: '0.06em', color: SPEC.ink, textTransform: 'uppercase'}}>
              {st.text}
            </div>
            <Badge n={i + 1} at={st.at + 3} size={58} x={0} y={0} />
          </div>
        );
      })}
    </>
  );
};

export type DeviceKind = 'phone' | 'tablet' | 'laptop' | 'watch' | 'tv' | 'console';
const deviceShapes = (k: DeviceKind, cx: number, cy: number): React.ReactElement[] => {
  const rr = (w: number, h: number, r: number, dy = 0) => <rect x={cx - w / 2} y={cy - h / 2 + dy} width={w} height={h} rx={r} />;
  switch (k) {
    case 'phone': return [rr(92, 176, 16), <line x1={cx - 14} y1={cy - 74} x2={cx + 14} y2={cy - 74} />];
    case 'tablet': return [rr(150, 196, 14), <circle cx={cx} cy={cy + 84} r={4} />];
    case 'laptop': return [rr(176, 112, 8, -14), <path d={`M${cx - 106},${cy + 58} L${cx + 106},${cy + 58} L${cx + 90},${cy + 44} L${cx - 90},${cy + 44} Z`} />];
    case 'watch': return [rr(82, 96, 20), <path d={`M${cx - 26},${cy - 48} L${cx - 22},${cy - 86} L${cx + 22},${cy - 86} L${cx + 26},${cy - 48}`} />, <path d={`M${cx - 26},${cy + 48} L${cx - 22},${cy + 86} L${cx + 22},${cy + 86} L${cx + 26},${cy + 48}`} />];
    case 'tv': return [rr(196, 120, 6, -12), <path d={`M${cx - 40},${cy + 74} L${cx + 40},${cy + 74} M${cx},${cy + 48} L${cx},${cy + 74}`} />];
    case 'console': return [rr(196, 96, 30), <circle cx={cx - 54} cy={cy} r={16} />, <circle cx={cx + 54} cy={cy - 12} r={8} />, <circle cx={cx + 54} cy={cy + 14} r={8} />];
  }
};

// Outline devices; each one gets a checkmark (works) or a strike (doesn't) on its cue.
export const DeviceRow: React.FC<{devices: {kind: DeviceKind; label?: string; ok: boolean; at: number}[]; at: number; top: number}> = ({devices, at, top}) => {
  const frame = useCurrentFrame();
  const cell = 960 / devices.length;
  const cy = top + 140;
  const z = Math.min(1.3, (cell - 40) / 212); // bigger to read on a phone, but the widest icon (laptop, 212 px) keeps 40 px clear
  return (
    <>
      <Frame>
        {devices.map((d, i) => {
          const cx = 60 + cell * (i + 0.5);
          const p = draw(frame, at + i * 3, 16);
          const m = draw(frame, d.at, 8);
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`}>
              {deviceShapes(d.kind, cx, cy).map((sh, k) => <DrawShape key={k} shape={sh} p={p} sw={3} />)}
              {d.ok ? (
                <>
                  <circle cx={cx + 52} cy={cy - 80} r={30 * enter(frame, d.at)} fill={SPEC.accent} />
                  <DrawShape shape={<path d={`M${cx + 39},${cy - 80} L${cx + 49},${cy - 70} L${cx + 66},${cy - 91}`} />} p={m} stroke="#fff" sw={5} />
                </>
              ) : (
                <DrawShape shape={<line x1={cx - 70} y1={cy + 80} x2={cx + 70} y2={cy - 80} />} p={m} stroke={SPEC.ink} sw={5} />
              )}
            </g>
          );
        })}
      </Frame>
      {devices.map((d, i) => (
        <div key={i} style={{position: 'absolute', left: 60 + cell * i, width: cell, top: cy + 116 * z, textAlign: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.08em', color: SPEC.ink, opacity: glide(frame, at + 10 + i * 3, 10), textDecoration: d.ok ? 'none' : 'line-through'}}>
          {(d.label ?? d.kind).toUpperCase()}
        </div>
      ))}
    </>
  );
};

// A number that counts up on a ruler. Mono, because numbers are the mono font's job.
// goal: a dashed bar for where the number is heading ("$10M by end of 2026"); the ruler then spans 0 to the goal.
export const Scale: React.FC<{to: number; from?: number; at: number; dur?: number; prefix?: string; unit?: string; decimals?: number; top: number; max?: number; size?: number; goal?: {value: number; label: string; at: number}}> = ({to, from = 0, at, dur = 22, prefix = '', unit = '', decimals = 0, top, max, size = 230, goal}) => {
  const frame = useCurrentFrame();
  const k = glide(frame, at, dur);
  const v = from + (to - from) * k;
  const span = goal?.value ?? max ?? to * 1.25;
  const s = enter(frame, at);
  return (
    <>
      <div style={{position: 'absolute', left: 60, width: 960, top, textAlign: 'center', fontFamily: F.mono, fontWeight: 700, color: SPEC.ink, opacity: clamp01(s * 3), transform: `scale(${0.85 + 0.15 * s})`}}>
        <span style={{fontSize: size, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums'}}>
          {prefix}
          {v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
        </span>
        {unit && <span style={{fontSize: 64, marginLeft: 14, letterSpacing: '0.02em'}}>{unit}</span>}
      </div>
      <Frame>
        <line x1={120} y1={top + 330} x2={960} y2={top + 330} stroke={SPEC.ink} strokeWidth={2} opacity={glide(frame, at, 8)} />
        {Array.from({length: 21}, (_, i) => (
          <line key={i} x1={120 + i * 42} y1={top + 330} x2={120 + i * 42} y2={top + 330 - (i % 5 === 0 ? 26 : 12)} stroke={SPEC.ink} strokeWidth={2} opacity={glide(frame, at + i * 0.6, 6)} />
        ))}
        <rect x={120} y={top + 338} width={840 * Math.min(1, v / span)} height={10} fill={SPEC.accent} />
        {goal && <DrawShape shape={<rect x={120} y={top + 336} width={840} height={14} />} p={draw(frame, goal.at, 18)} sw={2} dash="6 7" />}
      </Frame>
      {goal && (
        <div style={{position: 'absolute', right: 120, top: top + 372, fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: '0.06em', color: SPEC.ink, opacity: glide(frame, goal.at + 10, 10)}}>
          {goal.label.toUpperCase()}
        </div>
      )}
    </>
  );
};

// Product image (transparent PNG / WebM cut-out), or a labeled slot when the asset is not in yet.
// Never fill a slot with a generated product render: ask for the real cut-out.
export const Cutout: React.FC<{src: string | null; w: number; h: number; label?: string; sub?: string; at?: number; float?: boolean; round?: boolean}> = ({src, w, h, label = 'PRODUCT CUTOUT', sub = 'transparent PNG / WebM', at = 0, float = true, round = false}) => {
  const frame = useCurrentFrame();
  const bob = float ? Math.sin((frame / FPS) * 2.1) * 7 : 0;
  const box: React.CSSProperties = {width: w, height: h, transform: `translateY(${bob}px)`, position: 'relative'};
  if (src) {
    const media: React.CSSProperties = {width: '100%', height: '100%', objectFit: round ? 'cover' : 'contain', borderRadius: round ? '50%' : 0};
    return <div style={box}>{/\.(webm|mov|mp4)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} transparent muted style={media} /> : <Img src={staticFile(src)} style={media} />}</div>;
  }
  const r = Math.min(w, h) / 2 - 8;
  const p = draw(frame, at, 16);
  const br = 38; // corner bracket length
  return (
    <div style={box}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <DrawShape shape={<circle cx={w / 2} cy={h / 2} r={r} />} p={p} stroke={SPEC.ink} sw={2.5} dash="10 12" />
        <path d={`M${w / 2 - 22},${h / 2} L${w / 2 + 22},${h / 2} M${w / 2},${h / 2 - 22} L${w / 2},${h / 2 + 22}`} stroke={SPEC.accent} strokeWidth={3} opacity={p} />
        {!round && (
          <path d={`M0,${br} L0,0 L${br},0 M${w - br},0 L${w},0 L${w},${br} M${w},${h - br} L${w},${h} L${w - br},${h} M${br},${h} L0,${h} L0,${h - br}`} fill="none" stroke={SPEC.ink} strokeWidth={2.5} opacity={p} />
        )}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 + 40, textAlign: 'center', fontFamily: F.mono, color: SPEC.ink, opacity: p}}>
        <div style={{fontSize: Math.max(18, Math.min(28, w / 16)), fontWeight: 700, letterSpacing: '0.1em'}}>{label}</div>
        <div style={{fontSize: Math.max(15, Math.min(21, w / 22)), fontWeight: 400, letterSpacing: '0.04em', opacity: 0.6, marginTop: 6}}>{sub}</div>
      </div>
    </div>
  );
};

// Outlined name tags in a centred row (investors, customers). Each pops on its cue.
export const Chips: React.FC<{items: {text: string; at: number}[]; top: number}> = ({items, top}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, width: 960, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
      {items.map((c, i) => {
        const s = enter(frame, c.at);
        return (
          <div key={i} style={{border: `3px solid ${SPEC.ink}`, borderRadius: 8, padding: '10px 20px', fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: '0.06em', color: SPEC.ink, background: SPEC.card, opacity: clamp01(s * 3), transform: `scale(${0.8 + 0.2 * s})`}}>
            {c.text.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};

// N outline people drawn on one after another (team size).
export const PeopleRow: React.FC<{count: number; at: number; top: number}> = ({count, at, top}) => {
  const frame = useCurrentFrame();
  const gap = Math.min(170, 900 / count);
  const x0 = 540 - (gap * (count - 1)) / 2;
  return (
    <Frame>
      {Array.from({length: count}, (_, i) => {
        const cx = x0 + i * gap;
        const p = draw(frame, at + i * 4, 12);
        return (
          <g key={i}>
            <DrawShape shape={<circle cx={cx} cy={top + 40} r={34} />} p={p} sw={3.5} />
            <DrawShape shape={<path d={`M${cx - 64},${top + 170} C${cx - 64},${top + 100} ${cx + 64},${top + 100} ${cx + 64},${top + 170}`} />} p={p} sw={3.5} />
          </g>
        );
      })}
    </Frame>
  );
};

// Keep what wins, cut the rest: rows appear, their key number is circled one by one, the losers are struck
// through and thrown off the page, the winners close up and get a check.
export const cutGone = (cutAt: number, losers: number) => cutAt + 6 + losers * 2 + 12; // frame the last loser has left
export const CutList: React.FC<{items: {text: string; stat?: string; keep: boolean}[]; at: number; scanAt: number; cutAt: number; top: number}> = ({items, at, scanAt, cutAt, top}) => {
  const frame = useCurrentFrame();
  const H = 104;
  const G = 22;
  const losers = items.filter((it) => !it.keep);
  const gone = cutGone(cutAt, losers.length);
  return (
    <>
      {items.map((it, i) => {
        const s = enter(frame, at + i * 3);
        const j = losers.indexOf(it);
        const k = items.slice(0, i).filter((x) => x.keep).length; // slot once the losers are gone
        const y = it.keep ? i * (H + G) + ((k - i) * (H + G)) * glide(frame, gone - 4, 14) : i * (H + G);
        const out = j < 0 ? 0 : interpolate(frame, [cutAt + 6 + j * 2, cutAt + 18 + j * 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.55, 0, 0.75, 0.06)});
        const dir = j % 2 ? -1 : 1;
        const ring = draw(frame, scanAt + i * 4, 8);
        return (
          <div key={i} style={{position: 'absolute', left: 90, width: 900, top: top + y, height: H, opacity: clamp01(s * 3) * (1 - out), transform: `translateX(${dir * out * 1100}px) rotate(${dir * out * 10}deg) scale(${0.94 + 0.06 * s})`}}>
            <div style={{position: 'absolute', inset: 0, background: SPEC.card, borderRadius: 12, boxShadow: '0 8px 24px rgba(17,17,17,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', fontFamily: F.head, fontWeight: 800, fontSize: 34, letterSpacing: '-0.01em', color: SPEC.ink}}>
              <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600}}>{it.text}</span>
              {it.stat && (
                <span style={{position: 'relative', fontFamily: F.mono, fontWeight: 700, color: it.keep && frame >= cutAt ? SPEC.accent : SPEC.ink}}>
                  {it.stat}
                  <svg width={150} height={84} style={{position: 'absolute', left: '50%', top: '50%', marginLeft: -75, marginTop: -42, overflow: 'visible'}}>
                    <DrawShape shape={<ellipse cx={75} cy={42} rx={70} ry={36} />} p={ring * (frame >= cutAt && !it.keep ? 0 : 1)} stroke={SPEC.accent} sw={3} />
                  </svg>
                </span>
              )}
            </div>
            {!it.keep && <div style={{position: 'absolute', left: 20, right: 20, top: H / 2 - 4, height: 8, background: SPEC.accent, transformOrigin: 'left center', transform: `scaleX(${draw(frame, cutAt + j * 2, 6)})`}} />}
            {it.keep && (
              <svg width={64} height={64} style={{position: 'absolute', left: -32, top: H / 2 - 32, overflow: 'visible'}}>
                <circle cx={32} cy={32} r={28 * enter(frame, gone + 4)} fill={SPEC.accent} stroke={SPEC.bg} strokeWidth={4} />
                <DrawShape shape={<path d="M19,32 L28,41 L45,22" />} p={draw(frame, gone + 8, 8)} stroke="#fff" sw={5} />
              </svg>
            )}
          </div>
        );
      })}
    </>
  );
};

// Many companies feed one box of "what works", which feeds the answers: a moat drawn as a diagram.
export const Hub: React.FC<{nodes: {count: number; label: string; at: number}; hub: {text: string; at: number}; outputs: {text: string; at: number}[]; top: number}> = ({nodes, hub, outputs, top}) => {
  const frame = useCurrentFrame();
  const cols = 10;
  const T = 50;
  const g = 14;
  const rows = Math.ceil(nodes.count / cols);
  const gw = cols * T + (cols - 1) * g;
  const gx = 540 - gw / 2;
  const gridBottom = top + rows * (T + g) - g;
  const hubTop = gridBottom + 150;
  const hubH = 116;
  const outTop = hubTop + hubH + 120;
  const ow = 400;
  const ox = (i: number) => 540 + (i - (outputs.length - 1) / 2) * (ow + 40);
  return (
    <>
      <Frame>
        {Array.from({length: nodes.count}, (_, i) => {
          const s = enter(frame, nodes.at + ((i * 7) % nodes.count) * 0.4);
          const x = gx + (i % cols) * (T + g);
          const y = top + Math.floor(i / cols) * (T + g);
          return <rect key={i} x={x + (T / 2) * (1 - s)} y={y + (T / 2) * (1 - s)} width={T * s} height={T * s} rx={6} fill="none" stroke={SPEC.ink} strokeWidth={2.5} />;
        })}
        {[0, 2, 4, 5, 7, 9].map((c, i) => (
          <DrawShape key={c} shape={<line x1={gx + c * (T + g) + T / 2} y1={gridBottom + 72} x2={540} y2={hubTop - 6} />} /* start under the label */ p={draw(frame, hub.at - 12 + i, 12)} sw={2} dash="6 8" />
        ))}
        {outputs.map((o, i) => (
          <DrawShape key={i} shape={<line x1={540} y1={hubTop + hubH + 6} x2={ox(i)} y2={outTop - 6} />} p={draw(frame, o.at - 8, 10)} sw={2.5} dash="6 8" />
        ))}
      </Frame>
      <div style={{position: 'absolute', left: 0, width: 1080, top: gridBottom + 30, textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em', color: SPEC.ink, opacity: glide(frame, nodes.at + 12, 10)}}>
        {nodes.label.toUpperCase()}
      </div>
      <div style={{position: 'absolute', left: 540 - 280, width: 560, top: hubTop, height: hubH, background: SPEC.ink, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 34, letterSpacing: '0.06em', color: SPEC.bg, transform: `scale(${enter(frame, hub.at)})`}}>
        {hub.text.toUpperCase()}
      </div>
      {outputs.map((o, i) => {
        const s = enter(frame, o.at);
        return (
          <div key={i} style={{position: 'absolute', left: ox(i) - ow / 2, width: ow, top: outTop, height: 130, border: `3px solid ${SPEC.ink}`, borderRadius: 8, background: SPEC.card, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: '0.05em', lineHeight: 1.25, color: SPEC.ink, opacity: clamp01(s * 3), transform: `scale(${0.85 + 0.15 * s})`}}>
            {o.text.toUpperCase()}
            <Badge n={i + 1} at={o.at + 3} size={54} x={0} y={0} />
          </div>
        );
      })}
    </>
  );
};
