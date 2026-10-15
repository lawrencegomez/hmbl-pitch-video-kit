import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadSans} from '@remotion/google-fonts/Inter';
import {loadFont as loadHand} from '@remotion/google-fonts/Caveat';
import {Easing, interpolate, spring} from 'remotion';

export const fonts = {
  serif: loadSerif('normal', {weights: ['400'], subsets: ['latin']}).fontFamily,
  sans: loadSans('normal', {weights: ['500', '600', '800'], subsets: ['latin']}).fontFamily,
  hand: loadHand('normal', {weights: ['600', '700'], subsets: ['latin']}).fontFamily,
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
// TikTok / Reels UI covers the bottom ~420px and the right ~140px; keep key content inside this box.
export const SAFE = {top: 200, bottom: 1480, left: 60, right: 940};

export const sec = (s: number) => Math.round(s * FPS);

// Snappy pop with a small overshoot. Returns 0 before `at`, ~1 after.
export const pop = (frame: number, at: number, fast = false) =>
  spring({frame: frame - at, fps: FPS, config: fast ? {damping: 14, stiffness: 260, mass: 0.5} : {damping: 13, stiffness: 170, mass: 0.7}});

export const ease = (frame: number, from: number, to: number, out: [number, number] = [0, 1]) =>
  interpolate(frame, [from, to], out, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

export const easeIn = (frame: number, from: number, to: number, out: [number, number] = [0, 1]) =>
  interpolate(frame, [from, to], out, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.55, 0, 0.75, 0.06),
  });
