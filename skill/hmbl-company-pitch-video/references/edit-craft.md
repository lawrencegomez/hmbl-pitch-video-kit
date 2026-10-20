# Edit craft: story, pacing and checks

Adapted from Nate Herk's editing playbook (github.com/nateherkai/herk-edit-kit, MIT), keeping the parts that fit a
narrated, generated pitch video, plus the motion, cut and storyboard rules from HeyGen's HyperFrames launch skill
(2026-10-19, written in our own words). This is the shared foundation: the pitch skill and the launch skill
(`hmbl-launch-video`) both read it, and it applies to every video the kit makes. The house rules in SKILL.md and
Lawrence's taste (`taste.md`) win wherever they differ; "Not for pitch videos" at the end names the clashes. Read this
with `taste.md` before the concepts.

## The first three seconds (the first test, before any polish)
- Ask: "In the first 3 seconds, is a candidate convinced to watch to the end?" Write down why: the benefit, the open
  question, and what is on screen by second 3. Effects and polish come after this test.
- The first frame already means something: the company's claim, a startling number, the problem in motion. No logo
  bumper, no build-up, no flash for its own sake.
- It must work muted: by second 3 the viewer knows the topic and has seen a second state change.
- In the storyboard, each hook option says what is on screen at 0 s, 1.5 s and 3 s, so the options compare on that.
- The hook speaks the viewer's gain, never a feature list, and the one main promise (what this is, in a line) lands
  by the second beat. Everything after it is evidence for that promise.

## One open question, answered on screen
- Plant one visible, unfinished thing in the hook (an empty slot, a blank map, a half-built stack, a counter at zero).
  Never say "more on that later".
- Show it again briefly at a section change, a little more complete each time.
- Close it before the logo, and let the close echo the hook image when the concept allows. A thing that reappears
  without changing is a callback, not an answer.
- One main question at a time, at most one small side question.

## Every scene earns its place
- One idea per scene. If it says two things, split it or cut one.
- For each storyboard row, note what the viewer expects next and what new fact or consequence the scene adds.
- Voice and captions already carry the words. Graphics show the evidence, the relationship or the result, not a third
  copy of the same sentence.
- About 20 on-screen words per section, labels of 1-2 words. A shape with no word and no job does not get drawn.
- One thing at full brightness at a time; everything already shown stays quiet but readable.
- Every extended beat is an action with an outcome (a card opens to the result, criteria tick into checks, pieces snap
  into a system). No card that settles and freezes.
- Compare neighbouring scenes with the headings hidden. If two read as the same reveal, redesign the weaker one.

## Timing to the words
- Every graphic event lands within 2 frames of its word, or up to 0.15 s ahead (a punchline may lead by 0.2 s). Use
  the word times in `words.json`, never evenly spaced staggers.
- Each item in a spoken list gets its own reveal on its own word.
- Rhythm by sequence: a quick run of discoveries, a short breath, then the payoff. A 1-2 s pace is a check, not a
  metronome.

## Evidence over decoration
- Real before generated: their product screens, their posts, press headlines, real photos. A generated clip adds
  surprise but never stands in for proof.
- A still with a camera move is a photo layer, not footage. Fine for Vox photo treatments; never pass a generated
  still off as real.
- A whole web page shrunk to phone size is unreadable: crop to the phrase and highlight it on the spoken word. Small UI
  floating in empty space is the fastest "AI edit" tell; zoom it to fill its panel.
- AI video models often switch camera angle around 2.5-3 s and turn screen text into gibberish. Use the first
  continuous seconds and check the corners of every frame used.
- Logos: the real file from the company's site or media kit, never redrawn or approximated. Never invent a number or a
  result to make a payoff land.
- A website is shown as its real screenshot, never rebuilt in code: even a close copy changes the spacing and the
  brand. To move through a page, pan over one full-page screenshot; rebuild only the single piece that has to move.

## Narration
- Level every voice take to the same loudness before mixing; limit only the peaks. Scaling a whole line down to fit
  its loudest peak made one line 5 dB quieter in Nate's builds.
- Before every render, re-transcribe the full narration and compare it with the script: every word whole, nothing
  clipped at a splice. A transcript can guess a clipped word correctly while a listener hears it broken, so also
  listen at each splice.
- Don't play the narrator over footage of a real person talking (a founder clip): viewers think that person is
  speaking in the AI voice. Cut away, freeze, or show a still.
- Never fade or clip the last spoken word.
- When Lawrence pastes a script of his own, ask once: keep his words exactly, or rewrite to fit the length and the
  beats. Then write every line as separate cues (one piece on screen per cue), not one long breath.

## Motion: smooth, on its cue, or still
- **Smooth, never bouncy.** Things settle on a long, smooth ease with no overshoot. Bounce is the first thing that
  makes a video look cheap. A bounce is allowed only when it is the point of that one moment (a playful logo hit), and
  the storyboard says so. Check the frames right after an entrance: nothing grows past its final size and springs
  back. (The launch parts' spring overshot 7.9% until 2026-10-19 and is now critically damped: same speed, no bounce.)
- **On its cue.** At the start of a scene, show only what the words are saying right then; each further piece arrives
  when the line names it. The whole layout landing in the first quarter of a scene and then sitting there is the
  slideshow look.
- **Still beats fake motion.** No "breathing" (scaling up and down to look alive), no slow drift or push in the second
  half of a scene: it pulls the eye around and reads cheap. A held frame is fine, and a held beat before a payoff is
  good rhythm. A tiny jitter is the most a hold needs.

## Cuts that flow
- **Cut while moving, and keep the motion going.** Both sides of a cut move the same way at the same speed, so the eye
  rides one movement across it:
  - **Slide:** the line leaves accelerating sideways and fades just before the cut; the next arrives already moving
    from the same side and slows into place. The default between beats that build one idea.
  - **Zoom through:** toward the viewer; the swap hides at the peak of the blur. For a new section.
  - **Reverse zoom:** away from the viewer; the incoming piece arrives slightly too big and settles. For an arrival
    or a payoff (the logo, the final answer).
- **Blur at a cut:** about 10 px for text (more smears the letters and reads as a glitch), 18-20 px for a full-screen
  surface. The same peak blur on both sides of the seam.
- **Never two texts on screen during a zoom,** and **no dead air:** the next scene's first piece is already on screen
  at the cut, and the outgoing one finishes fading right at the cut, not a beat early.
- **Two or three cut types per video, repeated.** A new transition in every scene reads as a template sampler.
- Code: `Beat` in `src/launch/parts.tsx` (`enter` / `exit` = `slide`, `zoom`, `zoomBack`) has the numbers.

## The video direction note (top of every storyboard)
Write it once, before the rows, so every scene inherits it and the rows only carry what differs:
- the colours and what each one is for;
- the motion feel (smooth settle, which two or three cut types, where they go);
- the beats that hold still on purpose (a breath before the payoff);
- the never-list: what must not appear (a rebuilt or invented product screen, a bounce, a purple "AI" gradient,
  browser bars and scrollbars, a lone small thing floating in empty space).

## Measure the delivered file
- Measure loudness on the final encoded MP4, in stereo, not on a WAV or a preview (a mono file reads 3 dB lower):
  `ffmpeg -i out/<slug>-final.mp4 -af loudnorm=print_format=summary -f null - 2>&1 | grep -E 'Input (Integrated|True Peak)'`
- Nate's targets: about -14 LUFS, true peak at or below -1.5 dBTP. Report the numbers in the review. Past pitch finals
  measured about -21 LUFS (2026-10-18), so they play noticeably quieter than social video. Raising the level is
  Lawrence's call: ask before normalizing, and if he says yes, normalize the whole mix (never only the music). Keep
  the house music gain either way.

## Checks to add to every review (with `review.md`)
- Read the first second frame by frame, and contiguous strips around every cut (about 10 frames each side). One-frame
  flashes, pops and a move that stops then restarts only show between frames. `tools/check-frames.sh <video> <cut
  seconds...>` covers the transitions, for vertical and wide videos. At each cut, the frames just before and just after
  must agree: same direction, same blur and brightness, nothing popping, and never an empty frame.
- Read key frames at phone size, by eye. More text on screen is not more legible.
- Check the assembled final, never a single-scene preview: most leftover bugs exist only in the assembly.
- A check that has never failed proves nothing. When you add a new automated check, run it once on a broken render.
- AI reviewers surface candidate problems but are noisy: confirm each on real frames. A persona question ("would this
  candidate finish? where would they stop?") beats a 1-10 score.
- Lawrence's watch is the final gate. Nate caught a sync drift that every automated check missed.

## How the giraffe test was put together (the recipe Lawrence loved, 2026-10-18)
1. Facts first, sourced, before any script. Then the script, about 3.1 words a second, through `humanizer`.
2. Voice, then word times (`words.json`). Every beat below is anchored to a word, entering up to 0.15 s early.
3. Pick the world: one board the camera travels through, left to right toward today, with a ruler on the floor
   when the story has dates. Decide the chapters and their numbered tags.
4. The hook opens tight on the subject itself, pulls back, and leaves it as an empty dashed outline with one
   question on it. That outline is the open loop.
5. Each chapter: hop the camera (choppy, under 0.35 s), land the big fact first, then the one detail that proves it,
   then one highlight. Earlier chapters go quiet, never vanish.
6. One physical change per chapter that the viewer can watch (a neck growing in steps, a bar climbing, a stack
   filling), timed to the words that name it.
7. The close hops back to the empty outline and fills it from the ground up while the answer lands; hold it.
8. Check like Nate: frame sheet, contiguous strips across every hop, re-transcribe the final against the script,
   loudness on the final file.

## Notes become rules
When Lawrence gives a note, fix the video, then write the note as a rule into `taste.md`, PLAYBOOK or a check
(SKILL step 9), so the next video starts from it. Record the note and the rule together.

## Not for pitch videos (house rules win)
- The shared `pop()` in `src/theme.ts` still overshoots (9.5%, 8.5% fast; measured 2026-10-19) and drives the
  approved pitch looks, so it stays until Lawrence rules on it. New scenes and new parts use a smooth settle.
- Cut types: the pitch looks keep their own transitions (paper hops, Herk camera hops). Build any new one by "Cuts that
  flow" (same direction, no dead air).
- Nate's caption look (1-3 word chunks in a dark box, coloured words): house captions are plain, small and low.
- Sound effects: the house rule is no sound effects.
- A call to action or a comment keyword: the house close has none.
- His talking-head reel numbers (speaker on screen 45%, split layouts, punch-ins): pitch videos have no presenter.
- His "Vox explainer" card pack (newsprint, halftone cutouts, stop-motion, his brand blue) and the AI Automation
  Society brand files: the standard here is Bright Vox, and those brand files are not licensed for reuse.
- His sizzle-reel rules (a new font every scene, chrome text on black, 1.5 s scenes): a reference for brand reels, not
  for pitch videos.
