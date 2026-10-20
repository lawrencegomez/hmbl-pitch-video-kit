// Spec Explainer look: warm off-white, black ink, ONE orange. Three fonts, one job each.
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../theme';

export const SPEC = {
  bg: '#EAE5DB',
  ink: '#111111',
  accent: '#FF5A22',
  dark: '#1B1B1A', // "watch this" moments only, while footage plays
  card: '#FFFFFF',
  faint: 'rgba(17,17,17,0.28)', // grid lines, rules, slot outlines
};
export type Palette = typeof SPEC;

export const F = {
  head: loadInter('normal', {weights: ['800', '900'], subsets: ['latin']}).fontFamily, // headlines, all caps
  aside: loadPlayfair('italic', {weights: ['400', '500'], subsets: ['latin']}).fontFamily, // sarcastic asides, lowercase
  mono: loadMono('normal', {weights: ['400', '500', '700'], subsets: ['latin']}).fontFamily, // numbers, labels, HUD
};

// Entrance: slight overshoot, then settle. 0 before `at`.
export const enter = (frame: number, at: number) =>
  spring({frame: frame - at, fps: FPS, config: {damping: 11, stiffness: 190, mass: 0.6}});

// Line draw-on progress 0..1 (feed it to stroke-dashoffset).
export const draw = (frame: number, at: number, dur = 14) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1)});

// Smooth 0..1 over a span (pull-backs, count-ups).
export const glide = (frame: number, at: number, dur: number) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});

// "*word*" -> the orange accent. Returns [text, isAccent] runs.
export const accentRuns = (s: string): [string, boolean][] => s.split(/(\*[^*]+\*)/).filter(Boolean).map((r) => (r.startsWith('*') ? [r.slice(1, -1), true] : [r, false]));
