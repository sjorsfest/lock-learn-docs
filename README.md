# site/ — the Lock&Learn marketing site

Static marketing site for the app family plus the legal pages. No build
step, no framework: plain HTML/CSS/JS, served by GitHub Pages from the
separate `lock-learn-docs` repo (the live pages the apps link to). This
directory is the source of truth: publish with `make publish-site` from the
repo root, which mirrors site/ into that repo and pushes one commit.

## Layout

```
index.html            Family overview. Editorial hero with a world switcher:
                      the numbered tabs (01 Trivia / 02 Chinese / 03 Japanese
                      / 04 Arabic) crossfade the wallpaper, glow and the
                      phone's lock-screen widget between apps; it auto-cycles
                      until the visitor clicks.
trivia/index.html     Lock&Learn (trivia) in its indigo/mint world.
chinese/index.html    Lock&Learn Chinese in its cinnabar world.
japanese/index.html   Lock&Learn Japanese in its aizome indigo world.
arabic/index.html     Lock&Learn Arabic in its oasis teal world.
assets/site.css       Shared design system. App worlds are themed with
                      [data-app="trivia|chinese|japanese|arabic"], which sets
                      the wall gradient, glow, accent tint and headword font.
assets/site.js        Header state, masked headline reveals, reveal-on-scroll,
                      hero parallax, and the index world switcher.
support.html          Support page (plain, self-contained).
privacy.html          Privacy policy (plain, self-contained).
terms.html            Terms of use (plain, self-contained).
sitemap.xml           All eight pages with lastmod dates. Bump lastmod for
                      pages you change before publishing.
robots.txt            Allow-all plus the sitemap URL. Note: on the current
                      GitHub Pages project URL it is served under
                      /lock-learn-docs/ where crawlers ignore it; it becomes
                      effective once the site moves to a custom domain. The
                      sitemap still works when submitted via Search Console.
assets/og/            og:image cards (1200x630 PNG per page) plus their
                      *.src.html sources, card.css, and bake.sh which renders
                      the sources with headless Chrome. Edit a source, run
                      bake.sh, commit both.
```

## Design language

Editorial and type-led: numbered sections with hairline rules, content set
directly on the canvas (no card chrome), a film-grain overlay for
atmosphere. Three voices, mirroring the apps and teasers: content speaks
serif (Source Serif 4; Noto Serif SC/JP for CJK headwords, Noto Naskh
Arabic for Arabic ones), the interface whispers sans (Inter), meta labels
are mono (IBM Plex Mono). Wall gradients, glows and accents come from
`teaser/config.py` and each app's `Brand.swift` (registry:
`shared/brand/README.md`); the Arabic world (oasis teal, not yet in the
teaser config) derives from its `Brand.swift` accent and icon gradients.
Fonts load from Google Fonts; CJK families are served as unicode-range
slices so only used glyphs download. Arabic headword slots get a taller
line box in site.css so stacked harakat never clip.

Sample words and facts on the pages are real entries from
`shared/content/*/facts.json`. Keep them real: never invent content for
mockups.

## SEO conventions

Every page carries a keyword-targeted `<title>` and meta description, a
canonical URL, full Open Graph + Twitter card tags, and JSON-LD structured
data: `Organization` + `WebSite` on the index, `MobileApplication` +
`BreadcrumbList` + `FAQPage` on each product page. The product pages end
with a visible "05 - Questions" FAQ section (`#faq`); its text and the
`FAQPage` JSON-LD in the same page's head are the same answers and must be
edited together, and every claim in them must stay true to the apps.

The canonical base URL is `https://sjorsfest.github.io/lock-learn-docs/`
and appears in canonicals, og:url/og:image, JSON-LD, robots.txt and
sitemap.xml. When the site moves to a custom domain (locklearn.xyz is
registered but still parked), search-and-replace that base across `site/`,
set the CNAME in the lock-learn-docs repo, and re-verify in Search Console.

Never fabricate ratings, review counts or download numbers in structured
data; add `aggregateRating` only if real App Store ratings exist.

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
