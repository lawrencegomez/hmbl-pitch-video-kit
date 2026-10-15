# Puts this kit's Node version (and the Higgsfield + Codex CLIs installed under it) on PATH.
# Use before any node / npx / higgsfield / codex command:  source <kit>/bin/env.sh
_KIT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
eval "$(fnm env --shell bash 2>/dev/null || fnm env 2>/dev/null)"
fnm use --silent-if-unchanged "$(cat "$_KIT/.node-version")" >/dev/null 2>&1 || fnm use "$(cat "$_KIT/.node-version")"
export PATH="$HOME/.local/bin:$PATH"
