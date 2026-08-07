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
                      / 04 Arabic / 05 Korean / 06 Spanish) crossfade the
                      wallpaper, glow and the phone's lock-screen widget
                      between apps; it auto-cycles until the visitor clicks.
trivia/index.html     Lock&Learn (trivia) in its indigo/mint world.
chinese/index.html    Lock&Learn Chinese in its cinnabar world.
japanese/index.html   Lock&Learn Japanese in its aizome indigo world.
arabic/index.html     Lock&Learn Arabic in its oasis teal world.
korean/index.html     Lock&Learn Korean in its taegeuk cobalt world.
spanish/index.html    Lock&Learn Spanish in its saffron amber world (no
                      reading line anywhere: Spanish cards have none).
assets/site.css       Shared design system. App worlds are themed with
                      [data-app="trivia|chinese|japanese|arabic|korean|spanish"],
                      which sets the wall gradient, glow, accent tint and
                      headword font. Laptop-width viewports (981 to 1760px)
                      render the whole page at 90% via a zoom media query.
assets/site.js        Header state, masked headline reveals, reveal-on-scroll,
                      hero parallax, the index world switcher, and the
                      launch-date modal both store buttons open.
support.html          Support page (plain, self-contained).
privacy.html          Privacy policy (plain, self-contained).
terms.html            Terms of use (plain, self-contained).
favicon.svg           Site icon (navy lock) at a crawlable URL; Google
favicon.png           Search ignores data-URI icons, so the root pages link
apple-touch-icon.png  these instead. favicon.png (192px, transparent) and
                      apple-touch-icon.png (180px, opaque) are baked from
                      the SVG with headless Chrome. The app pages keep
                      their tinted data-URI tab icons and link only the
                      touch icon; Google takes the search-result favicon
                      from the index page.
sitemap.xml           All ten pages with lastmod dates. Bump lastmod for
                      pages you change before publishing.
robots.txt            Allow-all plus the sitemap URL.
CNAME                 The custom domain (locklearn.xyz) for GitHub Pages.
                      It must live here: publish-site mirrors site/ with
                      rsync --delete, so a CNAME kept only in the pages
                      repo gets wiped on every publish (which silently
                      took the domain offline until this file was added).
assets/og/            og:image cards (1200x630 PNG per page) plus their
                      *.src.html sources, card.css, and bake.sh which renders
                      the sources with headless Chrome. Edit a source, run
                      bake.sh, commit both.
```

## Design language

Editorial and type-led: numbered sections with hairline rules, content set
directly on the canvas (no card chrome), a film-grain overlay for
atmosphere. Three voices, mirroring the apps and teasers: content speaks
serif (Source Serif 4; Noto Serif SC/JP/KR for CJK headwords, Noto Naskh
Arabic for Arabic ones), the interface whispers sans (Inter), meta labels
are mono (IBM Plex Mono). Wall gradients, glows and accents come from
`teaser/config.py` and each app's `Brand.swift` (registry:
`shared/brand/README.md`); the Arabic (oasis teal), Korean (taegeuk
cobalt) and Spanish (saffron amber) worlds, not yet in the teaser config,
derive from their brand identities (`Brand.swift` accents and icon
gradients; for Spanish, whose app is not yet cloned, the blueprint's
identity table). Fonts load from Google Fonts;
CJK families are served as unicode-range slices so only used glyphs
download. Arabic headword slots get a taller line box in site.css so
stacked harakat never clip, and Arabic example sentences carry `dir="rtl"`
(kept flush left in site.css) so their final period stays at the end of the
sentence.

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

The canonical base URL is `https://locklearn.xyz/` (served via `site/CNAME`;
GitHub Pages redirects the old sjorsfest.github.io/lock-learn-docs/ URLs
there). It appears in canonicals, og:url/og:image, JSON-LD, robots.txt and
sitemap.xml. Re-verify the domain in Search Console and resubmit the
sitemap after this migration.

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

Each page's two `.store-row`s carry an App Store button. It doesn't link
anywhere yet: it's a `<button data-open-modal="launch">` element that opens
the `#launchModal` overlay (markup at the end of `<body>`, behavior in
`assets/site.js`) announcing the August 15 App Store launch. Once the
listings are live, swap each `<button>` for an `<a href>` to the real
listing (`teaser/config.py` still holds `id0000000000` placeholder Apple
URLs to update at the same time) and delete the modal markup, the trigger
attributes, and the modal JS block in `site.js`.

The site is iOS-only on purpose for now: the Android builds aren't ready,
so Google Play buttons and "iOS & Android" copy were removed until they
are. The `.btn-store.secondary` style in `site.css` is kept for when they
come back.
