import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {Check, Draw} from '../components/Hand';
import {ease, fonts, pop, sec} from '../theme';

export const What: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const w = c.what;
  const logo = pop(frame, sec(w.logoAt));
  const tag = pop(frame, sec(w.taglineAt));
  const firstStep = sec(w.steps[0].at);
  // Logo lockup starts centered and big, then docks at the top when the product shows up.
  const dock = ease(frame, firstStep - 4, firstStep + 10);
  const lockY = 760 - dock * 540;
  const lockS = 1 - dock * 0.52;
  const card = pop(frame, firstStep);

  return (
    <AbsoluteFill style={{background: c.colors.bg}}>
      {/* burst ring behind the logo */}
      <div
        style={{
          position: 'absolute', left: 540 - 260, top: 650 - 260, width: 520, height: 520, borderRadius: 260,
          border: `6px solid ${c.colors.brand}`, opacity: (1 - ease(frame, sec(w.logoAt), sec(w.logoAt) + 18)) * (logo > 0.01 ? 1 : 0),
          transform: `scale(${0.4 + ease(frame, sec(w.logoAt), sec(w.logoAt) + 18) * 0.9})`,
        }}
      />
      <div style={{position: 'absolute', left: 0, width: '100%', top: lockY - 200, transform: `scale(${lockS})`, transformOrigin: '50% 200px'}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, transform: `scale(${logo})`}}>
          <Img src={staticFile(c.logo)} style={{width: 170, height: 170}} />
          <span style={{fontFamily: fonts.serif, fontSize: 180, color: c.colors.ink, lineHeight: 1}}>{c.name}</span>
        </div>
        <div
          style={{
            textAlign: 'center', marginTop: 18, fontFamily: fonts.hand, fontWeight: 700, fontSize: 76,
            color: c.colors.brand, transform: `rotate(-2deg) scale(${tag})`, opacity: tag * (1 - dock),
          }}
        >
          {w.tagline}
        </div>
      </div>

      {/* product card: real screen recordings from their site */}
      <div
        style={{
          position: 'absolute', left: 90, top: 470, width: 840, height: 656, borderRadius: 34, overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(30,30,30,0.22)', transform: `translateY(${(1 - card) * 260}px) rotate(${(1 - card) * 4}deg)`,
          opacity: card > 0.01 ? 1 : 0, background: '#fff',
        }}
      >
        {w.steps.map((s, i) => {
          const start = sec(s.at);
          const end = w.steps[i + 1] ? sec(w.steps[i + 1].at) : sec(c.sections.founders) + 8;
          const slide = i === 0 ? 0 : 1 - ease(frame, start, start + 10);
          return (
            <Sequence key={s.clip} from={start - 2} durationInFrames={end - start + 12} layout="none">
              <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide * 840}px)`}}>
                <OffthreadVideo src={staticFile(s.clip)} startFrom={sec(s.skip)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s.zoom})`, transformOrigin: s.origin}} />
              </div>
            </Sequence>
          );
        })}
      </div>

      {/* step label, handwritten, sits on the card corner */}
      {w.steps.map((s, i) => {
        const start = sec(s.at);
        const end = w.steps[i + 1] ? sec(w.steps[i + 1].at) : 9999;
        if (frame < start || frame >= end) return null;
        const p = pop(frame, start + 4);
        return (
          <div
            key={s.label}
            style={{
              position: 'absolute', left: 70, top: 420, transform: `rotate(-4deg) scale(${p})`, transformOrigin: 'left center',
              background: c.colors.accent, borderRadius: 14, padding: '6px 22px 10px',
              fontFamily: fonts.hand, fontWeight: 700, fontSize: 56, color: c.colors.ink, boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            }}
          >
            {i + 1}. {s.label}
          </div>
        );
      })}

      {/* the agents, ticked off as the voice names them */}
      <div style={{position: 'absolute', left: 90, top: 1170, width: 840, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
        {w.agents.map((a) => {
          const p = pop(frame, sec(a.at) - 3, true);
          return (
            <div
              key={a.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 20, padding: '12px 20px',
                boxShadow: '0 8px 20px rgba(30,30,30,0.10)', transform: `scale(${p})`, opacity: p,
                fontFamily: fonts.sans, fontWeight: 600, fontSize: 38, color: c.colors.ink,
              }}
            >
              <div style={{width: 44, height: 44, borderRadius: 22, background: c.colors.brand, position: 'relative'}}>
                <Check at={sec(a.at) + 2} color="#fff" />
              </div>
              {a.label}
            </div>
          );
        })}
      </div>
      <Draw d="M 120 1150 C 300 1140, 700 1156, 920 1142" at={sec(w.agents[0].at) - 6} dur={10} color={c.colors.brand} width={5} />
    </AbsoluteFill>
  );
};
