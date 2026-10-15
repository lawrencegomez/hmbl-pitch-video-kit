import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS, fonts, pop} from '../theme';

type Token = {text: string; startMs: number; endMs: number};
type Word = {text: string; start: number; end: number};

// whisper.cpp tokens -> words (a leading space starts a new word), with spelling fixes applied.
const toWords = (tokens: Token[], fixes: Record<string, string>): Word[] => {
  const out: Word[] = [];
  for (const t of tokens) {
    if (t.text.startsWith(' ') || out.length === 0) out.push({text: t.text.trim(), start: t.startMs, end: t.endMs});
    else {
      out[out.length - 1].text += t.text;
      out[out.length - 1].end = t.endMs;
    }
  }
  return out.filter((w) => w.text && !/^\[.*\]$/.test(w.text)).map((w) => ({...w, text: fixes[w.text] ?? w.text}));
};

// Phrase-sized lines: break after punctuation, aim for 3 words, never end a line on a little
// joining word ("to", "and", "who") so sound-off viewers never read a dangling fragment.
const JOIN = new Set(['a', 'an', 'the', 'to', 'and', 'or', 'of', 'at', 'by', 'for', 'in', 'on', 'who', 'their', 'our', 'it\'s', 'which', 'with', 'plus']);
const chunk = (words: Word[]) => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    const last = w.text.toLowerCase();
    if (/[.,!?]$/.test(w.text) || cur.length === 4 || (cur.length >= 3 && !JOIN.has(last))) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
};

// Hand-set lines take their timing from the voiceover words in order; a count mismatch fails the render.
const fromLines = (words: Word[], lines: string[]) => {
  const total = lines.reduce((n, l) => n + l.split(' ').length, 0);
  if (total !== words.length) throw new Error(`captionLines have ${total} words, voiceover has ${words.length}`);
  let k = 0;
  return lines.map((l) => l.split(' ').map((text) => ({...words[k++], text})));
};

// left / width / size default to the vertical pitch layout; the 16:9 training videos pass their own.
export const Captions: React.FC<{tokens: Token[]; fixes: Record<string, string>; lines?: string[]; ink: string; hi: string; y?: number; hideFrom?: number; left?: number; width?: number; size?: number; font?: string}> = ({tokens, fixes, lines, ink, hi, y = 1330, hideFrom = Infinity, left = 60, width = 880, size = 46, font = fonts.sans}) => {
  const frame = useCurrentFrame();
  const ms = (frame / FPS) * 1000;
  const chunks = useMemo(() => (lines ? fromLines(toWords(tokens, fixes), lines) : chunk(toWords(tokens, fixes))), [tokens, fixes, lines]);
  if (frame >= hideFrom) return null;
  const i = chunks.findIndex((c, k) => ms >= c[0].start - 60 && ms < (chunks[k + 1]?.[0].start ?? c[c.length - 1].end + 500) - 60);
  if (i < 0) return null;
  const c = chunks[i];
  const s = pop(frame, Math.round(((c[0].start - 60) / 1000) * FPS), true);
  return (
    <div style={{position: 'absolute', left, width, top: y, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          background: ink,
          borderRadius: 16,
          padding: '9px 20px 12px',
          transform: `scale(${0.85 + 0.15 * s}) translateY(${(1 - s) * 16}px)`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          fontFamily: font,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: '#fff',
          whiteSpace: 'nowrap',
        }}
      >
        {c.map((w, k) => (
          <span key={k} style={{color: ms >= w.start - 40 && ms < w.end + 120 ? hi : '#fff'}}>
            {k > 0 ? ' ' : ''}
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
};
