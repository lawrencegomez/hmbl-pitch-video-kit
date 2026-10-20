// Timing for Spec Explainer configs: every `at` / `start` is a Cue, resolved against the voiceover's words.
import {toWords} from '../components/Captions';
import {FPS} from '../theme';

// A Cue is seconds (2.4), or a spoken word: "battery" (first time it is said), "price#2" (second time),
// "hours+0.6" (0.6 s after that word starts). Punctuation and apostrophes are ignored ("it's" = "its").
export type Cue = number | string;
export type Token = {text: string; startMs: number; endMs: number};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$]/g, '');
const PAUSE = /\[pause\s+(\d*\.?\d+)\]/g;

// Script -> what the voice says (no "|" or [pause] marks).
export const spokenText = (script: string) => script.replace(PAUSE, ' ').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();

// Script -> caption phrases: "|" and [pause] both end a phrase.
export const phraseLines = (script: string) =>
  script.replace(PAUSE, '|').split('|').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);

// Stand-in word timings before a voiceover exists (~3.2 words a second after the 1.1x speed-up), in
// whisper's token shape so captions and cues work the same before and after recording.
export const estimateTokens = (script: string, wps = 3.2): Token[] => {
  const out: Token[] = [];
  let t = 0.3;
  for (const w of script.replace(PAUSE, ' §$1 ').replace(/\|/g, ' ').split(/\s+/).filter(Boolean)) {
    if (w.startsWith('§')) {
      t += Number(w.slice(1));
      continue;
    }
    out.push({text: ` ${w}`, startMs: Math.round(t * 1000), endMs: Math.round((t + 0.9 / wps) * 1000)});
    t += 1 / wps + (/[.?!]$/.test(w) ? 0.28 : /[,:]$/.test(w) ? 0.1 : 0);
  }
  return out;
};

export const makeT = (tokens: Token[]) => {
  const words = toWords(tokens, {});
  return (c: Cue): number => {
    if (typeof c === 'number') return Math.round(c * FPS);
    const m = /^(.+?)(?:#(\d+))?([+-]\d*\.?\d+)?$/.exec(c.trim());
    if (!m) throw new Error(`Bad cue "${c}"`);
    const hits = words.filter((w) => norm(w.text) === norm(m[1]));
    const n = Number(m[2] ?? 1);
    if (hits.length < n) throw new Error(`Cue "${c}": "${m[1]}" is said ${hits.length} time(s) in the voiceover (check the words file or the script)`);
    return Math.round((hits[n - 1].start / 1000 + Number(m[3] ?? 0)) * FPS);
  };
};
export type T = ReturnType<typeof makeT>;

// When the voice is talking, as [startFrame, endFrame] runs (gaps under 0.35 s merged). Drives the music duck.
export const speakingRuns = (tokens: Token[]): [number, number][] => {
  const runs: [number, number][] = [];
  for (const w of toWords(tokens, {})) {
    const s = (w.start / 1000) * FPS;
    const e = (w.end / 1000) * FPS;
    const last = runs[runs.length - 1];
    if (last && s - last[1] < 0.35 * FPS) last[1] = e;
    else runs.push([s, e]);
  }
  return runs;
};

// Music gain at frame f: full bed in the gaps (the demo), ducked under the voice, 6-frame ramps.
export const duckedVolume = (f: number, runs: [number, number][], full: number, ducked: number) => {
  let k = 0;
  for (const [s, e] of runs) k = Math.max(k, f < s ? 1 - (s - f) / 6 : f > e ? 1 - (f - e) / 8 : 1);
  return full - (full - ducked) * Math.max(0, Math.min(1, k));
};
