// REFERENCE ONLY. Every value here is a made-up placeholder that shows the shape a company file needs.
// For a real company: copy this to src/companies/<slug>.ts, `export default` it, and fill it from that
// company's research. Real company files are gitignored on purpose: company data never goes to GitHub.
// Files whose name starts with "_" are not registered as videos (see src/Root.tsx).
//
// Cue times are seconds into the voiceover, read off companies/<slug>/assets/audio/words.json
// (made by `node tools/transcribe.mjs`). Asset paths are relative to the top-level companies/ folder.

type Token = {text: string; startMs: number; endMs: number; timestampMs?: number; confidence?: number};

const A = 'example-co/assets';
const words: Token[] = []; // real files: import words from '../../companies/<slug>/assets/audio/words.json';

const example = {
  slug: 'example-co',
  name: 'Example Co',
  url: 'example.com',
  durationSec: 38,
  colors: {bg: '#F5F2EC', ink: '#1B1B1B', brand: '#3366FF', accent: '#FFD23F', soft: '#C9CED6', paper: '#FFFFFF'},
  logo: `${A}/logo.svg`,
  audio: {vo: `${A}/audio/vo_final.mp3`, music: `${A}/gen/music.m4a`, musicVolume: 0.16},
  words,
  // Fix whisper's spelling of names in the captions, e.g. {Jon: 'John'} when a name is misheard.
  captionFixes: {} as Record<string, string>,
  // Hand-set caption lines (phrase breaks). Total word count must equal the voiceover's or the render stops.
  captionLines: [] as string[],

  // When each section starts (seconds).
  sections: {hook: 0, what: 4.4, founders: 11.7, why: 19.9, traction: 26.0, close: 34.5},

  // The current Hook scene is one idea ("tab chaos"). Write a new one per company concept.
  hook: {
    kicker: 'The problem today:',
    headline: '10+ tools',
    headlineAt: 1.5,
    aside: '+ someone to glue it all',
    asideAt: 2.7,
    tools: ['Tool A', 'Tool B', 'Tool C', 'Tool D', 'Tool E', 'Tool F', 'Tool G', 'Tool H'],
    alerts: [
      {text: 'Sync failed', tone: 'bad'},
      {text: '12 unread', tone: 'warn'},
    ],
    glueAt: 3.3,
    collapseAt: 3.95,
  },

  what: {
    logoAt: 4.5,
    tagline: 'one line on what it replaces',
    taglineAt: 5.1,
    // Their OWN product screens or demo videos from their public site.
    steps: [
      {at: 6.5, label: 'step one', clip: `${A}/web/demo-1.mp4`, skip: 0, zoom: 1, origin: '50% 50%'},
      {at: 7.7, label: 'step two', clip: `${A}/web/demo-2.mp4`, skip: 0, zoom: 1, origin: '50% 50%'},
    ],
    agents: [
      {label: 'Feature one', at: 8.6},
      {label: 'Feature two', at: 9.4},
      {label: 'Feature three', at: 9.8},
      {label: 'Feature four', at: 10.9},
    ],
  },

  founders: {
    title: 'The founders',
    // Real photos only (LinkedIn, company site). Never AI-generate a real person.
    people: [
      {name: 'Founder One', role: 'CEO', photo: `${A}/founders/one.jpg`, at: 12.6, school: 'School, field', schoolColor: '#555555'},
      {name: 'Founder Two', role: 'CTO', photo: `${A}/founders/two.jpg`, at: 13.4, school: 'School, field', schoolColor: '#555555'},
    ],
    schoolAt: 14.8,
    exit: {from: 'Last company: Name (year)', to: 'Acquired by Buyer', stamp: 'SOLD', at: 17.1},
  },

  why: {
    title: 'Round two.',
    titleAt: 20.0,
    batches: ['First company · year', 'This company · year'],
    stagePhoto: `${A}/founders/together.jpg`,
    moatTitle: 'What makes it different.',
    moatNote: 'the difference in one short line',
    graphAt: 21.9,
    plays: [
      {text: 'Something that works', win: true},
      {text: 'Something else that works', win: true},
      {text: 'The old way', win: false},
    ],
    playsAt: 23.0,
    winAt: 24.2,
  },

  traction: {
    count: 40,
    countLabel: 'customers use it',
    countAt: 26.1,
    // Revenue as speed, in the source's own words. Leave out anything marked "to confirm".
    revenue: {at: 28.4, title: 'Revenue', from: '$0', to: '$XM', toLabel: 'by Month', months: ['Jan', 'Feb', 'Mar']},
    logos: [] as string[], // customer logos from their own site
    stats: [
      {big: '$XM', small: 'raised from investors', at: 31.9},
      {big: 'N', small: 'people in City', at: 33.6},
    ],
  },

  close: {
    clip: `${A}/gen/hero_clip.mp4`, // Seedance hero shot from the concept's motif
    still: `${A}/gen/hero.png`,
    clipStart: 34.4,
    clipSkip: 0,
    lockupAt: 34.7,
    cta: '', // house rule: no call to action
    ctaAt: 0,
  },
};

export type Company = typeof example;
export default example;
