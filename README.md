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
                      / 04 Korean / 05 Spanish) crossfade the wallpaper, glow
                      and the phone's lock-screen widget between apps; it
                      auto-cycles until the visitor clicks.
trivia/index.html     Lock&Learn (trivia) in its indigo/mint world.
chinese/index.html    Lock&Learn Chinese in its cinnabar world.
japanese/index.html   Lock&Learn Japanese in its aizome indigo world.
arabic/index.html     TEMPORARILY DISABLED (2026-08-14, pending extra
                      research before relaunch): index.html is a noindex
                      redirect-to-home stub; the real oasis-teal page is
                      parked as arabic/index.disabled.html. Every Arabic
                      link, the hero tab/wall layer, the app card, the
                      site.js ORDER entry and the sitemap entry are
                      commented out with "Arabic temporarily disabled"
                      markers. To re-enable: rename the parked file back,
                      delete the stub, grep the site for that marker and
                      restore each spot (renumber the Korean/Spanish tabs
                      back to 05/06).
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
                      modal the store buttons open on pages whose app is
                      not on the store yet (live app pages link out instead,
                      and carry no modal markup).
support.html          Support page (plain, self-contained).
privacy.html          Privacy policy (plain, self-contained).
terms.html            Terms of use (plain, self-contained).
favicon.svg           Site icon (navy lock) at a crawlable URL; Google
favicon.png           Search ignores data-URI icons, so the root pages link
apple-touch-icon.png  these instead. favicon.png (192px, transparent) and
favicon.ico           apple-touch-icon.png (180px, opaque) are baked from
                      the SVG with headless Chrome. favicon.ico (16/32/48px,
                      converted from favicon.png with Pillow) exists only so
                      crawlers and browsers that request /favicon.ico
                      unconditionally get a 200 instead of a 404. The app
                      pages keep their tinted data-URI tab icons and link
                      only the touch icon; Google takes the search-result
                      favicon from the index page.
sitemap.xml           Every live page with lastmod dates (the Arabic entry
                      is commented out while the app is disabled). Bump
                      lastmod for pages you change before publishing.
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

## Store buttons

Each page's two `.store-row`s carry an App Store button, in one of two
states depending on whether that app is live:

- **Live** (trivia, chinese, japanese): an `<a class="btn-store" href>`
  straight to the listing, with a plain `Free on iOS` note. Those pages
  have no `#launchModal` markup at all.
- **Not live yet** (korean, spanish): still a
  `<button data-open-modal="launch">` opening the `#launchModal` overlay
  (markup at the end of `<body>`, behavior in `assets/site.js`), with a
  `launching August 30` note and a per-app line in the modal.

`index.html` is the family page, so both its buttons keep opening the
modal, which now links the three live apps and names August 30 for the
other two.

When a listing goes live, swap that page's two `<button>`s for `<a href>`s,
drop the date from the store note, delete the page's modal markup, and
update the same app's `app_store_url` in `teaser/config.py` (the ones that
are still `id0000000000` are the apps that have not shipped). When the last
app is out, the modal JS block in `site.js` and the `.modal-*` CSS can go
with it. Site links use the country-less
`https://apps.apple.com/app/<slug>/id<id>` form so Apple routes each
visitor to their own storefront.

The site is iOS-only on purpose for now: the Android builds aren't ready,
so Google Play buttons and "iOS & Android" copy were removed until they
are. The `.btn-store.secondary` style in `site.css` is kept for when they
come back.
