// Spec Explainer: a JSON config in, a 1080x1920 30 fps video out. See src/spec/README.md.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, toWords} from '../components/Captions';
import {FPS} from '../theme';
import {Hud} from './parts';
import {SCENES, Sfx, SpecConfig} from './scenes';
import {SPEC} from './theme';
import {Token, duckedVolume, estimateTokens, makeT, phraseLines, speakingRuns} from './time';

export type SpecProps = {cfg: SpecConfig; tokens: Token[]};

// Per-sound loudness before the config's sfxVolume. Kept low: the sounds sit under the voice.
const GAIN: Record<Sfx, number> = {click: 0.5, pop: 0.45, whoosh: 0.35, blip: 0.4, tick: 0.45, check: 0.35, strike: 0.45, sting: 0.6};

// Real word timings when the config names a words file; otherwise estimated from the script.
export const specMetadata: CalculateMetadataFunction<SpecProps> = async ({props}) => {
  const v = props.cfg.voice;
  const tokens: Token[] = v.words ? await fetch(staticFile(v.words)).then((r) => r.json()) : estimateTokens(v.script, v.wps);
  const spoken = toWords(tokens, {}); // drops whisper's [BLANK_AUDIO] marker, which can run seconds past the last word
  const lastWord = spoken.length ? spoken[spoken.length - 1].end / 1000 : 0;
  return {durationInFrames: Math.round((props.cfg.durationSec ?? lastWord + (props.cfg.tail ?? 3.2)) * FPS), props: {...props, tokens}};
};

export const SpecExplainer: React.FC<SpecProps> = ({cfg, tokens}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = useMemo(() => makeT(tokens), [tokens]);
  const starts = cfg.scenes.map((s) => t(s.start));
  starts.forEach((f, i) => {
    if (i && f <= starts[i - 1]) throw new Error(`Scene ${i + 1} (${cfg.scenes[i].type}) starts before scene ${i} ends: put the scenes in spoken order`);
  });
  const ends = starts.map((_, i) => starts[i + 1] ?? durationInFrames);

  // The one cue list every sound effect fires from. Two sounds closer than 3 frames: keep the first.
  const cues = useMemo(() => {
    const all = cfg.scenes.flatMap((s) => SCENES[s.type].sfx(s, t)).sort((a, b) => a[0] - b[0]);
    return all.filter((c, i) => i === 0 || c[0] - all[i - 1][0] >= 3);
  }, [cfg, t]);
  const runs = useMemo(() => speakingRuns(tokens), [tokens]);

  const cur = Math.max(0, starts.findIndex((s, i) => frame >= s && frame < ends[i]));
  const sting = cfg.scenes.find((s) => s.type === 'end');
  const music = cfg.music;
  return (
    <AbsoluteFill style={{background: SPEC.bg}}>
      {cfg.scenes.map((s, i) => {
        const C = SCENES[s.type].C;
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={ends[i] - starts[i]} premountFor={FPS}>
            <C s={s} L={(c) => t(c) - starts[i]} cfg={cfg} />
          </Sequence>
        );
      })}

      {!SCENES[cfg.scenes[cur].type].dark && <Captions tokens={tokens} fixes={cfg.voice.fixes ?? {}} lines={phraseLines(cfg.voice.script)} ink={SPEC.ink} hi={SPEC.accent} y={1470} plain hideFrom={sting && sting.type === 'end' ? t(sting.sting.at) : Infinity} />}
      <Hud code={cfg.code} tag={cfg.scenes[cur].tag ?? `${String(cur + 1).padStart(2, '0')}/${String(starts.length).padStart(2, '0')}`} total={durationInFrames} marks={starts.slice(1).map((f) => f / durationInFrames)} dark={!!SCENES[cfg.scenes[cur].type].dark} />

      {cfg.voice.vo && <Audio src={staticFile(cfg.voice.vo)} />}
      {music?.src && (
        <Audio
          src={staticFile(music.src)}
          loop
          volume={(f) => duckedVolume(f, runs, music.volume ?? 0.14, music.duck ?? 0.08) * interpolate(f, [0, 8, durationInFrames - 40, durationInFrames - 2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      )}
      {cues.map(([f, sfx], i) => (
        <Sequence key={`sfx${i}`} from={f} durationInFrames={FPS}>
          <Audio src={staticFile(`_sfx/${sfx}.wav`)} volume={GAIN[sfx] * (cfg.sfxVolume ?? 0.8)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
