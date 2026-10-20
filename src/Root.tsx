import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import type {Company} from './types';
import {Pitch} from './Pitch';
import {FPS, H, W, fonts} from './theme';
import type {SpecConfig} from './spec/scenes';
import {SpecExplainer, specMetadata} from './spec/SpecExplainer';
import {LaunchSampler, SAMPLER_FRAMES} from './launch/Sampler';

// Every src/companies/<slug>.ts with a default export becomes a video with id <slug>.
// Files starting with "_" (the example) are skipped. No edits here when adding a company.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (require as any).context('./companies', false, /^\.\/[^_][\w-]*\.ts$/);
const companies: Company[] = ctx.keys().map((k: string) => ctx(k).default).filter(Boolean);
// Extra local compositions (style tests, cut-downs): src/companies/*.tsx exporting {id, component, durationInFrames, width, height}.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extraCtx = (require as any).context('./companies', false, /\.tsx$/);
type Extra = {id: string; component: React.FC; durationInFrames: number; width: number; height: number};
const extras: Extra[] = extraCtx.keys().map((k: string) => extraCtx(k).default).filter(Boolean);
// Spec Explainer videos: the shared examples plus any local src/companies/<slug>.spec.json (id = the config's "id").
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const specCtxs = [(require as any).context('./spec/examples', false, /\.spec\.json$/), (require as any).context('./companies', false, /\.spec\.json$/)];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const specs: SpecConfig[] = specCtxs.flatMap((c: any) => c.keys().map((k: string) => c(k).default ?? c(k)));

// Setup check: renders one frame with the real fonts and no assets (`npm run smoke`).
const Smoke: React.FC = () => (
  <AbsoluteFill style={{background: '#F5F2EC', alignItems: 'center', justifyContent: 'center', gap: 20}}>
    <div style={{fontFamily: fonts.serif, fontSize: 150, color: '#1B1B1B'}}>Kit works</div>
    <div style={{fontFamily: fonts.hand, fontSize: 70, color: '#3366FF'}}>fonts + renderer ok</div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="smoke" component={Smoke} durationInFrames={1} fps={FPS} width={W} height={H} />
    {companies.map((c) => (
      <Composition
        key={c.slug}
        id={c.slug}
        component={Pitch}
        durationInFrames={Math.round(c.durationSec * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{c, useClip: true}}
      />
    ))}
    {extras.map((e) => (
      <Composition key={e.id} id={e.id} component={e.component} durationInFrames={e.durationInFrames} fps={FPS} width={e.width} height={e.height} />
    ))}
    <Composition id="launch-sampler" component={LaunchSampler} durationInFrames={SAMPLER_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{look: 'keynote' as const}} />
    <Composition id="launch-sampler-dark" component={LaunchSampler} durationInFrames={SAMPLER_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{look: 'dark' as const}} />
    {specs.map((cfg) => (
      <Composition key={cfg.id} id={cfg.id} component={SpecExplainer} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{cfg, tokens: []}} calculateMetadata={specMetadata} />
    ))}
  </>
);
