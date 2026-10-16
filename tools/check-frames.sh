#!/usr/bin/env bash
# Frame checks a person would otherwise do by eye. Run after every render.
#   tools/check-frames.sh out/<slug>-vN.mp4 [transition seconds...]
# Writes to review/check/:
#   centre.png       one frame every 2 s with a blue centre line: content should sit on it
#   transitions.png  one row per transition time given, 8 frames from 2 frames before to 13 after:
#                    look for the old page flashing back or two paper edges (see PLAYBOOK "Transitions")
set -euo pipefail
in=${1:?usage: tools/check-frames.sh <video.mp4> [transition seconds...]}
shift
out=review/check
rm -rf "$out" && mkdir -p "$out/c" "$out/t"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")

i=0
for t in $(awk -v d="$dur" 'BEGIN{for(s=0.5;s<d;s+=2) printf "%.1f\n", s}'); do
  i=$((i+1)); f=$(printf "$out/c/%03d.png" $i)
  ffmpeg -loglevel error -y -ss "$t" -i "$in" -frames:v 1 -vf scale=270:480 "$f"
  magick "$f" -stroke '#00C2FF' -strokewidth 2 -draw "line 135,0 135,480" -stroke none -fill red -pointsize 22 -annotate +6+24 "${t}s" "$f"
done
magick montage "$out"/c/*.png -tile 8x -geometry +3+3 -background red "$out/centre.png"

if [ $# -gt 0 ]; then
  for t in "$@"; do
    for d in -2 0 2 4 6 8 10 13; do
      s=$(awk -v t="$t" -v d="$d" 'BEGIN{printf "%.3f", t + (d + 0.5) / 30}')
      ffmpeg -loglevel error -y -ss "$s" -i "$in" -frames:v 1 -vf scale=216:384 "$out/t/${t}_$(printf %02d $((d+2))).png"
    done
    magick montage "$out/t/${t}"_*.png -tile 8x1 -geometry +2+2 -background red "$out/t/row_${t}.png"
  done
  magick "$out"/t/row_*.png -append "$out/transitions.png"
fi
echo "Wrote $out/centre.png${1:+ and $out/transitions.png}. Open them and look before sending the video on."
