import React from 'react';
import {useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {ease} from '../theme';

// "Boiling line" filter: re-seeds the wobble every 4 frames so strokes look hand-drawn, not vector-perfect.
export const BoilFilter: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <filter id="boil" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={Math.floor(frame / 4)} />
        <feDisplacementMap in="SourceGraphic" scale={5} />
      </filter>
    </svg>
  );
};

type DrawProps = {
  d: string;
  at: number; // frame the stroke starts drawing
  dur?: number;
  color: string;
  width?: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  arrow?: boolean;
};

// A stroke that draws itself on, inside its own absolutely-positioned SVG.
export const Draw: React.FC<DrawProps> = ({d, at, dur = 14, color, width = 7, w = 1080, h = 1920, style, arrow}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + dur);
  if (p <= 0) return null;
  const {strokeDasharray, strokeDashoffset} = evolvePath(p, d);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
      {arrow && (
        <defs>
          <marker id={`ah-${at}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
          </marker>
        </defs>
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#boil)"
        style={{strokeDasharray, strokeDashoffset}}
        markerEnd={arrow && p > 0.97 ? `url(#ah-${at})` : undefined}
      />
    </svg>
  );
};

// Hand-drawn check inside a circle.
export const Check: React.FC<{at: number; color: string; size?: number}> = ({at, color, size = 44}) => (
  <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
    <Draw w={size} h={size} at={at} dur={8} color={color} width={size / 9} d={`M ${size * 0.2} ${size * 0.55} L ${size * 0.42} ${size * 0.75} L ${size * 0.82} ${size * 0.25}`} />
  </div>
);
