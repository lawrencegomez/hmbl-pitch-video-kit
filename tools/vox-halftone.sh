#!/usr/bin/env bash
# Vox-style print look for a photo: black and white, soft contrast, halftone dots multiplied into the shadows.
# Keeps the alpha channel, so cut-outs stay cut-outs. Faces stay readable (pure dot halftone loses them).
# Usage: tools/vox-halftone.sh in.png out.png [upscale% = 300] [dot strength 0-100 = 55] [dot map = h8x8a]
set -euo pipefail
in="$1"; out="$2"; up="${3:-300}"; strength="${4:-55}"; map="${5:-h8x8a}"
magick "$in" -resize "${up}%" \
  \( -clone 0 -alpha off -colorspace gray -sigmoidal-contrast 3x45% -gamma 1.12 \) \
  \( -clone 1 -level 8%,92% -ordered-dither "$map" -fill white -colorize "$((100 - strength))%" \) \
  \( -clone 1 -clone 2 -compose multiply -composite \) \
  \( -clone 0 -alpha extract \) \
  -delete 0-2 -alpha off -compose copy_opacity -composite "$out"
