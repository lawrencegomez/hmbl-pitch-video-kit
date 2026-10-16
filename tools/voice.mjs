// Voiceover with YOUR OWN ElevenLabs account (optional). Without a key, use Higgsfield (PLAYBOOK step 5).
//   node tools/voice.mjs --list [search]                       your voices: name, id, type
//   node tools/voice.mjs "<script>" <out.mp3> [--voice <id>] [--model <id>]
//   node tools/voice.mjs --default-voice <id>                  remember a voice for next time
// The key is read from ELEVENLABS_API_KEY or ~/.config/hmbl-pitch-video-kit/elevenlabs.env
// (saved by `./setup.sh --elevenlabs`). It never goes in this repo. Each person uses their own.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIR = path.join(os.homedir(), '.config', 'hmbl-pitch-video-kit');
const FILE = path.join(DIR, 'elevenlabs.env');
const API = 'https://api.elevenlabs.io';

const conf = {};
if (fs.existsSync(FILE)) {
  for (const line of fs.readFileSync(FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) conf[m[1]] = m[2].trim();
  }
}
const key = process.env.ELEVENLABS_API_KEY || conf.ELEVENLABS_API_KEY;
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};

if (!key) {
  console.error('No ElevenLabs key on this machine. Run ./setup.sh --elevenlabs to add yours, or use Higgsfield (PLAYBOOK step 5).');
  process.exit(2);
}
const headers = {'xi-api-key': key};

async function check(res) {
  if (res.ok) return res;
  const body = (await res.text()).slice(0, 300);
  console.error(`ElevenLabs said ${res.status}: ${body}`);
  process.exit(1);
}

if (args[0] === '--list') {
  const q = new URLSearchParams({page_size: '100'});
  if (args[1]) q.set('search', args[1]);
  const data = await (await check(await fetch(`${API}/v2/voices?${q}`, {headers}))).json();
  for (const v of data.voices) {
    const l = v.labels || {};
    console.log(`${v.voice_id}  ${v.name}  [${v.category}]  ${[l.gender, l.age, l.accent].filter(Boolean).join(', ')}`);
  }
  if (conf.ELEVENLABS_VOICE_ID) console.log(`\nDefault voice on this machine: ${conf.ELEVENLABS_VOICE_ID}`);
  process.exit(0);
}

if (args[0] === '--default-voice') {
  if (!args[1]) throw new Error('usage: --default-voice <voice id>');
  const rest = fs.readFileSync(FILE, 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('ELEVENLABS_VOICE_ID='));
  fs.writeFileSync(FILE, [...rest, `ELEVENLABS_VOICE_ID=${args[1]}`, ''].join('\n'), {mode: 0o600});
  console.log(`Default voice saved: ${args[1]}`);
  process.exit(0);
}

const voice = opt('--voice') || conf.ELEVENLABS_VOICE_ID;
const model = opt('--model') || conf.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const [text, out] = args;
if (!text || !out) {
  console.error('usage: node tools/voice.mjs "<script>" <out.mp3> [--voice <id>] [--model <id>]');
  process.exit(2);
}
if (!voice) {
  console.error('No voice picked. Run `node tools/voice.mjs --list`, then pass --voice <id> or save one with --default-voice <id>.');
  process.exit(2);
}
const res = await check(
  await fetch(`${API}/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {...headers, 'content-type': 'application/json', accept: 'audio/mpeg'},
    body: JSON.stringify({text, model_id: model}),
  }),
);
fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
console.log(`Saved ${out} (voice ${voice}, model ${model}). Next: speed 1.1x and pad the end, as in PLAYBOOK step 5.`);
