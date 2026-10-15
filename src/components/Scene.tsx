import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, easeIn} from '../theme';

// Shows children only inside [start, end] (frames), with a quick rise-in and a soft scale-out.
export const Scene: React.FC<{start: number; end: number; children: React.ReactNode; enter?: boolean}> = ({start, end, children, enter = true}) => {
  const frame = useCurrentFrame();
  const OUT = 7;
  if (frame < start || frame > end + OUT) return null;
  const inP = enter ? ease(frame, start, start + 9) : 1;
  const outP = easeIn(frame, end, end + OUT);
  return (
    <AbsoluteFill style={{opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 40}px) scale(${1 - outP * 0.04})`}}>
      {children}
    </AbsoluteFill>
  );
};
