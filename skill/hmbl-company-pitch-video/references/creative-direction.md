# Creative direction

You are the creative director of a small motion studio. The client has already rejected anything that looks
templated. You have full freedom inside the house rules (SKILL.md). Use `research/vibe.md` as the brief: every
choice below should trace back to something true about this company.

## The variation dials

Each concept sets every dial. Across the three concepts, and against every past video in STYLE-REGISTRY.md,
the dials should differ. A new video must differ from every registry entry on at least: hook visual idea,
central motif, display font, palette, and hero clip subject.

| Dial | Options to think across (not a menu, invent others) |
|---|---|
| **Hook type** | Difference (crowded market) · "Have you heard of this?" (quiet company you've used) · The unique idea (no competitors) · The founders (the people are the story) · A startling true number · A day-in-the-life of the problem |
| **Hook visual idea** | Tab chaos (the starter kit's hook) · teetering tool tower · tangled wires into a knot · a terminal typing itself · a stack of paper forms burning down · a map lighting up · a counter racing · a split-screen before/after · kinetic type only |
| **Central motif** | From the name, logo or product job (e.g. a bird name: flight). One motif, used 2-3 times, never more. |
| **Palette** | Start from their brand hexes. Light or dark base. One accent with intent. |
| **Type pairing** | Their own display font if on Google Fonts, else a pairing with the same character. Never default to the starter kit's Instrument Serif + Inter without a reason. |
| **Graphic language** | Vox collage (see Vox toolkit) · hand-drawn strokes · clean vector diagrams · UI recreated in code · paper / collage cutouts · blueprint lines · terminal / code · 3D-ish depth cards · data-viz first |
| **Motion personality** | Snappy and springy · calm and precise · playful and bouncy · cinematic slow push · glitchy and fast. Match the energy line. |
| **Transitions** | Cuts on the beat · morph one object into the next · whip pans · masks and wipes · zoom through |
| **Hero clip** (Seedance, close) | Something from the motif or their world, real-looking, no real people's faces. |
| **Signature moment** | One beat a candidate will remember (e.g. the problem sucked into the logo; a revenue hockey stick). |
| **Music** | Tempo, instruments and mood from the energy line. Written as a Sonilo prompt. |

## The three concepts

Write each into `concepts.md`:

```
### Concept <A/B/C>: <name>
Energy: <one line from vibe.md>
Hook: <type> / <visual idea> / opening line
Motif: <what, where it appears>
Look: palette <hexes>, type <display + body>, graphic language, base light/dark
Motion: <personality>, transitions <how>
Signature moment: <one beat>
Hero clip: <Seedance prompt in one sentence>
Music: <Sonilo prompt>
Why it fits them: <2 lines, citing vibe.md evidence>
Registry check: differs from <each past video> on <dials>
```

Make the three truly different (e.g. one playful, one precise, one founder-led). Then score each 1-5 on:
**truth** (feels like this company), **clarity** (the five takeaways land with sound off), **freshness** (vs
registry), **feasibility** (buildable well in one session, ~45 credits). Pick the highest total; break ties on truth.

## Vox toolkit (pick and choose; a few touches beat the full treatment)

Vox explainers feel fun because the screen is a desk of real evidence that the camera moves across. Use any of
these as seasoning on top of a concept; a concept can also be "full Vox". Built ones live in
`src/components/vox.tsx` (ready) and the rest are build-on-demand.

| Technique | What it looks like | Ready? |
|---|---|---|
| Paper base | Warm paper texture, faint fibres, soft vignette instead of flat colour | `<Paper>` |
| Film grain | Moving grain over the whole frame, ties every layer together | `<Grain>` |
| 2.5D camera drift | Layers drift at different speeds, slow push-in, so stills feel deep | `<Drift depth>` |
| Sticker cut-outs | People / objects cut from photos (Higgsfield `image_background_remover`, 1 credit) with a thick white outline + drop shadow | `<Sticker>` |
| Torn clippings | Real evidence (launch posts, founder posts, articles) on torn paper, tilted, taped | `<Clipping>`, `<Tape>` |
| Sentence strips | One quote line cut out as its own strip, slid in from the side (great for founder posts) | `<Clipping>` + crop |
| Highlighter sweep | Yellow marker sweeps across the key words of text or a screenshot | `<Highlight>`, `<HighlightBox>` |
| Marker circle / arrows | Hand-drawn red or black loops, arrows and underlines that draw on | `<MarkerCircle>`, `<Draw arrow>` |
| Marker notes | Handwritten labels pointing at things (Permanent Marker) | `voxFonts.marker` |
| Slam headline | Big condensed caps that land with an overshoot and a tiny shake (Anton) | `<Slam>` |
| Typewriter text | Labels that type out (Special Elite) | `voxFonts.type` |
| Halftone dots | Comic-print dot disc or panel behind a subject | `<Halftone>` |
| Tape slap | Strips of tape slapped across a pile (great for "glued together") | `<Tape>` |
| Push into a document | Camera zooms into a screenshot until one line fills the frame | build |
| Map pins / route lines | A map with pins dropping and a line drawing between places (offices, customers) | build |
| Stacked timeline cards | Dated cards that stack or slide along a line (founding, YC, raise, launch) | build |
| Redaction bars | Black bars that wipe off to reveal a number or name | build |
| Split-screen before / after | The old way vs the new way side by side, one side wiped | build |
| Torn reveal | The paper tears open to reveal the next scene | build |
| Photo rotoscope sketch | A photo turns into a pencil outline and back | build |
| Colour isolation | Everything grey except the subject in the accent colour | build |
| Data in hand-drawn form | Charts drawn as marker lines on graph paper, numbers circled | `<Draw>` |

Rules for Vox touches:
- Evidence must be real: screenshots or exact quotes of public sources, with a small source tag. Never fake a
  headline, a post, or a quote.
- Keep the house rules: safe area, small low captions, facts only.
- Two or three techniques per scene is plenty. Highlighter + clipping + drift is the core combo.

## Script

- 85-100 words, house order, plain spoken English a recruiter would say out loud.
- The hook line follows the chosen hook type. It just needs to start the video well, not shock.
- Use their own words where they're good (tagline, the job they replace). One specific, memorable fact per beat.
- Founders: names, the pedigree that matters, and one human detail from their posts if it's true and short.
- Difference: say it the way the founders do, in candidate terms.
- Traction: revenue as speed in the source's words, customers by name if on their site, funding, team, city.
- End: "That's <Company>." Nothing after it.
- No hype words (revolutionary, cutting-edge, game-changing), no "not X, but Y", no triplet padding.
- Humanizer, then `deslop.py --text` score; keep house phrasing even if it trips a rule, and say which.
