// Render chosen frames as PNG stills, bundling once (style frames, spot checks), from the kit folder:
//   node tools/stills.mjs <compositionId> <outDir> <frame> [<frame> ...]
// Writes <outDir>/<id>-f<frame>.png. Much faster than one `npx remotion still` per frame.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const [id, outDir, ...frames] = process.argv.slice(2);
if (!id || !outDir || !frames.length) {
  console.error('usage: node tools/stills.mjs <compositionId> <outDir> <frame> [<frame> ...]');
  process.exit(1);
}
const kit = process.cwd();
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(kit, 'src/index.ts'), publicDir: path.join(kit, 'companies')});
const composition = await selectComposition({serveUrl, id});
for (const f of frames) {
  const output = path.join(outDir, `${id}-f${String(f).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: Number(f), output, overwrite: true});
  console.log(output);
}
