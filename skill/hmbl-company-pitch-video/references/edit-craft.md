# Edit craft: story, pacing and checks

Adapted from Nate Herk's editing playbook (github.com/nateherkai/herk-edit-kit, MIT), keeping the parts that fit a
narrated, generated pitch video. The house rules in SKILL.md and Lawrence's taste (`taste.md`) win wherever they
differ; "Not for pitch videos" at the end names the clashes. Read this with `taste.md` before the concepts.

## The first three seconds (the first test, before any polish)
- Ask: "In the first 3 seconds, is a candidate convinced to watch to the end?" Write down why: the benefit, the open
  question, and what is on screen by second 3. Effects and polish come after this test.
- The first frame already means something: the company's claim, a startling number, the problem in motion. No logo
  bumper, no build-up, no flash for its own sake.
- It must work muted: by second 3 the viewer knows the topic and has seen a second state change.
- In the storyboard, each hook option says what is on screen at 0 s, 1.5 s and 3 s, so the options compare on that.

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

## Narration
- Level every voice take to the same loudness before mixing; limit only the peaks. Scaling a whole line down to fit
  its loudest peak made one line 5 dB quieter in Nate's builds.
- Before every render, re-transcribe the full narration and compare it with the script: every word whole, nothing
  clipped at a splice. A transcript can guess a clipped word correctly while a listener hears it broken, so also
  listen at each splice.
- Don't play the narrator over footage of a real person talking (a founder clip): viewers think that person is
  speaking in the AI voice. Cut away, freeze, or show a still.
- Never fade or clip the last spoken word.

## Measure the delivered file
- Measure loudness on the final encoded MP4, in stereo, not on a WAV or a preview (a mono file reads 3 dB lower):
  `ffmpeg -i out/<slug>-final.mp4 -af loudnorm=print_format=summary -f null - 2>&1 | grep -E 'Input (Integrated|True Peak)'`
- Nate's targets: about -14 LUFS, true peak at or below -1.5 dBTP. Report the numbers in the review. Past pitch finals
  measured about -21 LUFS (2026-10-18), so they play noticeably quieter than social video. Raising the level is
  Lawrence's call: ask before normalizing, and if he says yes, normalize the whole mix (never only the music). Keep
  the house music gain either way.

## Checks to add to every review (with `review.md`)
- Read the first second frame by frame, and contiguous strips around every cut (about 10 frames each side). One-frame
  flashes, pops and a move that stops then restarts only show between frames. `tools/check-frames.sh` covers the
  transitions.
- Read key frames at phone size, by eye. More text on screen is not more legible.
- Check the assembled final, never a single-scene preview: most leftover bugs exist only in the assembly.
- A check that has never failed proves nothing. When you add a new automated check, run it once on a broken render.
- AI reviewers surface candidate problems but are noisy: confirm each on real frames. A persona question ("would this
  candidate finish? where would they stop?") beats a 1-10 score.
- Lawrence's watch is the final gate. Nate caught a sync drift that every automated check missed.

## Notes become rules
When Lawrence gives a note, fix the video, then write the note as a rule into `taste.md`, PLAYBOOK or a check
(SKILL step 9), so the next video starts from it. Record the note and the rule together.

## Not for pitch videos (house rules win)
- Nate's caption look (1-3 word chunks in a dark box, coloured words): house captions are plain, small and low.
- Sound effects: the house rule is no sound effects.
- A call to action or a comment keyword: the house close has none.
- His talking-head reel numbers (speaker on screen 45%, split layouts, punch-ins): pitch videos have no presenter.
- His "Vox explainer" card pack (newsprint, halftone cutouts, stop-motion, his brand blue) and the AI Automation
  Society brand files: the standard here is Bright Vox, and those brand files are not licensed for reuse.
- His sizzle-reel rules (a new font every scene, chrome text on black, 1.5 s scenes): a reference for brand reels, not
  for pitch videos.
