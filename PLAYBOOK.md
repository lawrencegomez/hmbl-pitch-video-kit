# Pitch video playbook (mechanics)

The creative process lives in the skill: `skill/hmbl-company-pitch-video/SKILL.md`. This file is the how-to:
commands, settings, costs and gotchas. It must never contain company names or company facts.

Before any node / npx / higgsfield / codex command: `source bin/env.sh` (from the kit folder).

## Skeleton (fixed order; the voiceover sets the real cue times)

| Section | Time | Says | Shows |
|---|---|---|---|
| Hook | 0-4 s | One line that starts the video (hook type per company) | Text on screen from frame 0, motion graphics, never a stock photo |
| What they build | 4-11 s | What it does in plain words | Logo reveal, their OWN product screens or demo videos, features ticked as named |
| Founders | 11-19 s | Names, schools, prior companies or exits | Real photos, role tags, school badges, exit card |
| Why it's different | 19-26 s | The difference, the way the founders put it | A diagram or comparison drawn in code |
| Traction | 26-35 s | Customers, revenue speed, funding, team size, city | Count-up, customer logos, revenue-speed chart, stat cards |
| Close | last 3-4 s | "That's <Company>." and nothing after | Hero clip (Seedance) + logo only. No URL, no call to action |

## Pipeline

1. **Folder:** `mkdir -p companies/<slug>/{research,assets/{web,founders,audio,gen}}` (gitignored).
2. **Research (free):** `scrapling extract get <url> companies/<slug>/research/<name>.md` for the site, YC page,
   launch post, press. Site images: fetch the HTML with Scrapling's Fetcher and download the image URLs with curl.
   Founder photos: their public LinkedIn page via the plain Fetcher, read the `og:image` meta (LinkedIn serves 200x200
   logged out, fine for round portraits). Brand tokens for JS-heavy sites: `npx designlang <url> --full -o companies/<slug>/research/design`.
3. **Logo:** if the site's logo is a small PNG, trace it sharp:
   `magick logo.png -alpha extract -resize 800% -blur 0x3 -threshold 50% -negate logo.pbm && potrace logo.pbm -s --turdsize 20 --alphamax 1.2 -o logo.svg`
   then set the fill colour in the SVG.
4. **Script:** 85-100 words. Humanizer, then `python3 ~/.claude/skills/slopmonster/tools/deslop.py --text "..."`
   (score only, never cleanse: founder names are client contacts).
5. **Higgsfield** (needs a Higgsfield account with credits; `higgsfield account status` shows the balance):
   - **Voice:** `elevenlabs_v4`, voice **Emily** `6b3e3642-f7b7-4cb8-9688-51e233c4b92f` (young female, preset).
     `higgsfield generate create elevenlabs_v4 --dialogue '[{"text":"...","voice_id":"<id>","voice_type":"preset"}]' --wait --json`
     then download `result_url`. Speed up: `ffmpeg -i in.mp3 -af atempo=1.1 -ar 44100 vo_final.mp3` (keeps pitch).
     Pad the end so whisper keeps the last words: `-af "apad=pad_dur=1.5"`. About 0.25 credits.
   - **Own ElevenLabs account (optional, per person):** `./setup.sh --elevenlabs` saves the key to
     `~/.config/hmbl-pitch-video-kit/elevenlabs.env` (private, outside the repo). Then
     `node tools/voice.mjs --list`, `node tools/voice.mjs --default-voice <id>`, and
     `node tools/voice.mjs "<script>" companies/<slug>/assets/audio/vo_raw.mp3` (model `eleven_multilingual_v2`
     unless `--model` says otherwise). Same 1.1x speed-up and end padding afterwards. Billed to that person's
     ElevenLabs plan, not Higgsfield. A key never goes in chat, a commit or a company file (the guard blocks `sk_` keys).
   - **Music:** `sonilo_music --duration <seconds+1> --prompt "<from vibe.md>"`, about 2.25 credits. Volume 0.10 under the voice (0.16 was "a little too loud", 2026-10-17).
   - **Stills:** `gpt_image_2_5 --aspect_ratio 9:16 --quality high --resolution 2k`, about 2.75 credits each.
   - **Hero clip:** `seedance_2_5 --mode omni_reference --start-image <UPLOAD_ID> --aspect_ratio 9:16 --duration 5 --resolution 720p --generate_audio false`,
     35 credits (1080p is 80). Takes about 10 minutes: start it first, in the background.
   - ⚠️ **Uploads:** passing a big local PNG or an MP3 fails with an S3 "SignatureDoesNotMatch" error. Convert to a
     ~1 MB JPEG (`magick in.png -resize 1080x -quality 90 start.jpg`), `higgsfield upload create start.jpg --json`,
     and pass the returned id.
   - Always `higgsfield generate cost <model> ...` first (free) when unsure.
   - ⛔ Never generate a real person's face.
6. **Word timings:** `node tools/transcribe.mjs companies/<slug>/assets/audio/vo_final.mp3 companies/<slug>/assets/audio/words.json`
   (local whisper.cpp, free, private). Read section cue times off the word list.
7. **Company file:** copy `src/companies/_example.ts` to `src/companies/<slug>.ts`, `export default` it, import the
   words file, fill content, cue times and `captionLines` (hand-set phrase breaks; total words must equal the
   voiceover's, or the render stops with a clear error). It is picked up automatically as video id `<slug>`.
8. **Preview / render:** `npx remotion studio src/index.ts` (live preview), `npx remotion render src/index.ts <slug> out/<slug>-vN.mp4 --crf=18`
   (15-40 s). Half-size draft: add `--scale=0.5`. Still frame: `npx remotion still src/index.ts <slug> out/f.png --frame=<n>`.
9. **Review loop:** see `skill/hmbl-company-pitch-video/references/review.md`.

**Splicing a changed line** (instead of redoing the whole voiceover, so earlier cue times stay put): generate only
the new sentence with the same voice, speed it 1.1x, trim its silence
(`silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse`),
find pause points in the old file (`-af silencedetect=noise=-38dB:d=0.12`), concat with short silent gaps, re-transcribe.
Re-transcribing nudges words near the cut by tens of ms: keep the old `words.json` entries before the cut and take only
the new line's words; if a shot change is cued off the new line's first word, pick the offset that keeps the old cut
frame. Prove nothing else moved before sending: `ffmpeg -t <cut s> -i new.mp4 -t <cut s> -i old.mp4 -lavfi psnr -f null -`
(min PSNR above ~40 dB = the same frames; a lower min names the frames that changed via `psnr=stats_file=...`).
Never put an `afade=t=out` with `st=0` on the whole track: it silences everything.
A segment can have its own tone: a serious, matter-of-fact hook = `--stability 0.85`, sped 1.18x instead of 1.1x
(record two short takes and let the recruiter pick). Match loudness with `-af volumedetect` (within 0.5 dB), keep about
0.38 s between sentences, and move the later cue times by the exact splice offset (one small helper per section, e.g.
`const tw = (s) => t(s - 0.05)`) instead of re-timing by hand.

**Music check (before using a bed):** Sonilo beds can switch to a louder, brighter section partway through, which
Lawrence rejected ("starts off cool but then sounds different"). Prompt for "one steady groove from start to finish,
same instruments throughout, no build, no drop". Scan the bed in 2 s windows (loudness and brightness; a jump of 6-10 dB
in the lows means a new section). If it shifts, loop the opening 8 bars instead of buying a new bed: find the tempo
(onset autocorrelation; the beds land near 120 bpm, 8 bars about 16 s) and the first downbeat, then
`asplit=4`, `atrim=0:<end>` for the first copy, `atrim=<downbeat>:<end>` for the repeats, `acrossfade=d=0.02` between
them, `afade=t=out` over the last 2 s.

## Craft lessons (apply to every video)

- Centre on the real middle of the frame (x 540). The scenes were first drawn for a 60-940 box (TikTok's button
  rail), which made every video lean left; `NUDGE_X` (40px) in `src/theme.ts` shifts them back. Check with a
  centre line drawn on a frame before calling a layout done. Anything already centred on the FULL frame
  (`left: 0, width: 100%`, or `left: 540 - w/2`) must subtract `NUDGE_X`, or the nudge pushes it 40px right.
- Hand-set `captionLines` beat any automatic phrase-break rule (names and places get split otherwise).
- Every on-screen label is a factual claim, but keep founder badges short and matched: "School CS", one colour
  for all of them (Lawrence 2026-10-15 dropped "left to build" and the per-school grey). Never write
  "graduate" or "degree" unless a source says so.
- Pop-in animations that slide must also fade, or the element sits visible off to the side before its cue.
- A scene that lays content over a photo or clip needs a solid or frosted panel behind the text.
- Reviewer findings get checked against the sources before acting; roughly a third are wrong (a logo that is on
  the company's own site, the company's own public demo footage).
- Product screen recordings from their site often open on a blank frame: start them a second in (`startFrom`) and
  zoom into the readable region.
- Revenue: show speed with the source's time span ("by March"); don't round it into "in 3 months" unless a source says so.

## Transitions (learned the hard way, 2026-10-15)

- **Torn-paper reveal = the NEW page with one torn edge sliding over the old page** (`<TornReveal>`, used
  automatically by `vox.full`). Never a separate sheet sweeping across: a sheet has a front and a back edge, and
  the eye reads two pieces of paper.
- **Never fade under a wipe.** The old page stays fully visible underneath until the reveal has covered it
  (`end = next start + 12`), then disappears. A fade-out plus fade-in under a sweep shows both pages at once
  behind the edge, which reads as the old page flashing back.
- Phase changes inside one scene (e.g. revenue graph, then money and team) follow the same rule: wrap the
  incoming phase in `<TornReveal>` and keep the outgoing one until the reveal finishes.
- Check every transition with `tools/check-frames.sh`; a still sheet never shows these problems.

## Numbers and reveals

- Big numbers (revenue, funding, team size) pop in on the exact word the voice says them: read the time off
  `words.json` and set it (`revenue.toAt`, `stats[].revealAt`). Lawrence rejected black redaction bars over
  numbers as distracting; keep `<Redact>` for names or quotes only, if at all.
- Supporting labels ("by March") land on their own word, not with the number.
- A marker circle needs clear space around the whole thing it circles (about 60px past the text each side).

## Office map (when the office location is confirmed)

- OpenStreetMap tiles, zoom 16-17, around the address: tile x/y from the standard slippy-map formula,
  `curl -A "hmbl-pitch-video-kit" https://tile.openstreetmap.org/<z>/<x>/<y>.png` for a 3x3 block, stitch with
  `magick montage -tile 3x3 -geometry +0+0`, tint to the paper (`-modulate 105,35 -fill '#F1E4CC' -colorize 25%`),
  save under `companies/<slug>/assets/map/`. A handful of tiles is within OSM's usage policy; never bulk-fetch.
- The credit "© OpenStreetMap contributors" must stay visible on screen (`vox.office.credit`).
- Note in the company file where the location came from (call notes vs a public source).

## Full Vox style ("Mode A" of the `vox-style-video` skill, 2026-10-16)

When the recruiter asks for a Vox-style video, read `~/.claude/skills/vox-style-video/SKILL.md` and open each rule's
reference images first. The parts live in `src/voxa/kit.tsx` (no company data); a video is one
`src/companies/<slug>-voxa.tsx` that composes them (see the comments there for which rule each part covers).

- **Pipeline:** render raw (`npx remotion render src/index.ts <slug>-voxa out/<slug>-voxa-vN-raw.mp4 --crf=14`, about
  a minute), then the lens pass `tools/vox-ca.sh out/<slug>-voxa-vN-raw.mp4 out/<slug>-voxa-vN.mp4` (rule 1, ~10 s).
  Photos get the print look first: `tools/vox-halftone.sh in.png out.png 400 55` (keeps the cut-out's alpha; pure
  dot halftone makes faces unrecognisable, this blend keeps them readable).
- **12 fps (rule 2):** wrap every visual in `<Stepped>` (one `Freeze` on the stepped frame); audio stays outside.
  Prove it: count new images a second with a frame-difference script; a moving stretch must read ~12/s.
- **Cuts (rule 5):** each scene is a `<Shot from to enter exit>`; the exit move of one and the enter move of the next
  are two halves of one ease, so the hard cut lands at peak speed. Check with a strip of frames cut-12 ... cut+10.
- **Depth layers (rule 6):** split a photo into back plate / subject / foreground with masks, fill the plate's holes
  with a down-and-up-scale pyramid (ImageMagick `-compose dst_over`), and keep ORIGINAL pixels everywhere except a
  thin zone right under each cut-out, or every edge gets a light halo.
- **12 fps and the last cut:** a cut lands on the next 12 fps step (up to 2 frames late), so the next caption line can
  flash over the old scene. Hide the captions 3 frames before the close cut (`hideFrom={C.close - 3}`).
- **Odometer text:** the target glyph (invisible) sets the width and the reel rolls in a clipped window; otherwise the
  letters spread apart and neighbours bleed in. After landing, draw the plain glyph.
- **Board scenes:** anything parked further down or to the side of the board shows during zoom-out entries and under
  the captions. Hide it until the camera heads its way (`showFrom`), or slide it in with the pan.
- **Hand circles:** wrap the words (`<Circled>`), never place a circle by board coordinates; give two-line headlines
  ~1.2 line height so the loop doesn't cut the line above.
- **Yellow:** the only accent. A brand's own colour stays only in its logo and real footage; tone down map colours
  that compete (OpenStreetMap's yellow roads).
- **One text animation at a time:** schedule them against the word timings and check for overlaps before rendering.
- **Bright Vox (Lawrence 2026-10-16: the grey version felt "dark and gloomy"; a startup explainer should excite).**
  Use Vox Explained pastels per scene (sky, mint, sun, lavender, coral) with white soft grids, `PrintTexture
  vignette={0.1}`, grain ~0.13, colour halftone on photos (`tools/vox-halftone-color.sh`), and lots of small moving
  parts from `src/voxa/bits.tsx` (people, envelopes, chips, radar, stamps, bursts, starbursts, rockets, tiles, cash, confetti, network pulses).
  Yellow letters on pastel need `<VoxText stroke>`; dimmed crowds stay pastel, not grey; `MapFocus bright`.
- **Hold every fact:** a short shot spends ~36-51% of its frames in the cut moves. Bring supporting labels in with the
  cut (cut + 2 to 4 frames), animate only the hero number on its word, and use `inHalf/outHalf` 12 on short traction
  shots (keep the pair equal on both sides of a cut).
- **Labels are claims:** "WINS" on example plays implied results nobody sourced; "KEEP" says the same thing honestly.
  A source tag must match the exact source (logos named in the launch post vs logos only on the site).
- **Highlights never break (Lawrence 2026-10-17, everywhere):** words lit one after another form ONE bar per line that
  grows at one steady speed with the voice. Screenshots: kit `<Evidence src b w lit>` (word boxes with a `line` number
  per word, `wordAt()` to find them). Typeset quotes: kit `<Sweep>`, one per word, the space inside the first box. Never
  separate per-word boxes: their gaps, seams and notches show for 2-3 frames at every join. Check by stepping through
  every frame of each highlight, not a still sheet.
- **Real evidence as the hook (2026-10-16):** open with the company's own boldest sourced line on its real page,
  each word highlighted as the voice says it (kit `<Evidence>`, one unbroken bar per line), then hit the charged word
  (`Stamp bold`, `Burst`, a red strike `DrawPath`, a short shake, a red flash; `Starburst` for a "HOT TAKE" sticker).
  Capture with Aside (`aside repl`): a plain window screenshot is 2x; for a line shown big, set
  `transform: scale(3)` on its paragraph in the page first so the text stays crisp, and measure word boxes with a DOM
  Range. In Aside, `Emulation.setDeviceMetricsOverride` and `Page.captureScreenshot` clips came back tiled; crop
  locally instead.
- **Numbers with units:** the odometer rolls only digits when the text holds a number (kit, 2026-10-16); a rolling
  "M" flashed "$5B+" on the way to "$5M+". Settle a number by its spoken word, never during the exit move.
- **Scale reveals:** bars drawn to scale (a goal 10x the current bar, dashed = not there yet), then the camera zooms
  out to show the whole height. Keep the reveal's label clear of anything still moving.
- **Deep map zoom (office location):** stack OpenStreetMap levels by geography in one transformed layer: z14 3x3 (the
  city), z16 3x3 (blocks), z18 4x4 (the street). A zN image sits at its tile offset and spans 256 x 2^(14-N) z14 px per
  tile. Cross-fade z16 in as the scale passes ~2 and z18 past ~6; draw the place's outline from Overpass
  (`way["name"="..."](bbox); out geom;`) inside the z18 layer, yellow multiply fill + red outline; soften the rest
  with a `backdrop-filter` blur under a radial mask (rule 10). Reach the place by the city name and hold ~1 s.

## Cost per video
About 45 Higgsfield credits: voice under 1, music 2.25, one or two stills 3-6, one Seedance clip 35.

## Licence
Remotion is free for companies with up to 3 employees (HMBL qualifies). A 4+ person company needs a paid Remotion
Company License before sending videos.
