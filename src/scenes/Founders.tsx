import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {Draw} from '../components/Hand';
import {fonts, pop, sec} from '../theme';

export const Founders: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const f = c.founders;
  const title = pop(frame, sec(c.sections.founders) + 2);
  const school = sec(f.schoolAt);
  const exitAt = sec(f.exit.at);
  const exit = pop(frame, exitAt);
  const stamp = pop(frame, exitAt + 16, true);

  return (
    <AbsoluteFill style={{background: c.colors.bg}}>
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: fonts.serif, fontSize: 120, color: c.colors.ink, transform: `scale(${title})`}}>
        {f.title}
      </div>
      <Draw d="M 330 375 C 450 395, 640 360, 760 380" at={sec(c.sections.founders) + 8} dur={12} color={c.colors.brand} width={8} />

      {f.people.map((p, i) => {
        const x = i === 0 ? 280 : 740;
        const s = pop(frame, sec(p.at) - 4);
        const b = pop(frame, school + i * 4, true);
        return (
          <div key={p.name} style={{position: 'absolute', left: x - 200, top: 470, width: 400, textAlign: 'center', transform: `scale(${s})`, opacity: s}}>
            <div style={{position: 'relative', width: 320, height: 320, margin: '0 auto'}}>
              <Img src={staticFile(p.photo)} style={{width: 320, height: 320, borderRadius: 160, objectFit: 'cover', border: `8px solid #fff`, boxShadow: '0 18px 40px rgba(30,30,30,0.18)'}} />
              <div
                style={{
                  position: 'absolute', right: -6, bottom: 6, background: c.colors.ink, color: '#fff', borderRadius: 16, padding: '6px 16px',
                  fontFamily: fonts.sans, fontWeight: 800, fontSize: 30,
                }}
              >
                {p.role}
              </div>
            </div>
            <div style={{fontFamily: fonts.serif, fontSize: 76, color: c.colors.ink, marginTop: 18, lineHeight: 1}}>{p.name}</div>
            <div
              style={{
                display: 'inline-block', marginTop: 16, background: p.schoolColor, color: '#fff', borderRadius: 14, padding: '8px 18px',
                fontFamily: fonts.sans, fontWeight: 800, fontSize: 30, transform: `scale(${b}) rotate(${i ? 3 : -3}deg)`,
              }}
            >
              {p.school}
            </div>
          </div>
        );
      })}

      {/* the exit: one block, last company -> acquired */}
      <div style={{position: 'absolute', left: 90, top: 1090, width: 840, opacity: exit, transform: `translateY(${(1 - exit) * 80}px)`}}>
        <div style={{background: '#fff', borderRadius: 28, padding: '26px 34px', boxShadow: '0 12px 28px rgba(30,30,30,0.12)'}}>
          <div style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 36, color: c.colors.ink, opacity: 0.75}}>{f.exit.from}</div>
          <div style={{fontFamily: fonts.serif, fontSize: 64, color: c.colors.ink, lineHeight: 1.05, marginTop: 6}}>{f.exit.to}</div>
        </div>
        <div
          style={{
            position: 'absolute', right: 30, top: -30, border: `6px solid ${c.colors.brand}`, color: c.colors.brand, borderRadius: 12,
            padding: '2px 18px', fontFamily: fonts.sans, fontWeight: 800, fontSize: 46, letterSpacing: '0.08em',
            transform: `rotate(-10deg) scale(${2 - stamp})`, opacity: stamp, background: c.colors.bg,
          }}
        >
          {f.exit.stamp}
        </div>
      </div>
    </AbsoluteFill>
  );
};
