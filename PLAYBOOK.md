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
   - **Music:** `sonilo_music --duration <seconds+1> --prompt "<from vibe.md>"`, about 2.25 credits. Volume 0.16 under the voice.
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
Never put an `afade=t=out` with `st=0` on the whole track: it silences everything.

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

## Cost per video
About 45 Higgsfield credits: voice under 1, music 2.25, one or two stills 3-6, one Seedance clip 35.

## Licence
Remotion is free for companies with up to 3 employees (HMBL qualifies). A 4+ person company needs a paid Remotion
Company License before sending videos.
