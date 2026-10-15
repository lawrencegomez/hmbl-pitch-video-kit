# HMBL Pitch Video Kit

A Claude Code skill and video template for making a 30 to 40 second vertical video about a company, to send to
candidates before the first recruiter call. You give Claude the company's brief, phone script, website and founder
LinkedIn links. Claude researches the company, proposes three creative directions, builds the best one with
voiceover, music, motion graphics and one AI video shot, then has two reviewers check it before you see it.

Every video follows the same structure (hook, what they build, founders, what makes them different, traction) but
gets its own look, taken from the company's brand, its own words and its founders' public posts.

## What you need

- A Mac with [Homebrew](https://brew.sh), or a Windows PC with [Git for Windows](https://git-scm.com/downloads/win) and [Scoop](https://scoop.sh)
- [Claude Code](https://claude.com/claude-code)
- A [Higgsfield](https://higgsfield.ai) account with credits (about 45 credits per video)
- A ChatGPT account (for the GPT reviewer that double-checks each video)
- About 3 GB of free disk space

## Install

Open Terminal and paste:

```bash
git clone https://github.com/lawrencegomez/hmbl-pitch-video-kit.git ~/hmbl-pitch-video-kit
cd ~/hmbl-pitch-video-kit
./setup.sh
```

**On Windows:** install Scoop first. Open PowerShell (a normal window, not as admin) and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

Then open **Git Bash** (it comes with Git for Windows, and it's the shell Claude Code uses on Windows) and paste
the same three lines as above. Windows symlinks need admin rights, so the setup links the skills with folder
junctions instead, which don't.

The setup script installs the exact tool versions this kit was built with, so your videos come out the same as
everyone else's. It installs Node 24.15.0, ffmpeg, ImageMagick, potrace, Scrapling 0.4.15, the Higgsfield CLI,
the Codex CLI, the video packages, the Whisper caption model and three Claude Code skills (this one, `humanizer`
and `slopmonster`). It then opens two logins in your browser, Higgsfield and ChatGPT, and finishes with a full check
and a test render.

When it prints **All set**, restart Claude Code.

You can also let Claude Code do the install: paste the three lines above into Claude Code and ask it to run them
and walk you through the logins.

## Make a video

In Claude Code, say something like:

> Make a pitch video for Acme. Here's the brief, the phone script, their website and the founders' LinkedIn profiles.

Attach or paste the brief and phone script, and include any real photos of the founders you have. Claude follows
the skill from there and gives you an MP4 in `out/`.

## Keep it working

- `./setup.sh --check` checks everything without changing anything.
- To update: `git pull && ./setup.sh`

## Company data never goes to GitHub

Research, briefs, phone scripts, photos, voiceovers and finished videos are saved in `companies/`,
`src/companies/<company>.ts`, `out/` and `review/`. All of those are ignored by git, so they stay on your Mac. Don't
force-add them, and don't put company names or facts into the shared files (`src/scenes/`, `PLAYBOOK.md`, the skill).

## What's inside

| Path | What it is |
|---|---|
| `skill/hmbl-company-pitch-video/` | The Claude Code skill: process, research guide, creative-direction guide, review guide |
| `PLAYBOOK.md` | Commands, settings, costs and lessons learned |
| `setup.sh` | Installs and checks everything |
| `src/` | The video template (Remotion). `src/companies/_example.ts` shows the data each video needs |
| `tools/transcribe.mjs` | Word timings for captions, run locally |
| `STYLE-REGISTRY.example.md` | Template for the local log of past video looks, so new videos don't repeat old ones |
