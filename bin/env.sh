# Puts this kit's Node version (and the Higgsfield + Codex CLIs installed under it) on PATH.
# Use before any node / npx / higgsfield / codex command:  source <kit>/bin/env.sh
_KIT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    # Windows (Git Bash): fnm's shell hook prints Windows paths that Git Bash's PATH can't use, so put this
    # Node's folder and npm's global folder (higgsfield, codex) on PATH directly, converted to Git Bash form.
    _NODE_DIR="$(fnm exec --using="$(cat "$_KIT/.node-version")" node -p "require('path').dirname(process.execPath)" 2>/dev/null | tr -d '\r')"
    [ -n "$_NODE_DIR" ] && export PATH="$(cygpath -u "$_NODE_DIR"):$PATH"
    _NPM_GLOBAL="$(npm prefix -g 2>/dev/null | tr -d '\r')"
    [ -n "$_NPM_GLOBAL" ] && export PATH="$(cygpath -u "$_NPM_GLOBAL"):$PATH"
    ;;
  *)
    eval "$(fnm env --shell bash 2>/dev/null || fnm env 2>/dev/null)"
    fnm use --silent-if-unchanged "$(cat "$_KIT/.node-version")" >/dev/null 2>&1 || fnm use "$(cat "$_KIT/.node-version")"
    ;;
esac
export PATH="$HOME/.local/bin:$PATH"
