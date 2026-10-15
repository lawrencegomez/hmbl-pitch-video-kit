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

- Centre text blocks inside the safe box (`left: 60, width: 880`), never the full 1080 frame, or centred lines
  drift into the right-hand button rail. Cards and chips end by x 940.
- Hand-set `captionLines` beat any automatic phrase-break rule (names and places get split otherwise).
- Every on-screen label is a factual claim: a badge must match the facts exactly (a founder who left a school
  without a degree is "School CS, left to build", not "School CS").
- Pop-in animations that slide must also fade, or the element sits visible off to the side before its cue.
- A scene that lays content over a photo or clip needs a solid or frosted panel behind the text.
- Reviewer findings get checked against the sources before acting; roughly a third are wrong (a logo that is on
  the company's own site, the company's own public demo footage).
- Product screen recordings from their site often open on a blank frame: start them a second in (`startFrom`) and
  zoom into the readable region.
- Revenue: show speed with the source's time span ("by March"); don't round it into "in 3 months" unless a source says so.

## Cost per video
About 45 Higgsfield credits: voice under 1, music 2.25, one or two stills 3-6, one Seedance clip 35.

## Licence
Remotion is free for companies with up to 3 employees (HMBL qualifies). A 4+ person company needs a paid Remotion
Company License before sending videos.
