// "Full Vox" versions of the middle scenes (used when a company sets vox.full). Same data and cue times as the
// plain scenes; only the look changes: torn clippings, tape, stickers, highlighter, marker, slam type, halftone.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Company} from '../types';
import {Check, Draw} from '../components/Hand';
import {Clipping, Halftone, Highlight, HighlightBox, MarkerCircle, MARKER_RED, Pin, Slam, TornReveal, Sticker, Tape, voxFonts} from '../components/vox';
import {ease, fonts, pop, sec} from '../theme';

const INK = '#141414';

// Photo print with a white border and two pieces of tape.
const Taped: React.FC<{left: number; top: number; width: number; height: number; rotate: number; p: number; children: React.ReactNode}> = ({left, top, width, height, rotate, p, children}) => (
  <div style={{position: 'absolute', left, top, width, transform: `rotate(${rotate}deg) translateY(${(1 - p) * 220}px) scale(${0.92 + 0.08 * p})`, opacity: p > 0.02 ? 1 : 0}}>
    <div style={{background: '#fff', padding: 14, boxShadow: '0 22px 40px rgba(40,25,10,0.35)'}}>
      <div style={{height, overflow: 'hidden', position: 'relative'}}>{children}</div>
    </div>
    <Tape style={{left: -30, top: -16}} rotate={-32} w={150} />
    <Tape style={{right: -30, top: -16}} rotate={30} w={150} />
  </div>
);

const Scrap: React.FC<{seed: string; left: number; top: number; rotate: number; p: number; children: React.ReactNode; width?: number}> = ({seed, left, top, rotate, p, children, width = 400}) => (
  <Clipping seed={seed} rotate={rotate} width={width} tape={false} style={{left, top, opacity: p > 0.02 ? 1 : 0, transform: `rotate(${rotate}deg) scale(${0.6 + 0.4 * p})`}}>
    {children}
  </Clipping>
);

// ---------------------------------------------------------------- what they build
export const VoxWhat: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const w = c.what;
  const logoP = pop(frame, sec(w.logoAt));
  const firstStep = sec(w.steps[0].at);
  const dock = ease(frame, firstStep - 4, firstStep + 10);
  return (
    <AbsoluteFill>
      {/* logo on a taped paper card, docks to the top when the product shows */}
      <div style={{position: 'absolute', left: 0, width: '100%', top: 560 - dock * 380, transform: `scale(${1 - dock * 0.45})`, transformOrigin: '50% 0'}}>
        <Clipping seed="logo" rotate={-2} width={760} style={{left: 160, top: 0, opacity: logoP > 0.02 ? 1 : 0, transform: `rotate(-2deg) scale(${0.7 + 0.3 * logoP})`}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20}}>
            <Img src={staticFile(c.logo)} style={{width: 140, height: 140}} />
            <span style={{fontFamily: fonts.serif, fontSize: 150, color: INK, lineHeight: 1}}>{c.name}</span>
          </div>
        </Clipping>
        <div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: voxFonts.marker, fontSize: 66, color: MARKER_RED, transform: `rotate(-3deg) scale(${pop(frame, sec(w.taglineAt))})`, opacity: 1 - dock}}>
          <Highlight at={sec(w.taglineAt) + 6}>{w.tagline}</Highlight>
        </div>
      </div>

      {/* product: their real screen recordings as a taped photo print */}
      {w.steps.map((s, i) => {
        const start = sec(s.at);
        const end = w.steps[i + 1] ? sec(w.steps[i + 1].at) : sec(c.sections.founders) + 8;
        if (frame < start - 2 || frame > end + 6) return null;
        const p = pop(frame, start);
        return (
          <React.Fragment key={s.clip}>
            <Taped left={110} top={430} width={800} height={600} rotate={i ? 2 : -2} p={p}>
              <Sequence from={start - 2} layout="none">
                <OffthreadVideo src={staticFile(s.clip)} startFrom={sec(s.skip)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s.zoom})`, transformOrigin: s.origin}} />
              </Sequence>
            </Taped>
            <div style={{position: 'absolute', left: 80, top: 385, fontFamily: voxFonts.type, fontSize: 46, color: INK, background: '#FFFDF8', padding: '6px 18px', transform: `rotate(-4deg) scale(${pop(frame, start + 4)})`, boxShadow: '0 6px 14px rgba(0,0,0,0.2)'}}>
              {i + 1}. {s.label}
            </div>
          </React.Fragment>
        );
      })}

      {/* features as paper scraps with marker ticks */}
      {w.agents.map((a, i) => {
        const p = pop(frame, sec(a.at) - 3, true);
        const left = i % 2 ? 500 : 90, top = 1110 + Math.floor(i / 2) * 120, r = [-3, 2, 2, -2][i];
        return (
          <Scrap key={a.label} seed={`feat${i}`} left={left} top={top} rotate={r} p={p} width={400}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{position: 'relative', width: 46, height: 46, flexShrink: 0}}><Check at={sec(a.at) + 2} color={MARKER_RED} size={46} /></div>
              <span style={{fontFamily: voxFonts.type, fontSize: 40, color: INK}}>{a.label}</span>
            </div>
          </Scrap>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- founders
export const VoxFounders: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const f = c.founders;
  const school = sec(f.schoolAt);
  const exitAt = sec(f.exit.at);
  const exitP = pop(frame, exitAt);
  const stamp = pop(frame, exitAt + 16, true);
  const XS = [290, 760];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 210, left: 60, width: 880, textAlign: 'center'}}>
        <Slam at={sec(c.sections.founders) + 2} size={150}><Highlight at={sec(c.sections.founders) + 10}>The founders</Highlight></Slam>
      </div>
      {f.people.map((p, i) => {
        const at = sec(p.at) - 4;
        const s = pop(frame, at);
        const b = pop(frame, school + i * 4, true);
        const sticker = c.vox?.founderStickers?.[i];
        return (
          <React.Fragment key={p.name}>
            <Halftone x={XS[i]} y={640} size={380} at={at} color={i ? '#FF6600' : MARKER_RED} />
            <div style={{position: 'absolute', left: XS[i] - 190, top: 440, width: 380, height: 380, transform: `rotate(${i ? 4 : -4}deg) translateY(${(1 - s) * 260}px)`, opacity: s > 0.02 ? 1 : 0}}>
              {sticker ? <Sticker src={sticker} style={{width: 380, height: 380, objectFit: 'contain'}} outline={10} /> : <Img src={staticFile(p.photo)} style={{width: 380, height: 380, objectFit: 'cover', border: '10px solid #fff'}} />}
            </div>
            <div style={{position: 'absolute', left: XS[i] - 200, top: 850, width: 400, textAlign: 'center', fontFamily: voxFonts.marker, fontSize: 56, color: INK, transform: `rotate(${i ? 3 : -3}deg) scale(${pop(frame, at + 6)})`}}>
              {p.name}
              <div style={{fontFamily: voxFonts.type, fontSize: 36, marginTop: 4}}>{p.role}</div>
            </div>
            <Scrap seed={`school${i}`} left={XS[i] - 190} top={985} rotate={i ? 3 : -3} p={b} width={380}>
              <div style={{fontFamily: fonts.sans, fontWeight: 800, fontSize: 30, color: p.schoolColor, textAlign: 'center'}}>{p.school}</div>
            </Scrap>
          </React.Fragment>
        );
      })}
      {/* the exit: torn clipping, highlighter, rubber stamp */}
      <Clipping seed="exit" rotate={-1.5} width={840} style={{left: 90, top: 1150, opacity: exitP > 0.02 ? 1 : 0, transform: `rotate(-1.5deg) translateY(${(1 - exitP) * 160}px)`}}>
        <div style={{fontFamily: voxFonts.type, fontSize: 32, color: '#444'}}>{f.exit.from}</div>
        <div style={{fontFamily: fonts.serif, fontSize: 64, color: INK, lineHeight: 1.05, marginTop: 6}}><Highlight at={exitAt + 10}>{f.exit.to}</Highlight></div>
      </Clipping>
      <div style={{position: 'absolute', left: 690, top: 1110, border: `7px solid ${MARKER_RED}`, color: MARKER_RED, borderRadius: 10, padding: '0 16px', fontFamily: voxFonts.slam, fontSize: 64, letterSpacing: '0.06em', transform: `rotate(-12deg) scale(${2.2 - 1.2 * stamp})`, opacity: stamp * 0.9, mixBlendMode: 'multiply'}}>
        {f.exit.stamp}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- round two + what makes it different
export const VoxWhy: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const y = c.why;
  const playsAt = sec(y.playsAt);
  const winAt = sec(y.winAt);
  const swap = ease(frame, playsAt - 6, playsAt + 4);
  const ps = c.vox?.postStrip;
  return (
    <AbsoluteFill>
      {/* round two */}
      <div style={{opacity: 1 - swap}}>
        <div style={{position: 'absolute', top: 240, left: 60, width: 880, textAlign: 'center'}}>
          <Slam at={sec(y.titleAt) - 2} size={150} style={{whiteSpace: 'nowrap'}}>Round <Highlight at={sec(y.titleAt) + 8}>two.</Highlight></Slam>
        </div>
        {ps && (() => {
          const at = sec(ps.at);
          const p = pop(frame, at);
          const w = 760, h = (w * ps.h) / ps.w;
          return (
            <>
              <div style={{position: 'absolute', left: 90, top: 480, fontFamily: voxFonts.type, fontSize: 32, color: '#333', opacity: p, transform: 'rotate(-2deg)'}}>{ps.label}</div>
              <Clipping seed="poststrip" rotate={-2} width={832} tape={false} style={{left: 90, top: 525, opacity: p > 0.02 ? 1 : 0, transform: `rotate(-2deg) translateX(${(1 - p) * -500}px)`}}>
                <div style={{position: 'relative', width: w, height: h}}>
                  <HighlightBox at={at + 10} x={0} y={4} w={w} h={h - 4} />
                  <Img src={staticFile(ps.src)} style={{position: 'absolute', inset: 0, width: '100%', mixBlendMode: 'multiply'}} />
                </div>
              </Clipping>
            </>
          );
        })()}
        <Taped left={130} top={720} width={760} height={420} rotate={2.5} p={pop(frame, sec(y.titleAt) + 10)}>
          <Img src={staticFile(y.stagePhoto)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', transform: `scale(${1.04 + (frame - sec(y.titleAt)) * 0.0008})`}} />
        </Taped>
      </div>

      {/* what makes it different: plays on paper strips, marker ticks and a scribble through the loser */}
      {frame >= playsAt - 6 && (
        <div style={{opacity: swap}}>
          <div style={{position: 'absolute', top: 230, left: 60, width: 880, textAlign: 'center'}}>
            <Slam at={playsAt - 4} size={92} style={{whiteSpace: 'nowrap'}}>{y.moatTitle}</Slam>
          </div>
          {y.plays.map((pl, i) => {
            const p = pop(frame, playsAt + 4 + i * 5);
            const judged = frame >= winAt + i * 3;
            return (
              <Clipping key={pl.text} seed={`play${i}`} rotate={[-2, 1.5, -1][i]} width={800} tape={i === 0} style={{left: 90, top: 420 + i * 235, opacity: p > 0.02 ? 1 : 0, transform: `rotate(${[-2, 1.5, -1][i]}deg) translateX(${(1 - p) * 500}px)`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                  <div style={{position: 'relative', width: 54, height: 54, flexShrink: 0}}>
                    {pl.win && <Check at={winAt + i * 3} color="#1F9D55" size={54} />}
                  </div>
                  <span style={{fontFamily: voxFonts.type, fontSize: 46, lineHeight: 1.25, color: judged && !pl.win ? '#888' : INK}}>
                    {pl.win ? <Highlight at={winAt + i * 3 + 2}>{pl.text}</Highlight> : pl.text}
                  </span>
                </div>
                {!pl.win && <Draw w={768} h={70} at={winAt + i * 3} dur={10} color={MARKER_RED} width={8} d="M 60 40 C 220 20, 420 60, 760 30" style={{left: 36, top: 30}} />}
              </Clipping>
            );
          })}
          <div style={{position: 'absolute', left: 120, top: 1150, width: 820, fontFamily: voxFonts.marker, fontSize: 72, color: MARKER_RED, transform: `rotate(-3deg) scale(${pop(frame, winAt + 10)})`}}>
            → {y.moatNote}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- traction (three full-screen phases)
// A: customers (launch clipping + stamp + logos)  B: revenue (big graph paper, logos stay)  C: funding, team, office map
export const VoxTraction: React.FC<{c: Company}> = ({c}) => {
  const frame = useCurrentFrame();
  const t = c.traction;
  const countAt = sec(t.countAt);
  const r = t.revenue;
  const revAt = sec(r.at);
  const toAt = sec(r.toAt ?? r.at + 0.8); // the big number lands when the voice says it
  const cAt = sec(t.stats[0].at);
  const toB = ease(frame, revAt - 4, revAt + 8);
  const k = c.vox?.clipping;
  const office = c.vox?.office;
  const CHART = 'M 70 560 C 300 560, 450 545, 540 430 S 680 140, 720 90';
  const push = 1 + 0.08 * ease(frame, countAt + 4, countAt + 40);
  return (
    <AbsoluteFill>
      {/* A: the launch post, pushed into */}
      {k && frame < revAt + 10 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - toB, transform: `translateY(${toB * -300}px)`}}>
          <Clipping seed="tractionclip" rotate={1.5} width={840} style={{left: 100, top: 190, opacity: pop(frame, sec(k.at)), transform: `rotate(1.5deg) scale(${(0.9 + 0.1 * pop(frame, sec(k.at))) * push})`, transformOrigin: '40% 70%'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
              <div style={{width: 40, height: 40, background: '#FF6600', color: '#fff', fontFamily: fonts.sans, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Y</div>
              <div style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 28, color: '#666'}}>{k.source}</div>
            </div>
            <div style={{fontFamily: fonts.sans, fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: INK}}>{k.title}</div>
            <div style={{fontFamily: 'Georgia, serif', fontSize: 38, lineHeight: 1.38, color: '#222', marginTop: 14}}>
              {k.before}<Highlight at={countAt + 4}>{k.highlight}</Highlight>{k.after}
            </div>
            <div style={{fontFamily: voxFonts.type, fontSize: 24, color: '#888', marginTop: 12}}>{k.url}</div>
          </Clipping>
          <div style={{position: 'absolute', left: 540, top: 720, transform: 'rotate(-8deg)'}}>
            <Slam at={countAt + 8} size={210} color={MARKER_RED}>{t.count}+</Slam>
          </div>
          <MarkerCircle at={countAt + 16} x={490} y={680} w={420} h={300} color={INK} />
        </div>
      )}

      {/* customer logos as taped labels: phase A and B */}
      <div style={{display: frame >= cAt + 12 ? 'none' : undefined}}>
        {t.logos.map((l, i) => {
          const p = pop(frame, countAt + 10 + i * 3, true);
          const left = 90 + (i % 3) * 285, top = 1010 + Math.floor(i / 3) * 150, rot = [-3, 2, -2, 3, -2, 2][i];
          return (
            <div key={l} style={{position: 'absolute', left, top, width: 260, height: 118, background: '#FFFDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${p})`, boxShadow: '0 8px 14px rgba(40,25,10,0.22)'}}>
              <Img src={staticFile(l)} style={{maxWidth: 210, maxHeight: 56, filter: 'brightness(0.2)'}} />
              <Tape style={{left: 85, top: -20}} rotate={rot * 2} w={90} />
            </div>
          );
        })}
      </div>

      {/* B: revenue, big, on graph paper */}
      {frame >= revAt - 4 && frame < cAt + 12 && (() => {
        const p = pop(frame, revAt);
        return (
          <div style={{position: 'absolute', left: 90, top: 210, width: 840, height: 740, opacity: p, transform: `rotate(-1.5deg) scale(${0.9 + 0.1 * p})`, boxShadow: '0 18px 30px rgba(40,25,10,0.3)',
            backgroundColor: '#FDFBF4', backgroundImage: 'linear-gradient(rgba(70,120,190,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(70,120,190,0.18) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            <Tape style={{left: 340, top: -20}} rotate={-3} w={170} />
            <div style={{position: 'absolute', left: 36, top: 30, fontFamily: voxFonts.type, fontSize: 48, color: INK}}>{r.title}</div>
            <Draw w={840} h={740} d={CHART} at={revAt + 4} dur={26} color={MARKER_RED} width={14} arrow />
            {r.months.map((m, i) => (
              <div key={m} style={{position: 'absolute', left: 70 + i * 300, top: 630, fontFamily: voxFonts.marker, fontSize: 40, color: '#555', opacity: ease(frame, revAt + 4 + i * 8, revAt + 10 + i * 8)}}>{m}</div>
            ))}
            <div style={{position: 'absolute', left: 60, top: 480, fontFamily: voxFonts.marker, fontSize: 64, color: INK, opacity: ease(frame, revAt + 4, revAt + 10)}}>{r.from}</div>
            <div style={{position: 'absolute', right: 50, top: 200, textAlign: 'right'}}>
              <div style={{fontFamily: voxFonts.slam, fontSize: 190, lineHeight: 1, color: MARKER_RED, transformOrigin: '70% 60%', opacity: pop(frame, toAt) > 0.02 ? 1 : 0, transform: `scale(${pop(frame, toAt)}) rotate(${(1 - pop(frame, toAt)) * -12}deg)`}}>{r.to}</div>
              <div style={{fontFamily: voxFonts.marker, fontSize: 64, color: INK, opacity: ease(frame, toAt + 24, toAt + 30)}}>{r.toLabel}</div>
            </div>
          </div>
        );
      })()}

      {/* C: funding, team, office */}
      <TornReveal at={cAt} paper={c.colors.bg} seed="phaseC">{(() => {
        const [money, team] = t.stats;
        const pm = pop(frame, cAt);
        const pt = pop(frame, sec(team.at));
        return (
          <>
            <Clipping seed="money" rotate={-1.5} width={840} tape={false} style={{left: 90, top: 200, opacity: pm > 0.02 ? 1 : 0, transform: `rotate(-1.5deg) translateX(${(1 - pm) * -600}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
                <div style={{fontFamily: voxFonts.slam, fontSize: 130, lineHeight: 1, color: INK, opacity: pop(frame, sec(money.revealAt ?? money.at)) > 0.02 ? 1 : 0, transform: `scale(${pop(frame, sec(money.revealAt ?? money.at))})`}}>{money.big}</div>
                <div style={{fontFamily: voxFonts.type, fontSize: 38, lineHeight: 1.2, color: '#222'}}>{money.small}</div>
              </div>
            </Clipping>
            <Clipping seed="team" rotate={1.5} width={840} tape={false} style={{left: 90, top: 440, opacity: pt > 0.02 ? 1 : 0, transform: `rotate(1.5deg) translateX(${(1 - pt) * 600}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                <div style={{fontFamily: voxFonts.slam, fontSize: 130, lineHeight: 1, color: MARKER_RED}}><Highlight at={sec(team.at) + 6}>{team.big}</Highlight></div>
                <div style={{fontFamily: voxFonts.type, fontSize: 38, lineHeight: 1.2, color: '#222'}}>{team.small}</div>
                <svg width={300} height={110} viewBox="0 0 300 110" style={{marginLeft: 'auto'}}>
                  {Array.from({length: Number(team.big) || 0}, (_, j) => {
                    const x = 30 + j * 60;
                    const on = pop(frame, sec(team.at) + 8 + j * 3, true);
                    return (
                      <g key={j} transform={`translate(${x} ${110 - 110 * on}) `} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={on}>
                        <circle cx={0} cy={22} r={13} />
                        <path d="M 0 36 L 0 72 M -20 52 L 20 52 M 0 72 L -16 100 M 0 72 L 16 100" />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </Clipping>
            {office && (() => {
              const po = pop(frame, sec(t.stats[1].at) + 6);
              const W = 840, H = 640, sc = 1.2;
              const ox = W / 2 - office.pin[0] * sc, oy = H / 2 - office.pin[1] * sc;
              return (
                <div style={{position: 'absolute', left: 90, top: 690, width: W, opacity: po > 0.02 ? 1 : 0, transform: `rotate(-1deg) translateY(${(1 - po) * 300}px)`}}>
                  <div style={{background: '#fff', padding: 14, boxShadow: '0 22px 40px rgba(40,25,10,0.35)'}}>
                    <div style={{position: 'relative', height: H, overflow: 'hidden'}}>
                      <Img src={staticFile(office.map)} style={{position: 'absolute', left: ox, top: oy, width: office.mapW * sc, transform: `scale(${1 + 0.06 * ease(frame, sec(office.at), sec(office.at) + 60)})`, transformOrigin: `${office.pin[0] * sc}px ${office.pin[1] * sc}px`}} />
                      <Halftone x={W / 2} y={H / 2} size={240} at={sec(office.at)} color={MARKER_RED} />
                      <Pin x={W / 2} y={H / 2} at={sec(office.at)} />
                      <div style={{position: 'absolute', left: W / 2 + 50, top: H / 2 - 150, fontFamily: voxFonts.marker, fontSize: 52, color: INK, background: '#FFFDF8', padding: '4px 16px', transform: `rotate(-4deg) scale(${pop(frame, sec(office.at) + 8)})`, boxShadow: '0 6px 12px rgba(0,0,0,0.2)'}}>{office.label}</div>
                      <div style={{position: 'absolute', right: 8, bottom: 6, fontFamily: fonts.sans, fontSize: 18, color: '#555', background: 'rgba(255,255,255,0.8)', padding: '2px 6px'}}>{office.credit}</div>
                    </div>
                  </div>
                  <Tape style={{left: -30, top: -16}} rotate={-32} w={150} />
                  <Tape style={{right: -30, top: -16}} rotate={30} w={150} />
                </div>
              );
            })()}
          </>
        );
      })()}</TornReveal>
    </AbsoluteFill>
  );
};
