import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {Check, Draw} from '../components/Hand';
import {ease, fonts, pop, sec} from '../theme';
import {Clipping, HighlightBox} from '../components/vox';

// Customer graph: the company in the middle, customers around it, plays flowing back.
const NODES = Array.from({length: 8}, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return [540 + Math.cos(a) * 300, 860 + Math.sin(a) * 250] as const;
});

export const Why: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const y = c.why;
  const t = pop(frame, sec(y.titleAt) - 2);
  const graphAt = sec(y.graphAt);
  const playsAt = sec(y.playsAt);
  const winAt = sec(y.winAt);
  const dockTitle = ease(frame, graphAt - 6, graphAt + 8);
  const graphOut = ease(frame, playsAt - 2, playsAt + 10);

  return (
    <AbsoluteFill style={{background: c.vox?.paper ? 'transparent' : c.colors.bg}}>
      <div style={{position: 'absolute', width: '100%', top: 470 - dockTitle * 240, textAlign: 'center', transform: `scale(${t * (1 - dockTitle * 0.45)})`}}>
        <div style={{fontFamily: fonts.serif, fontSize: frame < playsAt - 2 ? 200 : 185, color: c.colors.ink, lineHeight: 1, whiteSpace: 'nowrap'}}>{frame < playsAt - 2 ? y.title : y.moatTitle}</div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 34}}>
          {frame < playsAt - 2 && !c.vox?.postStrip && y.batches.map((b, i) => {
            const p = pop(frame, sec(y.titleAt) + 6 + i * 8, true);
            return (
              <React.Fragment key={b}>
                {i > 0 && <span style={{fontFamily: fonts.hand, fontWeight: 700, fontSize: 80, color: c.colors.ink, opacity: p}}>→</span>}
                <div style={{background: i ? '#FF6600' : c.colors.ink, color: '#fff', borderRadius: 14, padding: '10px 22px', fontFamily: fonts.sans, fontWeight: 800, fontSize: 40, transform: `scale(${p}) rotate(-3deg)`}}>
                  {b}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Vox: the founder's own public post, as a highlighted strip */}
      {c.vox?.postStrip && frame < playsAt && (() => {
        const ps = c.vox.postStrip;
        const at = sec(ps.at);
        const p = pop(frame, at);
        const w = 760, h = (w * ps.h) / ps.w;
        return (
          <div style={{opacity: 1 - dockTitle}}>
            <div style={{position: 'absolute', left: 80, top: 705, fontFamily: fonts.sans, fontWeight: 700, fontSize: 30, color: c.colors.ink, opacity: 0.6 * p, transform: 'rotate(-2deg)'}}>{ps.label}</div>
            <Clipping seed="poststrip" rotate={-2} width={832} tape={false} style={{left: 90, top: 750, opacity: p > 0.02 ? 1 : 0, transform: `rotate(-2deg) translateX(${(1 - p) * -500}px)`}}>
              <div style={{position: 'relative', width: w, height: h}}>
                <HighlightBox at={at + 10} x={0} y={4} w={w} h={h - 4} />
                <Img src={staticFile(ps.src)} style={{position: 'absolute', inset: 0, width: '100%', mixBlendMode: 'multiply'}} />
              </div>
            </Clipping>
          </div>
        );
      })()}

      {/* real photo of the founders together (e.g. a stage or team shot from their LinkedIn) */}
      {frame < playsAt && (() => {
        const p = pop(frame, sec(y.titleAt) + 10);
        return (
          <div style={{position: 'absolute', left: 120, top: c.vox?.postStrip ? 930 : 800, width: 780, padding: 14, paddingBottom: 18, background: '#fff', borderRadius: 10, boxShadow: '0 22px 50px rgba(30,30,30,0.22)', transform: `rotate(-2.5deg) translateY(${(1 - p) * 140}px) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5) * (1 - dockTitle)}}>
            <div style={{height: c.vox?.postStrip ? 370 : 430, overflow: 'hidden', borderRadius: 4}}>
              <Img src={staticFile(y.stagePhoto)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', transform: `scale(${1.04 + (frame - sec(y.titleAt)) * 0.0008})`}} />
            </div>
          </div>
        );
      })()}
      {frame >= playsAt - 2 && <Draw d="M 340 418 C 490 436, 680 402, 830 422" at={playsAt} dur={10} color={c.colors.brand} width={8} />}

      {/* graph: plays learned across customers */}
      <AbsoluteFill style={{opacity: 1 - graphOut, transform: `scale(${1 - graphOut * 0.15})`}}>
        {NODES.map(([x, yy], i) => (
          <Draw key={i} d={`M 540 860 L ${x} ${yy}`} at={graphAt + i * 2} dur={10} color={c.colors.brand} width={5} />
        ))}
        {NODES.map(([x, yy], i) => {
          const p = pop(frame, graphAt + 6 + i * 2, true);
          const pulse = 1 + Math.max(0, Math.sin((frame - graphAt - i * 5) / 5)) * 0.12;
          return <div key={i} style={{position: 'absolute', left: x - 34, top: yy - 34, width: 68, height: 68, borderRadius: 34, background: '#fff', border: `5px solid ${c.colors.ink}`, transform: `scale(${p * pulse})`}} />;
        })}
        <div style={{position: 'absolute', left: 540 - 90, top: 860 - 90, width: 180, height: 180, borderRadius: 90, background: '#fff', boxShadow: '0 14px 30px rgba(30,30,30,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(frame, graphAt)})`}}>
          <Img src={staticFile(c.logo)} style={{width: 110, height: 110}} />
        </div>
      </AbsoluteFill>

      {/* the plays: which ones win */}
      <div style={{position: 'absolute', left: 90, top: 480, width: 840, display: 'flex', flexDirection: 'column', gap: 30}}>
        {y.plays.map((p, i) => {
          const s = pop(frame, playsAt + 4 + i * 5);
          const judged = frame >= winAt + i * 3;
          return (
            <div
              key={p.text}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 26, padding: '36px 30px',
                boxShadow: '0 12px 28px rgba(30,30,30,0.12)', transform: `translateX(${(1 - s) * 300}px)`, opacity: Math.min(1, s * 1.4), color: judged && !p.win ? '#9A9A9A' : c.colors.ink,
                fontFamily: fonts.sans, fontWeight: 600, fontSize: 40, lineHeight: 1.2,
                outline: judged && p.win ? `5px solid #2FA866` : 'none',
              }}
            >
              <div style={{width: 52, height: 52, borderRadius: 26, background: judged ? (p.win ? '#2FA866' : '#BBB') : c.colors.soft, flexShrink: 0, position: 'relative'}}>
                {p.win && <Check at={winAt + i * 3} color="#fff" size={52} />}
              </div>
              {p.text}
              {!p.win && <Draw w={900} h={110} at={winAt + i * 3} dur={10} color={c.colors.brand} width={7} d="M 90 60 C 300 48, 560 70, 840 52" />}
            </div>
          );
        })}
        <div style={{alignSelf: 'flex-end', fontFamily: fonts.hand, fontWeight: 700, fontSize: 70, color: c.colors.brand, transform: `rotate(-3deg) scale(${pop(frame, winAt + 10)})`}}>
          → {y.moatNote}
        </div>
      </div>
    </AbsoluteFill>
  );
};
