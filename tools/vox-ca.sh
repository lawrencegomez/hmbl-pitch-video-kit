#!/usr/bin/env bash
# Vox rule 1: one chromatic aberration pass over the finished video (or a still), like a real lens:
# red is scaled up a hair and blue left as is, so fringes are near zero in the middle and grow toward the edges.
# Usage: tools/vox-ca.sh in.mp4 out.mp4 [amount = 0.004]   (also works on .png stills)
set -euo pipefail
in="$1"; out="$2"; a="${3:-0.004}"
IFS=x read -r W H < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$in")
even() { awk "BEGIN{v=int($1/2+0.5)*2; print v}"; }
GW=$(even "$W*(1+$a/2)"); GH=$(even "$H*(1+$a/2)"); RW=$(even "$W*(1+$a)"); RH=$(even "$H*(1+$a)")
graph="[0:v]format=gbrp,split=3[a][b][c];[a]extractplanes=g,scale=$GW:$GH:flags=bicubic,crop=$W:$H,setsar=1[g];[b]extractplanes=b,setsar=1[bl];[c]extractplanes=r,scale=$RW:$RH:flags=bicubic,crop=$W:$H:(iw-$W)/2:(ih-$H)/2,setsar=1[r];[g][bl][r]mergeplanes=0x001020:gbrp"
if [[ "$out" == *.png ]]; then
  ffmpeg -v error -y -i "$in" -filter_complex "$graph,format=rgb24" -frames:v 1 "$out"
else
  ffmpeg -v error -y -i "$in" -filter_complex "$graph,format=yuv420p" -c:v libx264 -crf 16 -preset slow -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -movflags +faststart "$out"
fi
