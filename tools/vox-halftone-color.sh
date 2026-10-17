#!/usr/bin/env bash
# Colour version of the Vox print look: keeps the photo's colour, puts halftone dots only into the shadows
# (like a printed magazine photo). Keeps the alpha channel. For bright videos where black and white feels gloomy.
# Usage: tools/vox-halftone-color.sh in.png out.png [upscale% = 400] [dot strength 0-100 = 45] [dot map = h6x6a]
set -euo pipefail
in="$1"; out="$2"; up="${3:-400}"; strength="${4:-45}"; map="${5:-h6x6a}"
magick "$in" -resize "${up}%" \
  \( -clone 0 -alpha off -modulate 102,112 -sigmoidal-contrast 2.5x50% \) \
  \( -clone 1 -colorspace gray -level 0%,70% -ordered-dither "$map" -fill white -colorize "$((100 - strength))%" \) \
  \( -clone 1 -clone 2 -compose multiply -composite \) \
  \( -clone 0 -alpha extract \) \
  -delete 0-2 -alpha off -compose copy_opacity -composite "$out"
