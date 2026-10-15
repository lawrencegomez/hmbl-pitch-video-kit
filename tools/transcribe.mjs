// Word-level timestamps for a voiceover, via local whisper.cpp (Remotion helper).
// usage: node tools/transcribe.mjs <in.mp3> <out.json>
//        node tools/transcribe.mjs --setup   (download whisper.cpp + model only, ~1.5 GB once)
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {installWhisperCpp, downloadWhisperModel, transcribe, toCaptions} from '@remotion/install-whisper-cpp';

const dir = path.join(os.homedir(), '.cache', 'whisper-cpp');
const model = 'medium.en';
await installWhisperCpp({to: dir, version: '1.5.5'});
await downloadWhisperModel({model, folder: dir});
if (process.argv[2] === '--setup') {
  console.log(`whisper.cpp 1.5.5 + ${model} ready in ${dir}`);
  process.exit(0);
}
const [inFile, outFile] = process.argv.slice(2).map((p) => path.resolve(p));
const wav = outFile.replace(/\.json$/, '.16k.wav');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', inFile, '-ar', '16000', '-ac', '1', wav]);
const out = await transcribe({inputPath: wav, whisperPath: dir, whisperCppVersion: '1.5.5', model, tokenLevelTimestamps: true});
const {captions} = toCaptions({whisperCppOutput: out});
fs.writeFileSync(outFile, JSON.stringify(captions, null, 1));
console.log(captions.map((c) => c.text).join(''));
