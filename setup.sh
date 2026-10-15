#!/usr/bin/env bash
# Installs and checks everything the hmbl-company-pitch-video skill needs, pinned to the versions it was
# built and tested with, so every machine renders the same video. macOS + Homebrew, or Windows + Scoop
# (run it from Git Bash, the shell Claude Code uses on Windows).
#
#   ./setup.sh           install anything missing, log in where needed, then run the full check
#   ./setup.sh --check   check only, change nothing (safe to run any time)
#
# Re-running is safe: finished steps are skipped.

set -uo pipefail
KIT="$(cd "$(dirname "$0")" && pwd)"
CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1

NODE_VERSION="$(cat "$KIT/.node-version")"
HF_CLI_VERSION=1.1.17
CODEX_VERSION=0.154.0
SCRAPLING_VERSION=0.4.15
HUMANIZER_REPO=https://github.com/blader/humanizer.git
HUMANIZER_REF=225a6f3
SLOP_REPO=https://github.com/ItsssssJack/SlopMonster.git
SLOP_REF=3fc9787
EMILY_VOICE=6b3e3642-f7b7-4cb8-9688-51e233c4b92f
SKILLS="$HOME/.claude/skills"
SOURCES="$HOME/.claude/sources"

FAILS=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FAILS=$((FAILS + 1)); }
step() { printf '\n\033[1m%s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }
doing() { [ "$CHECK_ONLY" = 0 ]; }
WINDOWS=0
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) WINDOWS=1 ;; esac
# Scoop's ImageMagick adds itself to PATH only in new shells; add it here so this run can use it.
[ "$WINDOWS" = 1 ] && export PATH="$(cygpath -u "${SCOOP:-$USERPROFILE/scoop}")/apps/imagemagick/current:$PATH"

# ---------------------------------------------------------------- install
if doing && [ "$WINDOWS" = 1 ]; then
  step "1. Scoop packages (ffmpeg, ImageMagick, potrace, Python 3.13, pipx, fnm)"
  if ! have scoop; then
    echo 'Scoop is missing. Open PowerShell (normal, not as admin) and run these two lines:'
    echo '  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser'
    echo '  Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression'
    echo 'Then close and reopen Git Bash and re-run ./setup.sh'
    exit 1
  fi
  scoop bucket list 2>/dev/null | grep -q versions || scoop bucket add versions
  # python313 = the same Python the Mac setup runs Scrapling on. Already-installed apps are skipped.
  scoop install ffmpeg imagemagick potrace versions/python313 pipx fnm
elif doing; then
  step "1. Homebrew packages (ffmpeg, ImageMagick, potrace, pipx, fnm)"
  if ! have brew; then
    echo 'Homebrew is missing. Install it first, then re-run ./setup.sh:'
    echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    exit 1
  fi
  for f in ffmpeg imagemagick potrace pipx fnm; do
    brew list --formula "$f" >/dev/null 2>&1 || brew install "$f"
  done
fi

if doing; then
  step "2. Node $NODE_VERSION (via fnm, only used inside this kit)"
  fnm install "$NODE_VERSION"
fi

# Node 24 for everything below (the kit, Higgsfield CLI, Codex CLI).
# shellcheck source=bin/env.sh
source "$KIT/bin/env.sh" >/dev/null 2>&1 || true

if doing; then
  step "3. Higgsfield CLI $HF_CLI_VERSION + Codex CLI $CODEX_VERSION"
  npm install -g "@higgsfield/cli@$HF_CLI_VERSION" "@openai/codex@$CODEX_VERSION"

  step "4. Video code packages (exact versions from package-lock.json)"
  (cd "$KIT" && npm ci)

  step "5. Scrapling $SCRAPLING_VERSION (website reader) + its browsers"
  pipx ensurepath >/dev/null 2>&1 || true
  export PATH="$HOME/.local/bin:$PATH"
  if ! scrapling --version 2>/dev/null | grep -q "$SCRAPLING_VERSION"; then
    if [ "$WINDOWS" = 1 ]; then
      pipx install --force --python python313 "scrapling[all]==$SCRAPLING_VERSION"
    else
      pipx install --force "scrapling[all]==$SCRAPLING_VERSION"
    fi
  fi
  scrapling install

  step "6. Writing skills (humanizer, slopmonster) + this kit's skill"
  mkdir -p "$SKILLS" "$SOURCES"
  clone_at() { # repo ref dir
    [ -d "$3/.git" ] || git clone -q "$1" "$3"
    git -C "$3" fetch -q origin && git -C "$3" checkout -q "$2"
  }
  clone_at "$HUMANIZER_REPO" "$HUMANIZER_REF" "$SOURCES/humanizer"
  clone_at "$SLOP_REPO" "$SLOP_REF" "$SOURCES/slopmonster"
  link_skill() { # target name
    local dest="$SKILLS/$2"
    if [ -e "$dest" ] && [ ! -L "$dest" ]; then mv "$dest" "$dest.backup-$(date +%Y%m%d%H%M%S)"; fi
    if [ "$WINDOWS" = 1 ]; then
      # A junction, not a symlink: needs no admin or Developer Mode, and Git Bash follows it like a symlink.
      [ -L "$dest" ] && cmd //c rmdir "$(cygpath -w "$dest")"
      cmd //c mklink /J "$(cygpath -w "$dest")" "$(cygpath -w "$1")" >/dev/null
    else
      ln -sfn "$1" "$dest"
    fi
  }
  link_skill "$SOURCES/humanizer" humanizer
  link_skill "$SOURCES/slopmonster" slopmonster
  link_skill "$KIT/skill/hmbl-company-pitch-video" hmbl-company-pitch-video

  step "7. Whisper (word timings for captions; ~1.5 GB, downloads once)"
  (cd "$KIT" && node tools/transcribe.mjs --setup)

  step "8. Local files that never go to GitHub + the company-data guard"
  [ -f "$KIT/STYLE-REGISTRY.md" ] || cp "$KIT/STYLE-REGISTRY.example.md" "$KIT/STYLE-REGISTRY.md"
  git -C "$KIT" config core.hooksPath .githooks

  step "9. Logins"
  if ! higgsfield account status >/dev/null 2>&1; then
    echo "Opening the Higgsfield login (use the account that has video credits)..."
    higgsfield auth login
  fi
  if ! codex login status >/dev/null 2>&1; then
    echo "Opening the Codex login (sign in with ChatGPT)..."
    codex login
  fi
fi

# ---------------------------------------------------------------- check
step "Check"
export PATH="$HOME/.local/bin:$PATH"
v() { "$@" 2>&1 | head -1; }

[ "$(node -v 2>/dev/null)" = "v$NODE_VERSION" ] && ok "Node $(node -v)" || bad "Node is $(node -v 2>/dev/null || echo missing), need v$NODE_VERSION (run ./setup.sh)"
have ffmpeg && ok "$(v ffmpeg -version | cut -d' ' -f1-3)" || bad "ffmpeg missing"
have magick && ok "ImageMagick $(magick -version | head -1 | cut -d' ' -f3)" || bad "ImageMagick missing"
have potrace && ok "$(v potrace -v | cut -d. -f1-2)" || bad "potrace missing"
have python3 && ok "$(v python3 --version)" || bad "python3 missing"
higgsfield version 2>/dev/null | grep -q "$HF_CLI_VERSION" && ok "Higgsfield CLI $HF_CLI_VERSION" || bad "Higgsfield CLI is not $HF_CLI_VERSION"
codex --version 2>/dev/null | grep -q "$CODEX_VERSION" && ok "Codex CLI $CODEX_VERSION" || bad "Codex CLI is not $CODEX_VERSION"
scrapling --version 2>/dev/null | grep -q "$SCRAPLING_VERSION" && ok "Scrapling $SCRAPLING_VERSION" || bad "Scrapling is not $SCRAPLING_VERSION"
[ -d "$KIT/node_modules/remotion" ] && grep -q '"version": "4.0.535"' "$KIT/node_modules/remotion/package.json" && ok "Remotion 4.0.535" || bad "Remotion packages missing (run ./setup.sh)"
ls "$HOME/.cache/whisper-cpp/ggml-medium.en.bin" >/dev/null 2>&1 && ok "Whisper medium.en model" || bad "Whisper model missing"
for s in humanizer slopmonster hmbl-company-pitch-video; do
  [ -f "$SKILLS/$s/SKILL.md" ] && ok "Skill: $s" || bad "Skill missing: $s"
done
# The skill finds this kit by following its link back (SKILL.md, "Kit folder"); a copied folder would break that.
[ "$(cd -P "$SKILLS/hmbl-company-pitch-video/../.." 2>/dev/null && pwd -P)" = "$(cd -P "$KIT" && pwd -P)" ] && ok "Skill links back to this kit" || bad "Skill does not link back to $KIT (run ./setup.sh)"
[ "$(git -C "$SOURCES/humanizer" rev-parse --short HEAD 2>/dev/null)" = "$HUMANIZER_REF" ] && ok "humanizer at $HUMANIZER_REF" || bad "humanizer not at $HUMANIZER_REF"
[ "$(git -C "$SOURCES/slopmonster" rev-parse --short HEAD 2>/dev/null)" = "$SLOP_REF" ] && ok "slopmonster at $SLOP_REF" || bad "slopmonster not at $SLOP_REF"
python3 "$SKILLS/slopmonster/tools/deslop.py" --text "This is a quick test sentence." >/dev/null 2>&1 && ok "SlopMonster scorer runs" || bad "SlopMonster scorer failed"

ACCOUNT="$(higgsfield account status 2>/dev/null | head -1)"
[ -n "$ACCOUNT" ] && ok "Higgsfield logged in: $ACCOUNT" || bad "Higgsfield not logged in (run: higgsfield auth login)"
COST="$(higgsfield generate cost elevenlabs_v4 --dialogue "[{\"text\":\"Hi.\",\"voice_id\":\"$EMILY_VOICE\",\"voice_type\":\"preset\"}]" 2>&1 | tail -1)"
echo "$COST" | grep -q credits && ok "Higgsfield can price the Emily voice ($COST, nothing spent)" || bad "Higgsfield voice check failed: $COST"
codex login status >/dev/null 2>&1 && ok "Codex logged in" || bad "Codex not logged in (run: codex login)"

[ "$(git -C "$KIT" config core.hooksPath)" = ".githooks" ] && ok "Company-data guard on (blocks company names in commits)" || bad "Company-data guard off (run ./setup.sh)"
(cd "$KIT" && npm run -s smoke >/dev/null 2>&1) && [ -f "$KIT/out/smoke.png" ] && ok "Test render works (out/smoke.png)" || bad "Test render failed (run: cd $KIT && npm run smoke)"

echo
if [ "$FAILS" = 0 ]; then
  printf '\033[32mAll set.\033[0m Restart Claude Code, then ask: "make a pitch video for <company>".\n'
  echo "Optional: check the GPT reviewer with: codex exec --skip-git-repo-check -m gpt-6-astra 'Reply OK'"
else
  printf '\033[31m%s problem(s) above.\033[0m Run ./setup.sh to fix, then ./setup.sh --check.\n' "$FAILS"
  exit 1
fi
