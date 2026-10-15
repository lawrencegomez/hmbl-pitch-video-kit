import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Company} from './types';
import {Captions} from './components/Captions';
import {BoilFilter} from './components/Hand';
import {Scene} from './components/Scene';
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
      <Scene start={0} end={sec(s.what)} enter={false}><Hook c={c} /></Scene>
      <Scene start={sec(s.what)} end={sec(s.founders)}><What c={c} /></Scene>
      <Scene start={sec(s.founders)} end={sec(s.why)}><Founders c={c} /></Scene>
      <Scene start={sec(s.why)} end={sec(s.traction)}><Why c={c} /></Scene>
      <Scene start={sec(s.traction)} end={sec(c.close.clipStart) + 8}><Traction c={c} /></Scene>
      <Scene start={sec(c.close.clipStart)} end={durationInFrames} enter={false}><Close c={c} useClip={useClip} /></Scene>

      <Captions tokens={c.words} fixes={c.captionFixes} lines={c.captionLines} ink={c.colors.ink} hi={c.colors.accent} y={1470} hideFrom={sec(c.sections.close)} />

      <Audio src={staticFile(c.audio.vo)} />
      <Audio
        src={staticFile(c.audio.music)}
        volume={(f) => interpolate(f, [0, 10, durationInFrames - 45, durationInFrames - 2], [0, c.audio.musicVolume, c.audio.musicVolume, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
