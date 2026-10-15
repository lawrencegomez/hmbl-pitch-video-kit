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
| **Graphic language** | Hand-drawn strokes · clean vector diagrams · UI recreated in code · paper / collage cutouts · blueprint lines · terminal / code · 3D-ish depth cards · data-viz first |
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
