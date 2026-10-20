// Launch looks, learned from a teardown of nine product launches (2026-10-19): one world, one accent,
// a clean sans for the script, an optional serif for an editorial look. 1920x1080 first; 9:16 / 4:5 later.
import {createContext, useContext} from 'react';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../theme';

const loaded = [
  loadInter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}),
  loadSerif('normal', {weights: ['400'], subsets: ['latin']}),
  loadSerif('italic', {weights: ['400'], subsets: ['latin']}),
  loadMono('normal', {weights: ['400', '500'], subsets: ['latin']}),
];
export const LF = {sans: loaded[0].fontFamily, serif: loaded[1].fontFamily, serifItalic: loaded[2].fontFamily, mono: loaded[3].fontFamily};
// Text is measured during render, so nothing may render before the real fonts are in (see Stage in parts.tsx).
export const fontsReady = Promise.all(loaded.map((f) => f.waitUntilDone()));

export type Look = {name: string; bg: string; ink: string; sub: string; faint: string; card: string; accent: string; warn: string; ok: string; me: string; them: string; themInk: string};
export const LOOKS: Record<'keynote' | 'dark' | 'editorial', Look> = {
  keynote: {name: 'keynote', bg: '#FFFFFF', ink: '#0B0B0C', sub: '#8E8E93', faint: '#ECECEE', card: '#FFFFFF', accent: '#2F7BFF', warn: '#FF8A00', ok: '#20B15A', me: '#2F7BFF', them: '#ECECEE', themInk: '#0B0B0C'},
  dark: {name: 'dark', bg: '#0E0F11', ink: '#F5F5F7', sub: '#76767C', faint: '#232428', card: '#17181B', accent: '#3B82F6', warn: '#FF9F0A', ok: '#30D158', me: '#3B82F6', them: '#26272B', themInk: '#F5F5F7'},
  editorial: {name: 'editorial', bg: '#F3EEE3', ink: '#1B2433', sub: '#857E70', faint: '#E3DBCB', card: '#FFFDF8', accent: '#1F5C4A', warn: '#B5541C', ok: '#1F7A4D', me: '#1F5C4A', them: '#E9E2D3', themInk: '#1B2433'},
};
export const LookCtx = createContext<Look>(LOOKS.keynote);
export const useLook = () => useContext(LookCtx);

export const sec = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Calm, no-overshoot arrival for words (the keynote feel); a small overshoot for objects that "land".
export const settle = (frame: number, at: number, dur = 14) => interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
export const land = (frame: number, at: number) => spring({frame: frame - at, fps: FPS, config: {damping: 14, stiffness: 180, mass: 0.7}});
// Exits start fast too (Emil: never ease-in on what the viewer is watching); `rush` is the one accelerating move,
// for a camera pushing through the frame.
export const leave = (frame: number, at: number, dur = 10) => interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: Easing.bezier(0.23, 1, 0.32, 1)});
export const rush = (frame: number, at: number, dur = 14) => interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: Easing.bezier(0.55, 0, 0.75, 0.06)});
export const between = (frame: number, a: number, b: number, from: number, to: number) => interpolate(frame, [a, b], [from, to], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});

// Exact text width in the browser that renders the frame (fonts are loaded before render).
let ctx: CanvasRenderingContext2D | null = null;
export const textWidth = (s: string, px: number, weight = 700, family = LF.sans, tracking = 0) => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = `${weight} ${px}px "${family}"`;
  return ctx!.measureText(s).width + tracking * px * s.length;
};
