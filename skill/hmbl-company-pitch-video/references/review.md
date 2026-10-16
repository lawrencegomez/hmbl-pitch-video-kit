# Review loop

Every version: render, pull frames at 16 timestamps covering every section (full-res singles in
`review/vN/f_<sec>.png`), montage them into `review/vN/sheet.png`, then run three reviewers. Write the brief from
the template below into `review/BRIEF_vN.md`.

0. **Frame checks (before any reviewer):** `tools/check-frames.sh out/<slug>-vN.mp4 <every section start + every
   in-scene phase change, in seconds>`. Open both sheets and look:
   - `review/check/centre.png`: every heading, card, photo and caption sits on the blue centre line (collage
     pieces placed off-centre on purpose are fine; say which ones in your report).
   - `review/check/transitions.png`: each row must go old page, then ONE torn edge, then new page. Fail it if the
     old page shows again after the cut, if two paper edges sweep past, or if both pages are half-visible.
   Reviewers working from a 16-frame sheet miss both of these: they only show between frames.
1. **Me:** look at the sheet before anyone else; fix the obvious.
2. **Fresh Claude reviewer** (Agent, general-purpose; on later rounds resume the same one so it checks its own list).
3. **GPT** for a different model family: `codex exec --skip-git-repo-check -s read-only -m gpt-6-astra -C <project>
   "$(cat review/BRIEF_vN.md)" -i review/vN/sheet.png -i <2-4 key frames> < /dev/null` (prompt BEFORE `-i`;
   `gpt-6.1-sol` is refused on his ChatGPT login).

Verify every finding against the sources before changing anything; about a third are wrong (e.g. a logo that is
on the company's site, their own public demo footage). Final round: ask for high-severity only and stop when both
reviewers say none.

## Brief template

```
# Review brief: <Company> candidate pitch video (draft vN)
WHAT IT IS: a <len> s vertical 1080x1920 explainer a recruiter sends to <role> candidates before a call. After one
watch, sound off, they must know: what it does, the founders and why they matter, what makes it different,
traction, where. Polished, fast, trustworthy.
FILES: review/vN/sheet.png (16 frames; seconds: ...), singles review/vN/f_<sec>.png.
VOICEOVER: <full script>
FACTS AND SOURCES (only these may appear): <from facts.md>
CREATIVE CONCEPT: <the chosen concept block from concepts.md>
PAST VIDEOS: <registry rows> (sheets: $KIT/review/<slug>-final-sheet.png)
REVIEW: concrete defects only, most severe first, max 15. Each: timestamp, problem, why it matters for a
candidate on a phone, exact fix. Cover (1) factual accuracy incl. what visuals imply, (2) legibility at phone
size and the caption zone (bottom ~420 px; content centred on x 540, no TikTok button rail since videos go direct), (3) the five takeaways, (4) polish and pacing,
(5) captions, (6) SAMENESS: anything that reads as a reskin of a past video (same hook idea, motif, layout,
typography, transitions) or that ignores the concept. Skip praise.
```

## Sameness check (also do it yourself)
Put the new sheet next to every past final sheet. If someone glancing at both thumbnails could think they are the
same series with a colour swap, the concept was not carried through: rework the hook, the type, and at least two
section layouts before the next review.
