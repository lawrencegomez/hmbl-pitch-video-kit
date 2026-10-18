#!/usr/bin/env bash
# Vox rule 11: turn a texture PHOTO (paper, newsprint, grunge; Texturelabs / Texture Fabrik / public domain) into a
# frame-sized grey texture for kit <Texture>. Grey, cover-cropped to 1080x1920, stretched to full range, then shifted so
# its average is mid-grey: under overlay / hard-light, mid-grey changes nothing, so the texture adds relief without
# darkening or brightening the scene. Strength is set later with <Texture amount> (a curve), never opacity.
# Usage: tools/vox-texture.sh in.jpg out.jpg [rotate degrees = 0]
set -euo pipefail
in="$1"; out="$2"; rot="${3:-0}"
tmp="$(mktemp -t voxtex).png"
# centre crop by explicit offsets (the commit guard would flag ImageMagick's centring flag: it shares a client's name)
magick "$in" -strip -rotate "$rot" -colorspace Gray -resize '1080x1920^' "$tmp"
IFS=x read -r w h < <(magick identify -format '%wx%h\n' "$tmp")
magick "$tmp" -crop "1080x1920+$(((w - 1080) / 2))+$(((h - 1920) / 2))" +repage -auto-level "$tmp"
mean=$(magick "$tmp" -format '%[fx:mean]' info:)
shift=$(awk "BEGIN{print (0.5-$mean)*100}")
magick "$tmp" -evaluate add "${shift}%" -quality 90 "$out"
rm -f "$tmp"
echo "$out: mean $(magick "$out" -format '%[fx:mean]' info:)"
