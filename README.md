# site/ — the Lock&Learn marketing site

Static marketing site for the app family plus the legal pages. No build
step, no framework: plain HTML/CSS/JS, deployable as-is to GitHub Pages
(the live pages the apps link to are served from the separate
`lock-learn-docs` repo; copy this directory's contents there to publish).

## Layout

```
index.html            Family overview. Interactive hero: clicking the app
                      chips (or the auto-cycle) morphs the whole world —
                      wallpaper, glow, and the phone's lock-screen widget.
trivia/index.html     Lock&Learn (trivia) in its indigo/mint world.
chinese/index.html    Lock&Learn Chinese in its cinnabar world.
japanese/index.html   Lock&Learn Japanese in its aizome indigo world.
assets/site.css       Shared design system. App worlds are themed with
                      [data-app="trivia|chinese|japanese|korean"], which sets
                      the wall gradient, glow, accent tint and headword font.
assets/site.js        Reveal-on-scroll + the index hero world switcher.
support.html          Support page (plain, self-contained).
privacy.html          Privacy policy (plain, self-contained).
terms.html            Terms of use (plain, self-contained).
```

## Where the identity values come from

The wall gradients, glows and accents mirror `teaser/config.py` and each
app's `Brand.swift` (registry: `shared/brand/README.md`). The voices mirror
the apps: content speaks serif (Source Serif 4; Noto Serif SC/JP for
headwords), the interface whispers sans (Inter). Fonts load from Google
Fonts; CJK families are served as unicode-range slices so only used glyphs
download.

Sample words and facts on the pages are real entries from
`shared/content/*/facts.json`. Keep them real: never invent content for
mockups.

## Standing copy rules

- No em dashes anywhere.
- No content counts ("4,991 words") in marketing copy; topic and level
  *names* are fine. Monthly updates are part of the promise.

## Before publishing

The App Store buttons still point at the `id0000000000` placeholder URLs
(same as `teaser/config.py`). Search for `apps.apple.com` in this directory
and drop in the real listing URLs once live. The Google Play button is a
non-linking "in the works" chip until the Android twins ship.
