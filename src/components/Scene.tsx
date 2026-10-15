import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TornReveal} from './vox';
import {NUDGE_X, ease, easeIn} from '../theme';

// Shows children only inside [start, end] (frames), with a quick rise-in and a soft scale-out.
// torn=<paper colour>: enters as a torn-paper reveal over the previous page; pass end = next start + 12 so it stays under the reveal.
// cutOut: vanish exactly at `end` (a torn-paper wipe covers the cut; a fade would show both pages behind the sheet).
export const Scene: React.FC<{start: number; end: number; children: React.ReactNode; enter?: boolean; cutOut?: boolean; torn?: string; nudge?: boolean}> = ({start, end, children: raw, enter = true, cutOut = false, torn, nudge = true}) => {
  const frame = useCurrentFrame();
  const children = nudge ? <AbsoluteFill style={{transform: `translateX(${NUDGE_X}px)`}}>{raw}</AbsoluteFill> : raw;
  if (torn) return frame < end ? <TornReveal at={start} paper={torn} seed={`s${start}`}>{children}</TornReveal> : null;
  const OUT = cutOut ? 0 : 7;
  if (cutOut && frame >= end) return null;
  if (frame < start || frame > end + OUT) return null;
  const inP = enter ? ease(frame, start, start + 9) : 1;
  const outP = cutOut ? 0 : easeIn(frame, end, end + OUT);
  return (
    <AbsoluteFill style={{opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 40}px) scale(${1 - outP * 0.04})`}}>
      {children}
    </AbsoluteFill>
  );
};
