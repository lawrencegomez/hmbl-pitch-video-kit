import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {ease, fonts, pop, sec} from '../theme';

export const Close: React.FC<{c: Company; useClip: boolean}> = ({c, useClip}) => {
  const frame = useCurrentFrame();
  const k = c.close;
  const start = sec(k.clipStart);
  const fadeIn = ease(frame, start, start + 10);
  const lock = pop(frame, sec(k.lockupAt));
  const cta = pop(frame, sec(k.ctaAt));

  return (
    <AbsoluteFill style={{opacity: fadeIn, background: c.colors.bg}}>
      {useClip ? (
        <Sequence from={start} layout="none">
          <OffthreadVideo src={staticFile(k.clip)} startFrom={sec(k.clipSkip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
      ) : (
        <AbsoluteFill style={{transform: `scale(${1 + (frame - start) * 0.0012})`}}>
          <Img src={staticFile(k.still)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', top: 250, left: 120, width: 840, padding: '36px 0 40px', borderRadius: 40, background: 'rgba(254,246,235,0.86)', backdropFilter: 'blur(10px)', textAlign: 'center', transform: `translateY(${(1 - lock) * 40}px)`, opacity: lock}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
          <Img src={staticFile(c.logo)} style={{width: 150, height: 150}} />
          <span style={{fontFamily: fonts.serif, fontSize: 170, color: c.colors.ink, lineHeight: 1}}>{c.name}</span>
        </div>
        {k.cta && (
          <div
          style={{
            display: 'inline-block', marginTop: 40, background: c.colors.brand, color: '#fff', borderRadius: 999, padding: '18px 40px',
            fontFamily: fonts.sans, fontWeight: 800, fontSize: 48, transform: `scale(${cta})`, boxShadow: '0 12px 28px rgba(229,79,35,0.35)',
          }}
        >
          {k.cta}
        </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
