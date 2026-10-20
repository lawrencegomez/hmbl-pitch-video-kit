// Spec Explainer scene types. Each type = what it draws (C) + the sounds it makes (sfx), read from the
// SAME config fields, so a sound can never drift away from the thing it belongs to.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import {Aside, Badge, Callout, Chips, CutList, Cutout, DashedCircle, DeviceKind, DrawShape, DeviceRow, FlowChart, Headline, Hub, PeopleRow, RadarGrid, Scale, SourceCard, WireGlobe, cutGone} from './parts';
import {F, SPEC, draw, enter, glide} from './theme';
import type {Cue, T} from './time';

type Asset = string | null; // a path under companies/ (the kit's public folder), or null for a labeled slot
type Head = {lines: string[]; at: Cue | Cue[]; size?: number};
type AsideCfg = {text: string; at: Cue; strikeAt?: Cue; reply?: {text: string; at: Cue}};
type Src = {source: string; quote: string; at: Cue};

export type SceneCfg = {start: Cue; tag?: string} & (
  | {type: 'hook'; product: Asset; headline: Head; pullBack?: number; figure?: string; productSize?: [number, number]} // productSize for a wide product (a UI screen); default 660 square
  | {type: 'what'; product: Asset; headline: Head; aside?: AsideCfg; callouts?: {text: string; at: Cue; side: 'left' | 'right'; y: number}[]}
  | {type: 'parts'; product: Asset; headline: Head; backdrop?: 'radar' | 'globe' | null; backdropAt?: Cue; parts: {label: string; at: Cue; x: number; y: number; side: 'left' | 'right'}[]}
  | {type: 'flow'; headline: Head; steps: {text: string; at: Cue}[]}
  | {type: 'demo'; clip: Asset; label?: string; position?: string; zoom?: number; skip?: number} // skip = seconds to start in (site clips often open on a blank frame) // position = CSS object-position, zoom scales from that point (frame a landscape clip in the portrait box)
  | {
      type: 'answer'; headline: Head; aside?: AsideCfg; source?: Src;
      devices?: {kind: DeviceKind; label?: string; ok: boolean; at: Cue}[];
      scale?: {to: number; from?: number; at: Cue; prefix?: string; unit?: string; decimals?: number; max?: number; dur?: number; size?: number; goal?: {value: number; label: string; at: Cue}};
      chips?: {text: string; at: Cue}[];
      people?: {count: number; at: Cue};
      globe?: {lat: number; lon: number; label?: string; at: Cue};
      big?: {text: string; at: Cue};
    }
  | {type: 'cut'; headline: Head; items: {text: string; stat?: string; keep: boolean}[]; itemsAt?: Cue; scanAt: Cue; cutAt: Cue; columns?: [string, string]; note?: {text: string; at: Cue}}
  | {type: 'hub'; headline: Head; nodes: {count: number; label: string; at: Cue}; hub: {text: string; at: Cue}; outputs: {text: string; at: Cue}[]; note?: {text: string; at: Cue}}
  | {type: 'founders'; headline: Head; people: {name: string; role: string; note?: string; photo: Asset; at: Cue}[]; source?: Src}
  | {type: 'end'; headline: Head; aside?: AsideCfg; sting: {at: Cue; tagline?: string}}
);

export type SpecConfig = {
  id: string;
  code: string; // HUD label, top left
  name: string; // wordmark for the logo sting when there is no logo file
  logo?: Asset;
  voice: {script: string; words?: string | null; vo?: Asset; wps?: number; fixes?: Record<string, string>};
  music?: {src: Asset; volume?: number; duck?: number};
  sfxVolume?: number;
  tail?: number;
  durationSec?: number;
  scenes: SceneCfg[];
};

export type Sfx = 'click' | 'pop' | 'whoosh' | 'blip' | 'tick' | 'check' | 'strike' | 'sting';
type SceneProps<K> = {s: K; L: (c: Cue) => number; cfg: SpecConfig};
type Def<K> = {C: React.FC<SceneProps<K>>; sfx: (s: K, t: T) => [number, Sfx][]; dark?: boolean};
type Of<N extends SceneCfg['type']> = Extract<SceneCfg, {type: N}>;

const HEAD_TOP = 220;
const ats = (h: Head, L: (c: Cue) => number) => (Array.isArray(h.at) ? h.at : [h.at]).map(L);
const headSfx = (h: Head, t: T): [number, Sfx][] => (Array.isArray(h.at) ? h.at : [h.at]).map((c) => [t(c), 'click']);
const asideSfx = (a: AsideCfg | undefined, t: T): [number, Sfx][] =>
  a ? [[t(a.at), 'blip'], ...(a.strikeAt !== undefined ? [[t(a.strikeAt), 'strike'] as [number, Sfx]] : []), ...(a.reply ? [[t(a.reply.at), 'blip'] as [number, Sfx]] : [])] : [];

const AsideBlock: React.FC<{a: AsideCfg; L: (c: Cue) => number; x: number; y: number}> = ({a, L, x, y}) => (
  <>
    <Aside text={a.text} at={L(a.at)} x={x} y={y} strikeAt={a.strikeAt !== undefined ? L(a.strikeAt) : undefined} />
    {a.reply && <Aside text={a.reply.text} at={L(a.reply.at)} x={x + 30} y={y + 92} color={SPEC.accent} tilt={4} />}
  </>
);

// 1. Hook: extreme close-up that pulls back to reveal the product, one bold claim.
const hook: Def<Of<'hook'>> = {
  C: ({s, L, cfg}) => {
    const frame = useCurrentFrame();
    const pb = Math.round((s.pullBack ?? 1.1) * FPS);
    const k = draw(frame, 8, pb); // hold the close-up, then pull back
    const [w, h] = s.productSize ?? [660, 660];
    const wide = w / h > 1.3;
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', left: 540 - w / 2, top: 950 - h / 2, transform: `scale(${3.4 - 2.4 * k})`, transformOrigin: '50% 50%'}}>
          <Cutout src={s.product} w={w} h={h} at={-16} /> {/* already on screen at frame 0: the close-up is the opening image */}
        </div>
        {wide ? (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <DrawShape shape={<rect x={540 - w / 2 - 24} y={950 - h / 2 - 24} width={w + 48} height={h + 48} rx={18} />} p={draw(frame, pb + 4, 18)} sw={2.5} dash="9 12" />
          </svg>
        ) : (
          <DashedCircle cx={540} cy={950} r={400} at={pb + 4} />
        )}
        <div style={{position: 'absolute', left: 0, width: 1080, top: wide ? 950 + h / 2 + 60 : 1374, textAlign: 'center', fontFamily: F.mono, fontSize: 24, fontWeight: 500, letterSpacing: '0.12em', color: SPEC.ink, opacity: glide(frame, pb + 8, 10)}}>
          {s.figure ?? `FIG. 01 / ${cfg.code}`}
        </div>
        <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
      </AbsoluteFill>
    );
  },
  sfx: (s, t) => [[t(s.start), 'whoosh'], ...headSfx(s.headline, t)],
};

// 2. What it is, with a playful aside.
const what: Def<Of<'what'>> = {
  C: ({s, L}) => (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 260, top: 960 - 260}}>
        <Cutout src={s.product} w={520} h={520} />
      </div>
      {(s.callouts ?? []).map((c, i) => (
        <Callout key={i} from={[c.side === 'left' ? 300 : 780, c.y]} to={[c.side === 'left' ? 70 : 1010, c.y]} text={c.text} at={L(c.at)} />
      ))}
      {s.aside && <AsideBlock a={s.aside} L={L} x={790} y={640} />}
      <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
    </AbsoluteFill>
  ),
  sfx: (s, t) => [...headSfx(s.headline, t), ...asideSfx(s.aside, t), ...(s.callouts ?? []).map((c): [number, Sfx] => [t(c.at), 'tick'])],
};

// 3a. How it works: numbered parts on the product, over a radar grid or wireframe globe.
const parts: Def<Of<'parts'>> = {
  C: ({s, L}) => {
    const cy = 980;
    const bAt = s.backdropAt !== undefined ? L(s.backdropAt) : 0;
    return (
      <AbsoluteFill>
        {s.backdrop === 'radar' && <RadarGrid cx={540} cy={cy} r={330} at={bAt} />}
        {s.backdrop === 'globe' && <WireGlobe cx={540} cy={cy} r={330} at={bAt} />}
        <div style={{position: 'absolute', left: 540 - 220, top: cy - 220}}>
          <Cutout src={s.product} w={440} h={440} float={false} />
        </div>
        {s.parts.map((p, i) => {
          const at = L(p.at);
          const x = 540 + p.x;
          const y = cy + p.y;
          return (
            <React.Fragment key={i}>
              <Callout from={[x, y]} to={[p.side === 'left' ? 70 : 1010, y]} text={p.label} at={at + 2} />
              <Badge n={i + 1} at={at} x={x} y={y} size={60} />
            </React.Fragment>
          );
        })}
        <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
      </AbsoluteFill>
    );
  },
  sfx: (s, t) => [...headSfx(s.headline, t), ...(s.backdrop && s.backdropAt !== undefined ? [[t(s.backdropAt), 'whoosh'] as [number, Sfx]] : []), ...s.parts.map((p): [number, Sfx] => [t(p.at), 'pop'])],
};

// 3b. How it works as a flowchart.
const flow: Def<Of<'flow'>> = {
  C: ({s, L}) => (
    <AbsoluteFill>
      <FlowChart steps={s.steps.map((st) => ({text: st.text, at: L(st.at)}))} top={560} />
      <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
    </AbsoluteFill>
  ),
  sfx: (s, t) => [...headSfx(s.headline, t), ...s.steps.map((st): [number, Sfx] => [t(st.at), 'pop'])],
};

// 4. Payoff: stop talking, let the demo play on charcoal.
const demo: Def<Of<'demo'>> = {
  dark: true,
  C: ({s}) => {
    const frame = useCurrentFrame();
    const W = 900;
    const H = 1180;
    const br = 44;
    return (
      <AbsoluteFill style={{background: SPEC.dark}}>
        <div style={{position: 'absolute', left: 540 - W / 2, top: 240, width: W, height: H, overflow: 'hidden', borderRadius: 6}}>
          {s.clip ? (
            <OffthreadVideo src={staticFile(s.clip)} startFrom={Math.round((s.skip ?? 0) * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.position ?? '50% 50%', transform: `scale(${s.zoom ?? 1})`, transformOrigin: s.position ?? '50% 50%'}} />
          ) : (
            <div style={{position: 'absolute', inset: 0, border: `2.5px dashed rgba(234,229,219,0.5)`, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, color: SPEC.bg}}>
              <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.1em'}}>DEMO FOOTAGE</div>
              <div style={{fontSize: 21, opacity: 0.6, marginTop: 8}}>the product doing its thing, real footage only</div>
            </div>
          )}
        </div>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path
            d={`M${540 - W / 2 - 20},${240 + br} l0,${-br - 20} l${br + 20},0 M${540 + W / 2 - br},220 l${br + 20},0 l0,${br + 20} M${540 + W / 2 + 20},${240 + H - br} l0,${br + 20} l${-br - 20},0 M${540 - W / 2 + br},${240 + H + 20} l${-br - 20},0 l0,${-br - 20}`}
            fill="none" stroke={SPEC.bg} strokeWidth={3}
          />
        </svg>
        <div style={{position: 'absolute', left: 540 - W / 2, top: 240 + H + 50, display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.mono, fontSize: 28, fontWeight: 700, letterSpacing: '0.12em', color: SPEC.bg}}>
          <div style={{width: 16, height: 16, borderRadius: 16, background: SPEC.accent, opacity: Math.floor(frame / 15) % 2 ? 0.35 : 1}} />
          {(s.label ?? 'Watch this').toUpperCase()}
        </div>
      </AbsoluteFill>
    );
  },
  sfx: (s, t) => [[t(s.start), 'whoosh']],
};

// 5. Rapid answers: one question per scene, the answer drawn, a SourceCard backing it.
const answer: Def<Of<'answer'>> = {
  C: ({s, L}) => (
    <AbsoluteFill>
      {s.devices && <DeviceRow devices={s.devices.map((d) => ({...d, at: L(d.at)}))} at={L(s.start) + 4} top={600} />}
      {s.scale && <Scale {...s.scale} at={L(s.scale.at)} top={560} goal={s.scale.goal && {...s.scale.goal, at: L(s.scale.goal.at)}} />}
      {s.chips && <Chips items={s.chips.map((c) => ({...c, at: L(c.at)}))} top={s.scale ? 975 : 700} />}
      {s.people && <PeopleRow count={s.people.count} at={L(s.people.at)} top={540} />}
      {s.globe && <WireGlobe cx={540} cy={s.people ? 1040 : 820} r={s.people ? 200 : 250} at={L(s.start) + 2} pin={{...s.globe, at: L(s.globe.at)}} />}
      {s.big && (
        <div style={{position: 'absolute', left: 60, width: 960, top: 640, textAlign: 'center'}}>
          <BigWord text={s.big.text} at={L(s.big.at)} />
        </div>
      )}
      {s.aside && <AsideBlock a={s.aside} L={L} x={800} y={1050} />}
      {s.source && <SourceCard source={s.source.source} quote={s.source.quote} at={L(s.source.at)} top={1130} />}
      <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
    </AbsoluteFill>
  ),
  sfx: (s, t) => [
    ...headSfx(s.headline, t),
    ...(s.devices ?? []).map((d): [number, Sfx] => [t(d.at), d.ok ? 'check' : 'strike']),
    ...(s.scale ? [[t(s.scale.at), 'tick'] as [number, Sfx]] : []),
    ...(s.globe ? [[t(s.globe.at), 'pop'] as [number, Sfx]] : []),
    ...(s.scale?.goal ? [[t(s.scale.goal.at), 'whoosh'] as [number, Sfx]] : []),
    ...(s.chips ?? []).map((c): [number, Sfx] => [t(c.at), 'pop']),
    ...(s.people ? [[t(s.people.at), 'pop'] as [number, Sfx]] : []),
    ...(s.big ? [[t(s.big.at), 'pop'] as [number, Sfx]] : []),
    ...asideSfx(s.aside, t),
    ...(s.source ? [[t(s.source.at), 'pop'] as [number, Sfx]] : []),
  ],
};

const BigWord: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  const s = enter(frame, at);
  return <span style={{display: 'inline-block', fontFamily: F.head, fontWeight: 900, fontSize: 220, letterSpacing: '-0.04em', color: SPEC.accent, transform: `scale(${s})`, textTransform: 'uppercase'}}>{text}</span>;
};

const Note: React.FC<{text: string; at: number; top: number}> = ({text, at, top}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: 60, width: 960, top, textAlign: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: 25, letterSpacing: '0.08em', color: 'rgba(17,17,17,0.72)', opacity: glide(frame, at, 10), textTransform: 'uppercase'}}>{text}</div>;
};

// Keep what wins, cut the rest (an animation of taking things away, his 2026-10-19 ask): rows, their key number
// circled, losers struck and thrown off, winners close up with a check.
const cut: Def<Of<'cut'>> = {
  C: ({s, L}) => {
    const keeps = s.items.filter((it) => it.keep).length;
    return (
      <AbsoluteFill>
        {s.columns && (
          <div style={{position: 'absolute', left: 124, right: 124, top: 494, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.12em', color: 'rgba(17,17,17,0.6)'}}>
            <span>{s.columns[0].toUpperCase()}</span>
            <span>{s.columns[1].toUpperCase()}</span>
          </div>
        )}
        <CutList items={s.items} at={s.itemsAt !== undefined ? L(s.itemsAt) : 2} scanAt={L(s.scanAt)} cutAt={L(s.cutAt)} top={540} />
        {s.note && <Note text={s.note.text} at={L(s.note.at)} top={540 + keeps * 126 + 40} />}
        <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
      </AbsoluteFill>
    );
  },
  sfx: (s, t) => {
    const cutAt = t(s.cutAt);
    return [
      ...headSfx(s.headline, t),
      [s.itemsAt !== undefined ? t(s.itemsAt) : t(s.start) + 2, 'click'],
      [t(s.scanAt), 'tick'],
      [cutAt, 'strike'],
      [cutAt + 6, 'whoosh'],
      [cutGone(cutAt, s.items.filter((it) => !it.keep).length) + 6, 'check'],
      ...(s.note ? [[t(s.note.at), 'blip'] as [number, Sfx]] : []),
    ];
  },
};

// Their edge (the moat slide every pitch video gets, his 2026-10-19 ask): many companies feed one box of what
// works, which feeds what the customer gets. An optional note names the alternatives candidates already know.
const hub: Def<Of<'hub'>> = {
  C: ({s, L}) => (
    <AbsoluteFill>
      <Hub nodes={{...s.nodes, at: L(s.nodes.at)}} hub={{...s.hub, at: L(s.hub.at)}} outputs={s.outputs.map((o) => ({...o, at: L(o.at)}))} top={520} />
      {s.note && <Note text={s.note.text} at={L(s.note.at)} top={1330} />}
      <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
    </AbsoluteFill>
  ),
  sfx: (s, t) => [
    ...headSfx(s.headline, t),
    [t(s.nodes.at), 'pop'],
    [t(s.hub.at) - 12, 'whoosh'],
    [t(s.hub.at), 'pop'],
    ...s.outputs.map((o): [number, Sfx] => [t(o.at), 'pop']),
    ...(s.note ? [[t(s.note.at), 'blip'] as [number, Sfx]] : []),
  ],
};

// Pitch-video beat: founders in dashed rings. Real photos only; null = a labeled slot, never a generated face.
const founders: Def<Of<'founders'>> = {
  C: ({s, L}) => {
    const frame = useCurrentFrame();
    const n = s.people.length;
    const cell = 960 / n;
    const d = Math.min(300, cell - 60);
    return (
      <AbsoluteFill>
        {s.people.map((p, i) => {
          const at = L(p.at);
          const cx = 60 + cell * (i + 0.5);
          const k = enter(frame, at);
          return (
            <React.Fragment key={i}>
              <DashedCircle cx={cx} cy={760} r={d / 2 + 22} at={at} dur={14} />
              <div style={{position: 'absolute', left: cx - d / 2, top: 760 - d / 2, opacity: Math.min(1, k * 3), transform: `scale(${0.85 + 0.15 * k})`}}>
                <Cutout src={p.photo} w={d} h={d} round float={false} label="FOUNDER PHOTO" sub="real photo only" at={at} />
              </div>
              <Badge n={i + 1} at={at + 4} x={cx - d / 2 - 2} y={760 - d / 2 + 8} size={56} />
              <div style={{position: 'absolute', left: cx - cell / 2, width: cell, top: 760 + d / 2 + 50, textAlign: 'center', opacity: glide(frame, at + 6, 10)}}>
                <div style={{fontFamily: F.head, fontWeight: 900, fontSize: 46, letterSpacing: '-0.02em', color: SPEC.ink, textTransform: 'uppercase'}}>{p.name}</div>
                <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: '0.08em', color: SPEC.accent, marginTop: 8}}>{p.role.toUpperCase()}</div>
                {p.note && <div style={{fontFamily: F.mono, fontSize: 23, color: 'rgba(17,17,17,0.65)', marginTop: 8}}>{p.note}</div>}
              </div>
            </React.Fragment>
          );
        })}
        {s.source && <SourceCard source={s.source.source} quote={s.source.quote} at={L(s.source.at)} top={1180} />}
        <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={HEAD_TOP} size={s.headline.size} />
      </AbsoluteFill>
    );
  },
  sfx: (s, t) => [...headSfx(s.headline, t), ...s.people.map((p): [number, Sfx] => [t(p.at), 'pop']), ...(s.source ? [[t(s.source.at), 'pop'] as [number, Sfx]] : [])],
};

// 6. End: the question (product shorts) or "That's <Company>." (pitch videos), then the logo sting.
const end: Def<Of<'end'>> = {
  C: ({s, L, cfg}) => {
    const frame = useCurrentFrame();
    const sting = L(s.sting.at);
    if (frame < sting) {
      return (
        <AbsoluteFill>
          <Headline lines={s.headline.lines} at={ats(s.headline, L)} top={620} size={s.headline.size} />
          {s.aside && <AsideBlock a={s.aside} L={L} x={540} y={1080} />}
        </AbsoluteFill>
      );
    }
    const k = enter(frame, sting + 2);
    const dot = enter(frame, sting + 16);
    return (
      <AbsoluteFill>
        <DashedCircle cx={540} cy={880} r={320} at={sting} dur={16} />
        <div style={{position: 'absolute', left: 60, width: 960, top: 880, transform: `translateY(-50%) scale(${0.8 + 0.2 * k})`, opacity: Math.min(1, k * 3), display: 'flex', justifyContent: 'center'}}>
          {cfg.logo ? <Img src={staticFile(cfg.logo)} style={{height: 300, width: 'auto', maxWidth: 440, objectFit: 'contain'}} /> : <div style={{fontFamily: F.head, fontWeight: 900, fontSize: Math.min(110, Math.floor(500 / (cfg.name.length * 0.6))), letterSpacing: '-0.03em', color: SPEC.ink, textTransform: 'uppercase', textAlign: 'center', lineHeight: 0.95}}>{cfg.name}</div>}
        </div>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <circle cx={540 + 320 * Math.cos(-Math.PI / 4)} cy={880 + 320 * Math.sin(-Math.PI / 4)} r={20 * dot} fill={SPEC.accent} />
        </svg>
        <div style={{position: 'absolute', left: 0, width: 1080, top: 1240, textAlign: 'center', fontFamily: F.mono, fontSize: 26, fontWeight: 500, letterSpacing: '0.14em', color: SPEC.ink, opacity: draw(frame, sting + 18, 10)}}>
          {(s.sting.tagline ?? cfg.code).toUpperCase()}
        </div>
      </AbsoluteFill>
    );
  },
  sfx: (s, t) => [...headSfx(s.headline, t), ...asideSfx(s.aside, t), [t(s.sting.at), 'sting']],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Record<SceneCfg['type'], Def<any>> = {hook, what, parts, flow, demo, answer, cut, hub, founders, end};
