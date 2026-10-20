---
name: hmbl-launch-video
description: Make a product launch video (an announcement film for a new app, feature or release) for YouTube, X and Instagram, in the style of nine launches Lawrence likes (Wabi, Photon, Selfdrive, Offhand, Letra, Odessia, Ollie, Kylon, Interface). Opens by showing what the reference library knows and which references fit, uses the same foundation as the pitch video kit (research, three concepts, script and storyboard approved before anything is spent, style frames, review loop), then builds with the kit's launch parts in Remotion. Trigger on "launch video", "product launch", "launch film", "announcement video", "the launch style", "like the Wabi / Photon / Selfdrive video", or questions about those reference launches. This is Lawrence's default for launch videos; HeyGen's separate `product-launch-video` skill (HyperFrames) runs only when he names it.
---

# Product launch video

A launch video announces a product and asks for action: try it, download it, join the waitlist. It lives on YouTube,
X and Instagram, so it must work with the sound off, in the first two seconds, and at phone size.

## Where things are

- **Kit folder:** `KIT="$(cd -P ~/.claude/skills/hmbl-launch-video/../.. && pwd)"` (the HMBL pitch video kit).
  `source "$KIT/bin/env.sh"` before node or higgsfield. Mechanics (Higgsfield commands, music check, stills, gotchas):
  `$KIT/PLAYBOOK.md`.
- **The reference library:** `references/library.md` (this folder). The nine launches beat by beat, the launch bar,
  every signature move mapped to the kit part that does it, and code vs Higgsfield vs a shoot. Read it first, every
  time. Their frames live only on Lawrence's Mac in `~/launch-references/` (never commit them).
- **Launch parts:** `$KIT/src/launch/` (`theme.ts` = looks and motion curves, `parts.tsx` = the parts, `Sampler.tsx`
  = a 33 s film using every part). Preview: `npx remotion studio` (a free port, never 3000), ids `launch-sampler` and
  `launch-sampler-dark`.
- **Shared foundation from the pitch skill** (`~/.claude/skills/hmbl-company-pitch-video/references/`): `research.md`
  (facts and vibe), `creative-direction.md` (three concepts, scoring), `edit-craft.md` (the first 3 seconds, motion
  that is smooth and on its cue, cuts that flow, the video direction note, checks; read it every time), `review.md`
  (the review loop).
- **Credit:** the story orders, hook types, extra moves and the motion and cut rules are adapted, in our words, from
  HeyGen's HyperFrames `product-launch-video` skill (2026-10-19). That skill is a different tool: never run it
  unless Lawrence names it. Its house rules for candidate pitch videos (order, captions, Maya, "That's
  <Company>.") do NOT apply here.

## Step 0: when he says "launch video", open with what we know

Before any questions, give him a short read he can react to:
1. The launch bar in five lines (from the library), and the shape: promise, one real task, 3 to 6 feature beats
   (line + proof), proof numbers, where and how much, logo + URL.
2. **Which 2 or 3 references fit this product and why**, with the move to borrow from each ("Selfdrive's line ladder
   for the five features, Photon's counter over a wall of their real messages for the proof").
3. The choices to make: the story order and the hook type (both in the library, each with the reference that uses
   it), length (25 / 55 / 85 s), sizes, look, narrator or words only, Higgsfield bookends or not.
When he asks about a reference ("how did Photon do the counter?"), answer from the library, name the video and the
beat, and point to the local strip or timeline image if one exists.

## The launch format

- **Lengths:** 20 to 30 s (an offer), 50 to 67 s (the main launch), 80 to 90 s (YouTube walkthrough, may be narrated).
- **Sizes:** 16:9 1920x1080 for YouTube and X (built today); 9:16 for Reels and Shorts and 4:5 for the Instagram
  feed come from the same scenes with their own layouts (not built yet: build them the first time they are needed).
- **Script:** words on screen carry it. One idea per line, 3 to 9 words, built word by word, held long enough to read.
  Every feature gets one line and a real product screen proving it. One real task followed start to finish. One gag.
  The end is an offer (URL, price, platforms, date, free credits). Narrator only for the long YouTube cut, and then
  Maya by default.
- **Cuts:** every seam is a `Beat` edge (`edit-craft.md` "Cuts that flow"): `zoom` into a new section, `slide`
  between beats that build one idea, `zoomBack` for the arrival (the logo). Each cut's `to` equals the next `from`, and
  the next beat's first line starts a few frames before its cut so no frame at a seam is empty.
- **Vertical for social (9:16):** keep the bottom ~17% and the right edge clear of the Reels / Shorts / TikTok
  buttons and caption.
- **Looks** (`LOOKS` in `theme.ts`): `keynote` (white, one blue), `dark` (dark mode, one blue), `editorial` (cream
  paper, navy ink, serif available). Take the accent from the product's brand.
- **Music:** one steady Sonilo bed (~2.25 credits). Run the PLAYBOOK music check: if it changes section partway,
  loop a steady 4 or 8 bar stretch (cut on the beat grid) instead of buying another. Fade in over 2 to 3 s, fade out
  under the logo, about -14 LUFS for social. Beat-locked cuts (Selfdrive) only when he picks that style. A local bed
  stays out of git (see `BED` in `Sampler.tsx`).
- **Product truth:** only the product's real screens, real app icon and real logo. A spot with no real asset stays a
  labeled slot: ask for it, never render a fake product. Real faces only, never generated.

## His taste (2026-10-19, after the first sampler: "really strong")

- **Icons are real emoji, never drawn shapes.** The drawn icons "look a little cheap". Use emoji characters in icon
  slots (`icons={{app: ['💬', '📱']}}`, they render as Apple's on a Mac), the product's real app icon as an image,
  or Microsoft's Fluent 3D emoji (MIT) when a client needs zero licence risk (Apple's emoji are Apple's artwork).
- **Crisp, always.** Render masters with `--crf=16`; the phone copy stays 1920x1080 (`-crf 20`, never shrunk to
  720p). For a YouTube master he wants extra sharp, render `--scale=2` (4K). Keep UI text at 28 px or more at 1080p
  so it survives compression.
- The sampler's pacing, the white keynote world, the pull-back on the giant line and the lockup all landed.

## Process (the same foundation as the pitch kit)

1. **Intake:** what the product is, who it is for, the launch offer (URL, price, date, platforms), real screens or a
   screen recording, app icon, logo, brand colours. `mkdir -p "$KIT/companies/<slug>"` (gitignored).
2. **Research** with `research.md`: facts with sources and the brand's vibe. Scrapling first for public pages.
3. **Step 0 read + three concepts** (`creative-direction.md`), each naming its reference moves from the library.
   Pick one, runner-up in one line.
4. **Script + storyboard, then STOP for his yes.** The video direction note at the top (`edit-craft.md`). Script
   lines with word counts; one row per beat: seconds, its job (hook, problem, product, feature, benefit, proof, offer)
   and the feeling it should leave, the line, what is on screen, the kit parts used, the cut into the next beat, the
   reference it borrows from, assets needed and credits. If he pasted a script, ask once: keep his words or rewrite. Writing rules:
   no em or en dashes, humanizer (embedded mode), then SlopMonster (score; the cleanse is fine when the copy has no
   personal details). Nothing that costs credits or builds the video before his yes.
5. **Style frames, STOP again:** build with estimated timings, render 8 to 12 stills (`node tools/stills.mjs <id>
   out/<id>-stills <frames...>`), one labeled board. Assets only after his yes.
6. **Build:** a new composition file per launch (`src/companies/<slug>-launch.tsx` exporting
   `{id, component, durationInFrames, width, height}`, gitignored, registers itself), wrapped in `Stage`, built from
   `parts.tsx`. A move that is "not built yet" in the library gets built as a shared part in `parts.tsx` (no product
   names in shared code).
7. **Review:** stills board, `tools/check-frames.sh <video> <cut seconds...>` plus frame strips through every cut
   (ffmpeg select, no drawtext on this build): before and after each cut agree, no empty frame,
   Emil's motion bar (`~/.claude/skills/review-animations/STANDARDS.md`: never scale from 0, exits start fast, linear
   only for constant motion), loudness on the final MP4, sound-off read. Fresh reviewer and GPT for a new launch.
8. **Deliver:** `out/<id>.mp4` (crf 16), the 1080p phone copy as a file card, a localhost link. Remotion is free for
   companies of up to 3 people; a client with 4+ needs a Remotion company licence for a commercial render, so ask
   whose launch it is before the final render.
9. **Share back** what applies to every launch (a new part, a lesson) with no product names: `git add` only those
   files, commit, and push only on his say-so.

## Gotchas (learned building the parts)

- Text is measured during render; anything that measures must sit inside `Stage`, which holds the frame until the
  fonts load (measuring on the fallback font came out ~11% narrow and overlapped the lockup).
- An inline SVG inside a big headline sits on the text baseline and drops; give its box `display: flex; line-height: 0`.
- Two words crossfading in one spot smear; roll them through a clipped window (`WordSwap`).
- Accent markers span words: `"*like you would.*"`.
- A typewriter must show its caret on frame 0 (`at={0}`), or the video opens on a blank frame.
- `land()` is critically damped on purpose (same speed as the old spring, no 7.9% overshoot). Keep it that way;
  a bounce needs a reason written in the storyboard.
