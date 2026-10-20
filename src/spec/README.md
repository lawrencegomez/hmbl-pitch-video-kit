# Spec Explainer

A vertical video style (1080x1920, 30 fps) modeled on Techy or Not's product shorts: a warm off-white page, black type and lines, one orange accent, flat technical drawings, a HUD across the top, and a soft UI sound on every entrance. One JSON file describes one video, so a new product means a new JSON file and new assets, with no code changes.

There are two shapes:

- Product short (`examples/spec-example.spec.json`): hook, what it is, how it works, the demo, quick answers, then a question for the comments and the logo sting.
- Candidate pitch video (`examples/spec-example-pitch.spec.json`): the pitch kit's house order (hook, what they build, founders, why it's different, traction, close). Why it's different is a `cut` or `flow` scene plus the `hub` edge slide. The close is "That's <Company>." and the logo, with no question and no call to action. Every other house rule in the skill still applies, except that this look keeps its sound effects.

## See the examples

From the kit folder, after `source bin/env.sh`:

```bash
npx remotion studio src/index.ts --port 3197          # live preview, pick spec-example
node tools/stills.mjs spec-example out/spec-stills 0 78 228 490 625 700 858 940 1004 1110 1170
npx remotion render src/index.ts spec-example out/spec-example.mp4 --crf=18
```

The examples use a made-up product, and every product spot is a labeled slot (a dashed circle that says "PRODUCT CUTOUT"), so the look can be judged before any real assets exist.

## Make a new one

1. Copy `src/spec/examples/spec-example.spec.json` to `src/companies/<slug>.spec.json` and set `"id"` to `<slug>`. It shows up in the Studio as `<slug>`. Files in `src/companies/` never go to GitHub, so product facts and assets stay on your computer.
2. Write the script in `voice.script`, about 90 words for 35 to 40 seconds. A `|` ends a caption phrase. `[pause 3.5]` leaves 3.5 seconds of silence for the demo to play in.
3. List the scenes in spoken order. A scene runs from its `start` to the next scene's `start`, with a hard cut between them. Plan a new thing on screen every 1.5 to 2.5 seconds.
4. Ask for the assets: transparent PNG or WebM cut-outs of the product, a short demo clip, the logo, and the pages the facts come from. Put them in `companies/<slug>/assets/` and point to them as `"<slug>/assets/product.png"`. Leave a field as `null` and the video draws a labeled slot. Never fill a slot with a generated product render.
5. Render stills and check the look before paying for a voice or music.
6. Record the voice (Maya, as in the pitch kit, sped up 1.1x). Put silence where the demo plays, then shorten the long pauses:
   `ffmpeg -i vo.mp3 -af "silenceremove=stop_periods=-1:stop_duration=0.2:stop_threshold=-38dB:stop_silence=0.12" vo_tight.wav`
   On a 44 second test voiceover this took out 1.8 seconds. Listen to the result before using it.
7. Transcribe it with `node tools/transcribe.mjs <vo file> companies/<slug>/assets/audio/words.json`, then set `voice.words` to `"<slug>/assets/audio/words.json"` and `voice.vo` to the audio file. Every cue moves to the real timing on its own.
8. Add a lo-fi music bed as `music.src`. It plays at `music.volume` (default 0.14) when nobody is talking and drops to `music.duck` (default 0.08) under the voice.
9. Render and watch the whole thing with sound.

## Cues

Every `start` and `at` in the config is a cue. A cue is either seconds or a word from the script:

| Cue | Means |
|---|---|
| `2.4` | 2.4 seconds into the video |
| `"battery"` | when "battery" is first said |
| `"price#2"` | the second time "price" is said |
| `"hours+0.6"` | 0.6 seconds after "hours" starts (negative works too) |

Punctuation and apostrophes don't count, so `"it's"` and `"its"` are the same word. Common words repeat, so check which one you mean: in the example, `"does"` first appears in "the puck does the rest", and the answers scene needs `"does#2"`. Before a voice exists, word times are estimated from the script at `voice.wps` words a second (default 3.2). After transcription, a cue must match what the transcript says (it may write "$99" where the script says "ninety-nine"). A cue that can't be found stops the render with a message naming the word.

## Scene types

| `type` | Shows | Main fields |
|---|---|---|
| `hook` | extreme close-up of the product pulling back, a bold claim, a dashed ring | `product`, `headline`, `pullBack` (seconds), `figure` |
| `what` | the product, a headline, a serif aside that can get struck through and answered, spec callouts | `product`, `headline`, `aside`, `callouts` |
| `parts` | numbered badges on the product with labeled leader lines, over a radar grid or wireframe globe | `product`, `headline`, `parts`, `backdrop`, `backdropAt` |
| `flow` | boxes joined by dashed lines, top to bottom, numbered | `headline`, `steps` |
| `demo` | charcoal background, the demo clip, "WATCH THIS" | `clip`, `label`, `position` + `zoom` to frame a landscape clip on its readable part, `skip` (seconds) when the clip opens on a blank frame |
| `answer` | one question, then devices with checkmarks, a count-up, a globe pin or a big word, with a source card | `headline`, `devices`, `scale` (with `goal` for a dashed target bar, `size` for long numbers), `chips` (investor names), `people` (team size), `globe`, `big`, `source`, `aside` |
| `cut` | keep what wins, cut the rest: rows appear, their key number is circled one by one, the losers are struck through and thrown off, the winners close up with a check | `headline`, `items` (`text`, `stat`, `keep`), `scanAt`, `cutAt`, `columns`, `note` |
| `hub` | the edge slide: many company tiles feed one box of what works, which feeds what the customer gets | `headline`, `nodes` (`count`, `label`), `hub`, `outputs`, `note` (e.g. the alternatives customers come from) |
| `founders` | real photos in dashed rings, name, role, one line each | `headline`, `people`, `source` |
| `end` | the closing line (a question, or "That's <Company>."), then the logo sting | `headline`, `aside`, `sting` |

A `headline` is `{"lines": [...], "at": cue or [one cue per line]}`. Wrap words in `*stars*` to turn them orange. An `aside` is `{"text", "at", "strikeAt", "reply": {"text", "at"}}`. A `source` is `{"source": "sony.com", "quote": "...", "at": cue}`. Put a source card on screen whenever the voice states a fact, and quote the source's own words.

## Components

All in `src/spec/parts.tsx`, usable on their own in any composition: `Hud`, `Headline`, `Aside`, `SourceCard`, `Badge`, `RadarGrid`, `WireGlobe`, `FlowChart`, `DeviceRow` (phone, tablet, laptop, watch, tv, console), `Scale`, `StrikeThrough`, `DashedCircle`, `Callout`, `Cutout` and `DrawShape`, which draws any SVG line on, dashed or solid. Colors, fonts and the entrance spring are in `src/spec/theme.ts`.

The look in one place: background `#EAE5DB`, ink `#111111`, accent `#FF5A22`, charcoal `#1B1B1A` only while footage plays. Inter Black for headlines, Playfair Display Italic for asides, JetBrains Mono for numbers, labels and the HUD. Flat SVG only, so no gradients, no glow and no cards with a thick colored left border. Elements enter on a spring with a small overshoot, lines draw on, and scenes change on hard cuts with no camera moves.

## Sound

The sound files live in `companies/_sfx/`. This kit serves `companies/` as Remotion's public folder, so that folder is what other Remotion projects call `public/sfx`. They come from Kenney's Interface Sounds pack (CC0, free for commercial use), except `whoosh.wav`, which was made from filtered noise with ffmpeg.

| Sound | Plays on |
|---|---|
| `click` | each headline line |
| `pop` | badges, flowchart boxes, source cards, founders, globe pins |
| `blip` | asides and their replies |
| `tick` | spec callouts and count-ups |
| `check` | a device getting its checkmark |
| `strike` | a strikethrough, or a device that doesn't work |
| `whoosh` | the hook pull-back, the radar or globe drawing in, the cut to the demo |
| `sting` | the logo |

Each scene type lists its sounds next to its drawing code, using the same cue fields (`src/spec/scenes.tsx`), and `SpecExplainer.tsx` merges them into one cue list. When two sounds land within 3 frames of each other, only the first plays. Set the overall level with `sfxVolume` (default 0.8). The per-sound levels are in `GAIN` in `SpecExplainer.tsx`.
