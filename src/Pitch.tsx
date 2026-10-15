import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Company} from './types';
import {Captions} from './components/Captions';
import {BoilFilter} from './components/Hand';
import {Scene} from './components/Scene';
import {VoxFounders, VoxTraction, VoxWhat, VoxWhy} from './scenes/VoxScenes';
import {Drift, Grain, Paper} from './components/vox';
import {Close} from './scenes/Close';
import {Founders} from './scenes/Founders';
import {Hook} from './scenes/Hook';
import {Traction} from './scenes/Traction';
import {What} from './scenes/What';
import {Why} from './scenes/Why';
import {sec} from './theme';

export type PitchProps = {c: Company; useClip: boolean};

export const Pitch: React.FC<PitchProps> = ({c, useClip}) => {
  const {durationInFrames} = useVideoConfig();
  const s = c.sections;
  return (
    <AbsoluteFill style={{background: c.colors.bg}}>
      <BoilFilter />
      {c.vox?.paper && <Paper color={c.colors.bg} />}
      <Scene start={0} end={sec(s.what) + (c.vox?.full ? 12 : 0)} enter={false} cutOut={!!c.vox?.full}><Hook c={c} /></Scene>
      <Scene start={sec(s.what)} end={sec(s.founders) + (c.vox?.full ? 12 : 0)} torn={c.vox?.full ? c.colors.bg : undefined}>{c.vox?.drift ? <Drift depth={0.3} from={sec(s.what)} push={0.03} slide={false}>{c.vox?.full ? <VoxWhat c={c} /> : <What c={c} />}</Drift> : (c.vox?.full ? <VoxWhat c={c} /> : <What c={c} />)}</Scene>
      <Scene start={sec(s.founders)} end={sec(s.why) + (c.vox?.full ? 12 : 0)} torn={c.vox?.full ? c.colors.bg : undefined}>{c.vox?.drift ? <Drift depth={0.3} from={sec(s.founders)} push={0.03} slide={false}>{c.vox?.full ? <VoxFounders c={c} /> : <Founders c={c} />}</Drift> : (c.vox?.full ? <VoxFounders c={c} /> : <Founders c={c} />)}</Scene>
      <Scene start={sec(s.why)} end={sec(s.traction) + (c.vox?.full ? 12 : 0)} torn={c.vox?.full ? c.colors.bg : undefined}>{c.vox?.drift ? <Drift depth={0.3} from={sec(s.why)} push={0.03} slide={false}>{c.vox?.full ? <VoxWhy c={c} /> : <Why c={c} />}</Drift> : (c.vox?.full ? <VoxWhy c={c} /> : <Why c={c} />)}</Scene>
      <Scene start={sec(s.traction)} end={sec(c.close.clipStart) + 8} torn={c.vox?.full ? c.colors.bg : undefined}>{c.vox?.drift ? <Drift depth={0.3} from={sec(s.traction)} push={0.03} slide={false}>{c.vox?.full ? <VoxTraction c={c} /> : <Traction c={c} />}</Drift> : (c.vox?.full ? <VoxTraction c={c} /> : <Traction c={c} />)}</Scene>
      <Scene start={sec(c.close.clipStart)} end={durationInFrames} enter={false}><Close c={c} useClip={useClip} /></Scene>

      <Captions tokens={c.words} fixes={c.captionFixes} lines={c.captionLines} ink={c.colors.ink} hi={c.colors.accent} y={1470} hideFrom={sec(c.sections.close)} />

      {c.vox?.grain && <Grain opacity={c.vox.full ? 0.26 : 0.16} />}
      <Audio src={staticFile(c.audio.vo)} />
      <Audio
        src={staticFile(c.audio.music)}
        volume={(f) => interpolate(f, [0, 10, durationInFrames - 45, durationInFrames - 2], [0, c.audio.musicVolume, c.audio.musicVolume, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
