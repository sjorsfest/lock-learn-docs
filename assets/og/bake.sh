#!/bin/sh
# Bake the *.src.html card sources into the 1200x630 og:image PNGs the pages
# reference. Rerun after editing a card source or card.css. Needs Chrome.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for name in home trivia chinese japanese; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size=1200,630 --virtual-time-budget=10000 \
    --screenshot="$name.png" "file://$PWD/$name.src.html" 2>/dev/null
  echo "baked $name.png"
done
