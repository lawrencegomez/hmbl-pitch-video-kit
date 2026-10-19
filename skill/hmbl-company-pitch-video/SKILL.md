---
name: hmbl-company-pitch-video
description: Make a 30-40 second vertical (TikTok / Reels shaped) pitch video about a client company to send to candidates before the first recruiter call. Researches the company's facts AND its vibe (own words, founders' public posts, brand colours and type), pitches three distinct creative concepts, gets the hook, script and a section-by-section storyboard approved before spending anything, builds it in Remotion with Higgsfield voice, music and a hero clip, then runs a multi-reviewer audit loop. Trigger on "pitch video", "candidate video", "company video", "explainer video for <company>", or a brief + phone script handed over with a request for a video.
---

# HMBL company pitch video

HMBL Talent recruiters send each candidate a short video about the company before the first call, so the call
starts from understanding instead of a cold pitch. One video per client company. Role-agnostic: it sells the
company, never a specific role.

## Where things are

- **Kit folder** (code, playbook, setup): the repo this skill lives in. Find it with
  `KIT="$(cd -P ~/.claude/skills/hmbl-company-pitch-video/../.. && pwd)"`.
- **Mechanics** (exact commands, Higgsfield flags, costs, gotchas): `$KIT/PLAYBOOK.md`. Read it before starting.
- **Past looks on this machine:** `$KIT/STYLE-REGISTRY.md` (local only, never committed).
- **Before running node / npx / higgsfield / codex:** `source "$KIT/bin/env.sh"` (pins Node 24.15.0).
- **If anything is missing:** `"$KIT/setup.sh" --check`, then `"$KIT/setup.sh"` to fix.
- **What Lawrence likes, dislikes and has had changed:** `references/taste.md`. Read it before the concepts and the
  storyboard; it outranks your own taste.
- **Story, pacing and checks** (the first-3-seconds test, one open question answered on screen, timing to the words,
  evidence over decoration, narration and loudness checks; adapted from Nate Herk's editing playbook):
  `references/edit-craft.md`. Read it with `taste.md`; the house rules and taste win where they differ.
- **The look is Bright Vox, put together the Herk mix way, by default** (Lawrence, 2026-10-18): every video, unless
  he asks for something else up front. The Herk mix (PLAYBOOK "Herk mix", parts in `src/voxa/herk.tsx`) = one world
  the camera hops through, an empty slot planted in the hook and filled at the close, sticker cut-outs, chapter tags,
  a timeline ruler when the story has dates, stop-motion growth. Load the `vox-style-video` skill for the techniques, then follow PLAYBOOK "Bright Vox: the standard look"
  (what is on, what is off, the Vox element menu) and build from `src/voxa/kit.tsx`. Full newspaper Vox (Mode A) or
  a plain style only when he says so. The house rules below still apply.

## The one idea that matters

Every video shares a **skeleton** (fixed, so candidates always get the same five takeaways) and has its own
**skin** (free, so no two videos look or sound alike). The skeleton is the house rules below. Everything else is
decided fresh from research about that company. The code in `src/scenes/` is a working starting kit (a "tab chaos"
hook, hand-drawn strokes, a cream palette, an Instrument Serif headline): treat it as an example of the craft bar,
not the look. Reusing any of it needs a reason rooted in the new company.

## House rules (fixed; settled by HMBL, do not re-litigate)

- **Order:** hook -> what they build -> founders -> why it's different -> traction -> close. 30-40 s total; up to
  ~42 s is fine when every second carries motion (Lawrence, 2026-10-16).
- **Five takeaways** a candidate must get with sound off: what it does, who founded it and why they matter, what
  makes it different, traction (customers / revenue speed / funding / team size), where they are.
- **Hook:** motion graphics, never a stock photo. A different hook type and visual idea per company.
- **Close:** "That's <Company>." + logo + the hero clip. **No call to action, no URL.** The end logo is the
  company's real logo, the same one shown earlier in the video; a hero clip must never be a re-imagined version of
  the logo (it reads as "a different logo", 2026-10-17).
- **Captions:** small (46 px) and low (top y 1470), plain words with no per-word highlight (`<Captions plain>`;
  Lawrence 2026-10-17: the moving highlight "doesn't move smooth enough"), hand-set phrase lines.
- **Voice:** Maya (Higgsfield `elevenlabs_v4`, id in PLAYBOOK), sped up 1.1x; Arthur only if Lawrence asks for another
  voice, never Brooks. A bold-claim hook can be read serious
  and matter of fact (its own take, spliced in; PLAYBOOK "Voice"), then the upbeat read from the next scene. If this machine has its own ElevenLabs key
  (`node tools/voice.mjs --list` works), use `tools/voice.mjs` with the default voice saved there instead; ask once which voice if none is saved. No sound effects. Music bed from
  Higgsfield Sonilo: one steady groove the whole way (no build, no drop). Check the bed for section changes before
  using it and loop its opening bars if it shifts (PLAYBOOK "Music").
- **Facts:** only sourced facts. Leave out anything the phone script marks "to confirm" unless the recruiter clears
  it, and say so. Revenue is shown as **speed**, in the source's own words (e.g. "$0 in January to $1M by March").
- **People:** real photos only (LinkedIn, company site, photos the recruiter supplies). Never AI-generate a real
  person's face.
- **Layout:** content centred on the true middle of the 1080 frame (x 540), inside x 60-1020. These videos go straight to candidates, not onto TikTok, so there is no right-hand button rail to dodge (Lawrence, 2026-10-15). Scenes drawn for the old 60-940 box are shifted by `NUDGE_X` in `src/theme.ts`.
- **Cost:** about 45 Higgsfield credits per video. Ask before going much above that.
- **Company data stays local.** Research, briefs, phone scripts, photos, audio and renders live in the gitignored
  `companies/` and `src/companies/<slug>.ts`. Never commit them, never paste them anywhere public.

### Writing rules (all on-screen text and the voiceover)
- No em dashes or en dashes anywhere a viewer sees. Use a comma, colon or full stop.
- Run the `humanizer` skill on the script and every on-screen line (its embedded mode: output only the final text).
- Then score with SlopMonster, locally only: `python3 ~/.claude/skills/slopmonster/tools/deslop.py --text "<script>"`.
  **Do not run its cleanse step**: that sends text to OpenAI and the script names client contacts (the founders).
- Plain spoken English. No hype words, no "not X, but Y", no padding in threes. Never invent a fact to sound better.

### Research rules
- Public websites: Scrapling first (`scrapling extract get URL out.md`, plain fetcher). No paid scraping APIs.
- LinkedIn: only public pages a logged-out visitor sees (company page, founder profiles, their public posts and
  articles), one page at a time, plain fetcher, no login, no cookies. Stop on HTTP 999 or a login wall.
  Never LinkedIn Recruiter, never people search, never anything logged in.

### Working rules
- Prove it before saying done: look at rendered frames yourself and report what you checked.
- Report in plain language to the recruiter: what was done, did it work, what is next.

## Process

### 0. Get the latest kit (every time, first)
`git -C "$KIT" pull --ff-only --quiet`. If it fails (local edits in the way, or offline), say so in one line and
carry on with the local copy; never discard local changes to force it.

### 1. Intake (2 min)
`mkdir -p "$KIT/companies/<slug>"/{research,assets/{web,founders,audio,gen}}`. Collect what the recruiter sent:
brief, phone script, logo, site, founder LinkedIn URLs, any photos. Note the phone script's "to confirm" items now.

### 2. Research: facts AND vibe (10-15 min)
Follow `references/research.md`. Two outputs in `companies/<slug>/research/`:
- `facts.md`: every usable fact with its source, plus a "do not use" list.
- `vibe.md`: how this company sounds and looks, with evidence (quotes, hexes, fonts, image style, founder voice,
  what the name evokes, who their customers are). This is what makes the video theirs.

### 3. Creative direction: three concepts, pick one (5 min)
Follow `references/creative-direction.md`. Write three genuinely different concepts into
`companies/<slug>/concepts.md`, each setting every variation dial. Check each against STYLE-REGISTRY.md. Score and
pick one; it goes to the recruiter inside the storyboard (step 4), with the runner-up in one line.

### 4. Script + storyboard, then STOP for the recruiter's yes (10 min)
Write the hook first (`references/creative-direction.md`, "The hook"), then the script: 85-100 words in the house
order ("Script" in the same file). Humanizer, then the local SlopMonster score. Phonetic spellings go in the voice
text only (spell a name the way it sounds, e.g. "Day-vee", when the voice gets it wrong).

Then write `companies/<slug>/storyboard.md` and show it to the recruiter in the chat, short enough to read on a phone:
- **Hook options:** 2-3 opening lines, each with its hook type and what is on screen in the first 2 seconds. Mark
  your pick, and say why it passes the first-3-seconds test (`references/edit-craft.md`).
- **The script**, with its word count and estimated length (about 3.1 words a second after the 1.1x speed-up).
- **One row per section:** seconds · the voice line · what is on screen · **the Vox elements it uses and where they
  sit**, in the plain names of PLAYBOOK's "Vox element menu" (e.g. "hidden cut: push into the map", "yellow
  highlight: behind 10,500 on the top card") · assets it needs (and their credits) · the source of every fact in it.
- **Other Vox options:** 3-5 menu elements this video does not use yet, each with the section it would suit and
  what it would add, so Lawrence can swap one in (his ask, 2026-10-18).
- **The world and the empty slot** (Herk mix): what the camera travels through and in what order (left to right
  toward today), the chapter tag for each section, and what the hook plants as an empty outline that the close fills.
- **Concept** in 3-4 lines (look, motif, signature moment) and the runner-up in one line.
- **Credits** for the whole video.

**Nothing that costs credits or builds the video happens before the recruiter approves** (Lawrence's rule,
2026-10-16): no voice, music, images or Seedance clip, and no composition code. Research and free look-ups (their
screenshots, product clips, map tiles) are fine. Apply their changes to the storyboard and re-show the changed rows
until they say yes. Writing the script, the sections and what each one shows up front is what makes the build fast
and keeps it from being rebuilt.

**Revisions follow the same gate:** when the notes change the script or what a section shows, send the updated
storyboard with the changed rows marked and wait. A fix the recruiter already spelled out exactly (a bigger stamp, a
label moved) can go straight to the build.

### 4b. Style frames, then STOP again (free, ~20 min)
After the storyboard yes, build the composition with estimated word timings (a stand-in `words_est.json`, about 3.1
words a second) and render 8-12 stills of the key moments, one per section, with `node tools/stills.mjs <slug> out/<slug>-style-frames <frame> ...`
(bundles once, renders many frames). Put them on one board (`magick montage`, PLAYBOOK "In review") with a label
under each still: the section and seconds, then the Vox elements in it and where they sit, in the menu's plain names.
Under the board, repeat the "Other Vox options" list (update it if the storyboard notes changed it). Show the
recruiter the look before anything is spent. Apply their notes, then go to assets only on their yes (Lawrence's process, 2026-10-17: "write the
script ... I will approve, then you will create images first to give me style details, and then we will create the
full video").

### 5. Assets (start the slow ones first)
Hero clip (Seedance, ~10 min) in the background first, then voice, music (prompt from `vibe.md`), stills, logo
trace, product screens from their own site. Commands in PLAYBOOK.

### 6. Build (20-40 min)
Copy `src/companies/_example.ts` to `src/companies/<slug>.ts` (it becomes video id `<slug>` automatically) and
fill it. **Theme and scenes come from the concept:** set the company's palette and fonts, write a new Hook scene
for the concept, and restyle or rewrite any scene whose look would repeat the registry. Shared parts that stay:
`Captions`, `Scene`, `Hand` (drawn strokes), theme helpers, safe-zone values. Keep `src/scenes/` free of company
names and facts, since that folder is shared code.

### 7. Review loop (every version)
Follow `references/review.md`: the frame checks (`tools/check-frames.sh`: centring and every transition), your own look at a 16-frame sheet, a fresh Claude reviewer, GPT
(`codex exec -m gpt-6-astra`), plus the sameness check against past videos, plus the edit-craft checks (first second
frame by frame, narration re-transcribed against the script, loudness on the final MP4; `references/edit-craft.md`).
Verify each finding against the sources before acting. Re-render and re-review until no high-severity items remain.
Small revisions (a few exact fixes): your own frame checks are enough; save the two outside reviewers for a new video
or big changes, since Lawrence wants revision rounds fast. Offer the live preview (`npx remotion studio`, a free port,
never 3000) when he is making many small tweaks.

### 8. Deliver
`out/<slug>-final.mp4` plus a local link (`python3 -m http.server <free port> --bind 127.0.0.1 --directory "$KIT/out"`).
Also send a phone-size copy (crf 23, ~11 MB) as a playable file card so it reaches the recruiter's phone. When they
want to keep it, copy the final to `~/Downloads/<Company> pitch video.mp4`.
Add a row to STYLE-REGISTRY.md and save `review/<slug>-final-sheet.png`.

### 9. Share improvements back (keeps every recruiter's kit current)
If this video taught something that applies to every future video (a PLAYBOOK lesson, a better shared component,
a new reusable scene, a skill fix), put it in the shared files with **no company names or facts**, then:
`git -C "$KIT" add <only the shared files you changed>` (never `git add -A`), commit with a plain message, and
`git -C "$KIT" push`. The pre-commit guard blocks company data (it checks the names in STYLE-REGISTRY.md and
`companies/`); if it blocks, remove the company detail, don't bypass it (`--no-verify` is not allowed).
If the push is refused (no write access to the repo), leave the commit local and tell the recruiter which lesson
to send to the repo owner.
