# site/ — the Lock&Learn marketing site

Static marketing site for the app family plus the legal pages. No build
step, no framework: plain HTML/CSS/JS, served by GitHub Pages from the
separate `lock-learn-docs` repo (the live pages the apps link to). This
directory is the source of truth: publish with `make publish-site` from the
repo root, which mirrors site/ into that repo and pushes one commit.

## Layout

```
index.html            Family overview. Editorial hero with a world switcher:
                      the numbered tabs (01 Trivia / 02 Chinese / 03 Japanese)
                      crossfade the wallpaper, glow and the phone's
                      lock-screen widget between apps; it auto-cycles until
                      the visitor clicks.
trivia/index.html     Lock&Learn (trivia) in its indigo/mint world.
chinese/index.html    Lock&Learn Chinese in its cinnabar world.
japanese/index.html   Lock&Learn Japanese in its aizome indigo world.
assets/site.css       Shared design system. App worlds are themed with
                      [data-app="trivia|chinese|japanese"], which sets the
                      wall gradient, glow, accent tint and headword font.
assets/site.js        Header state, masked headline reveals, reveal-on-scroll,
                      hero parallax, and the index world switcher.
support.html          Support page (plain, self-contained).
privacy.html          Privacy policy (plain, self-contained).
terms.html            Terms of use (plain, self-contained).
```

## Design language

Editorial and type-led: numbered sections with hairline rules, content set
directly on the canvas (no card chrome), a film-grain overlay for
atmosphere. Three voices, mirroring the apps and teasers: content speaks
serif (Source Serif 4; Noto Serif SC/JP for headwords), the interface
whispers sans (Inter), meta labels are mono (IBM Plex Mono). Wall
gradients, glows and accents come from `teaser/config.py` and each app's
`Brand.swift` (registry: `shared/brand/README.md`). Fonts load from Google
Fonts; CJK families are served as unicode-range slices so only used glyphs
download.

Sample words and facts on the pages are real entries from
`shared/content/*/facts.json`. Keep them real: never invent content for
mockups.

## Standing copy rules

- No em dashes anywhere.
- No content counts ("4,991 words") in marketing copy; topic and level
  *names* are fine. Monthly updates are part of the promise.

## Screenshots / QA

Appending `#all` to any page URL skips the scroll choreography and shows
every element immediately. Useful for full-page screenshots:
`npx playwright screenshot --full-page "file://.../site/index.html#all" out.png`.

## Before publishing

The App Store buttons still point at the `id0000000000` placeholder URLs
(same as `teaser/config.py`). Search for `apps.apple.com` in this directory
and drop in the real listing URLs once live. Android is referenced only as
an "in the works" note until the twins ship.
