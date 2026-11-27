# Cuarto Juegos — Visual System
> One violet accent (#b296f8) on a black canvas, weight-900 headlines and a single 10px radius.

**Theme:** dark

The site uses a dark-mode visual system built around a single vivid violet accent on obsidian surfaces: a nearly-black canvas (#000000), near-black surface layers (#0f0f13, #1d1d1d), hairline charcoal borders (#292929) and one lavender (#b296f8) used on icons, strokes, button fills and shadow tints. Display headlines are heavy (weight 900) and body text sits at 400/500. Components share a single 10px radius and gain depth from violet-tinted shadows (rgba(178,150,248,0.20) 0px 25px 50px -12px) rather than neutral elevation. Badge variants pair a saturated border with desaturated text (green, blue, violet, pink) to separate categories without diluting the brand violet.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Void Black | `#000000` | `--color-void-black` | Page canvas, hero backgrounds, deepest surface — the obsidian backdrop against which the brand violet glows |
| Obsidian Surface | `#0f0f13` | `--color-obsidian-surface` | Elevated card surfaces, button fills for neutral/ghost controls, hero overlays |
| Carbon Border | `#292929` | `--color-carbon-border` | Hairline borders across cards, nav, body, links, and lists — the structural grid in a single near-black tone |
| Graphite Card Edge | `#1d1d1d` | `--color-graphite-card-edge` | Card-specific border tone, one step lighter than Carbon to create layered card edges |
| Ash Mist | `#2a2a36` | `--color-ash-mist` | Subtle violet-tinted dark border for sections and footer dividers — the only near-gray with hue |
| Platinum Text | `#e6e6e6` | `--color-platinum-text` | Primary body and UI text, nav links, card text, icon strokes — soft white for long-form reading on black |
| Foil Highlight | `#ffffff` | `--color-foil-highlight` | Display headings, brand mark, button labels on dark — pure white reserved for the loudest type moments |
| Steel Muted | `#9e9e9e` | `--color-steel-muted` | Muted helper text, secondary list items, dimmed icon strokes — quiet copy in the body |
| Portal Violet | `#b296f8` | `--color-portal-violet` | Primary action buttons, icon strokes, accent text, shadow tint — the singular brand signal; lavender that reads as dimensional energy |
| Wisteria | `#594b7c` | `--color-wisteria` | Muted violet border for accent rules and decorative dividers |
| Indigo Plum | `#4b3f71` | `--color-indigo-plum` | Violet badge border for category tags in the violet family |
| Lavender Mist | `#ede9fe` | `--color-lavender-mist` | Violet badge text fill — desaturated lavender for readable on-dark violet tag content |
| Fuchsia Ink | `#571c60` | `--color-fuchsia-ink` | Pink/magenta badge border for editorial or community-event categories |
| Verdant Edge | `#0e4f26` | `--color-verdant-edge` | Green outline accent for tags, dividers, and focused UI edges. Use as a supporting accent, not as a status color |
| Mint Whisper | `#dcfce7` | `--color-mint-whisper` | Success badge text — soft mint for green category labels on dark |
| Cobalt Vein | `#264264` | `--color-cobalt-vein` | Blue outline accent for tags, dividers, and focused UI edges. Use as a supporting accent, not as a status color |
| Deep Tide | `#06425d` | `--color-deep-tide` | Blue outline accent for tags, dividers, and focused UI edges. Use as a supporting accent, not as a status color |
| Ice Blue | `#dbeafe` | `--color-ice-blue` | Info badge text — desaturated sky for blue category labels on dark |

## Tokens — Typography

### Inter — Sole typeface. Weight 900 at 72px/48px for display and section headings is the signature — the brand does not whisper at scale, it announces. Weight 600 for sub-headings and nav, weight 500 for emphasized body, weight 400 for body and supporting copy. The lineHeight 1.00–1.11 at display sizes is unusually tight and signals confidence; body sits at 1.43–1.56 for compact reading. Letter-spacing tracks the hierarchy: -0.025em pulls display tight, 0.05em relaxes body, 0.20em stretches labels and badges wide. · `--font-suisse-intl`
- **Source:** Inter (SIL Open Font License 1.1), served from the site itself; no external font service
- **Weights:** 400, 500, 600, 900
- **Sizes:** 12px, 14px, 16px, 18px, 36px, 48px, 72px
- **Line height:** 1.00, 1.11, 1.33, 1.43, 1.50, 1.56
- **Letter spacing:** -0.025em at 72px/48px display, 0.05em at 16px/18px body, 0.20em at 12px labels and badges
- **Role:** Sole typeface. Weight 900 at 72px/48px for display and section headings is the signature — the brand does not whisper at scale, it announces. Weight 600 for sub-headings and nav, weight 500 for emphasized body, weight 400 for body and supporting copy. The lineHeight 1.00–1.11 at display sizes is unusually tight and signals confidence; body sits at 1.43–1.56 for compact reading. Letter-spacing tracks the hierarchy: -0.025em pulls display tight, 0.05em relaxes body, 0.20em stretches labels and badges wide.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | — | — | 12px | 1.5 | 0.2px | `--text-caption` |
| body-sm | — | — | 14px | 1.43 | 0.05px | `--text-body-sm` |
| body | — | — | 16px | 1.5 | 0.05px | `--text-body` |
| subheading | — | — | 18px | 1.56 | 0.05px | `--text-subheading` |
| heading-sm | — | — | 36px | 1.11 | -0.025px | `--text-heading-sm` |
| heading | — | — | 48px | 1.11 | -0.025px | `--text-heading` |
| display | — | — | 72px | 1 | -0.025px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** compact

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 96 | 96px | `--spacing-96` |

### Border Radius

| Element | Value |
|---------|-------|
| nav | 10px |
| cards | 10px |
| badges | 10px |
| inputs | 10px |
| buttons | 10px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| xl | `rgba(178, 150, 248, 0.2) 0px 25px 50px -12px` | `--shadow-xl` |
| subtle | `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px` | `--shadow-subtle` |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 48px
- **Card padding:** 16px
- **Element gap:** 16px

## Components

### Primary Action Button
**Role:** Filled violet CTA — the only chromatic button

Background #b296f8, text #0f0f13, Inter 500 at 14px, padding 16px 24px, radius 10px, subtle rgba(0,0,0,0.05) 0px 1px 2px 0px shadow. The lavender fill against the obsidian canvas is the brand's single most recognizable moment.

### Ghost Button
**Role:** Secondary action on dark hero/sections

Transparent background, 1px border in #292929, text #e6e6e6, Inter 500 at 14px, padding 16px 24px, radius 10px. Reads as a quieter alternative that respects the violet primary.

### Nav Link
**Role:** Top-bar navigation item

Inter 400 at 14px, color #e6e6e6, no underline, 10px radius reserved for any pill-style link. Spacing 8px between items.

### Brand Mark
**Role:** Logo in header

White mark on dark header, 10px radius container, paired with the site name (taken from the site configuration) in Foil Highlight #ffffff, weight 600.

### Announcement Bar
**Role:** Slim banner above header

Full-width dark band (#0f0f13), body text in #e6e6e6 at 14px, optional close icon, 8px vertical padding.

### Feature Card
**Role:** Three-column 'What We Do' card with image and copy

Background #0f0f13, 1px border in #1d1d1d, radius 10px, padding 16px, violet-tinted shadow rgba(178,150,248,0.20) 0px 25px 50px -12px. Image fills the top edge with no separate radius (image corners are clipped by card radius). Title in Inter 600 at 18px #ffffff, body in 400 at 16px #e6e6e6.

### Card with Glow
**Role:** Same as Feature Card — the shadow is the differentiator

Identical dimensions to Feature Card, defined by the violet-tinted shadow rather than any visual border treatment. The glow makes the card feel like it is emitting light.

### Hero Overlay Card
**Role:** Text box layered over hero image

Semi-transparent panel containing hero headline and CTAs, 10px radius, no border. Sits on the hero illustration with the dark hero image as background.

### Success Badge
**Role:** Live/active/shipped status tag

Transparent fill, 1px border #0e4f26, text #dcfce7, Inter 500 at 12px, letter-spacing 0.20em, padding 2px 10px, radius 10px. Deep-green border + mint text reads as a quiet 'shipped' state.

### Info Badge
**Role:** Data/system/category tag — blue family

Transparent fill, 1px border #264264, text #dbeafe, Inter 500 at 12px, letter-spacing 0.20em, padding 2px 10px, radius 10px. Alternate variant uses #06425d border for deeper-blue categories.

### Violet Badge
**Role:** Brand-aligned category tag

Transparent fill, 1px border #4b3f71, text #ede9fe, Inter 500 at 12px, letter-spacing 0.20em, padding 2px 10px, radius 10px. Echoes the brand violet at lower saturation for taxonomy without competing with the primary.

### Pink Badge
**Role:** Editorial/community-event tag

Transparent fill, 1px border #571c60, text #ede9fe, Inter 500 at 12px, letter-spacing 0.20em, padding 2px 10px, radius 10px. Magenta signals a different category without breaking the system.

### Section Eyebrow Label
**Role:** All-caps label above section heading (e.g. 'WHAT WE DO')

Inter 500 at 12px, letter-spacing 0.20em, color #9e9e9e. Wide tracking on muted text creates a clear hierarchy entry point.

### Display Heading
**Role:** Hero and section titles

Inter 900 at 48–72px, color #ffffff, letter-spacing -0.025em, line-height 1.00–1.11. The 900 weight is the voice — it does not whisper.

### Outlined Action
**Role:** Tertiary violet action in a footer or utility bar

Transparent background, 1px border #b296f8, text #b296f8, Inter 500 at 14px, padding 16px 24px, radius 10px. Use where a filled button would be too heavy.

### Hero Showcase Card
**Role:** Cover of the active game in the hero

16:9 cover of the active game in front of the vortex center, background #0f0f13, radius 10px, violet shadow rgba(178,150,248,0.20) 0px 25px 50px -12px, image clipped by the card. The slide sweep happens inside it.

### Game Detail
**Role:** Layout of a game page

From 1000px, two columns: the large 16:9 cover (and real screenshots, only if they exist) on the left; on the right, Display Heading, badges, description, Play Panel and Requirement List. Below 1000px the columns stack, cover first. Once the game starts, the stage takes the full content width and the information flows below it. The page ends with "More games": up to three Feature Cards.

### Play Panel
**Role:** The game page's single call to action

Background #0f0f13, 1px border #1d1d1d, radius 10px, padding 16px. Holds the only Primary Action Button of the page ("Play {game}"), then the age hint (tabular figures), controls and content note in #e6e6e6 at 14px.

### Requirement List
**Role:** What a game needs and does, taken from the catalog

One row per item: a line icon drawn for the site (24px box, 1.5px stroke in #b296f8, same weight as the Brand Mark) and a #e6e6e6 label at 14px. Items: keyboard, mouse, touch, fullscreen, saves data only in this browser, no accounts. Icons are hidden from assistive technology; the label carries the meaning.

### Game Loading State
**Role:** Wait between "Play" and the game

The stage keeps its 16:9 box and shows "Loading {game}…" in #e6e6e6 on #0f0f13, marked busy for assistive technology until the game has loaded. Static text: no spinner, nothing loops.

## Do's and Don'ts

### Do
- Use #b296f8 as the only chromatic fill for action buttons; pair with #0f0f13 text and 10px radius.
- Set display headings in Inter 900 at 48–72px with -0.025em letter-spacing and line-height 1.00–1.11; the weight 900 is non-negotiable for the brand voice.
- Give every card the violet-tinted shadow rgba(178,150,248,0.20) 0px 25px 50px -12px — the glow is the elevation system, not a generic gray drop-shadow.
- Use the badge family with transparent fill, 1px saturated border, desaturated pastel text, 12px text, 0.20em letter-spacing, and 10px radius — keep all four color families (green/blue/violet/pink) in active rotation.
- Use the single 10px radius uniformly across cards, buttons, badges, and nav; do not introduce secondary radii.
- Keep the canvas at #000000, lit only by the faint violet Canvas Glow and, on a game page, the Game Light, and elevated surfaces at #0f0f13; use #292929 and #1d1d1d as the only border tones.
- Track body text at 0.05em and small labels/badges at 0.20em; tighten display type to -0.025em — the three tracking values form a recognizable rhythm.

### Don't
- Do not introduce a second accent color in the interface: buttons, links, focus rings, badges and selected states stay violet. The only exception is the Game Accent, limited to the decorative vortex, its glow and the Game Light.
- Do not use weight 400–600 for display headings; the 900 weight at large sizes is the signature.
- Do not apply neutral gray drop-shadows to cards; the violet-tinted shadow is the only elevation pattern.
- Do not use radii other than 10px; the system has one radius and it must remain singular.
- Do not place light text on light badge fills or dark text on dark borders — the badge pattern is always: dark saturated border + desaturated pastel text.
- Do not use #ffffff for body copy; reserve it for display headings and brand marks only. Body uses #e6e6e6.
- Do not soften the section gap below 48px; the compact-but-breathing rhythm is part of the identity.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Void | `#000000` | Page canvas and hero backgrounds |
| 1 | Obsidian | `#0f0f13` | Elevated cards, button fills, hero overlays |
| 2 | Carbon Edge | `#1d1d1d` | Card border layer, creating perceptible card edges on the void |
| 3 | Portal Glow | `#b296f8` | Brand accent surface — action buttons and the violet shadow halo around cards |

## Elevation

- **Card:** `rgba(178, 150, 248, 0.2) 0px 25px 50px -12px`
- **Button:** `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`

## Game Accent

Each game may declare one accent color, derived from its own cover: the cover's dominant hue brought to the lightness and chroma of #b296f8 (OKLCH L 0.737, C 0.141), so every accent glows with the same intensity on the black canvas. Without one, the accent is #b296f8. The game accent colors only decorative vortex art (rings, core glow and halo) in the home hero, the catalog backdrop and the game page, and the Game Light of the game page. It never colors text, buttons, links, focus rings, badges or selected states, and no text sits on it. The value lives in the game catalog, not in the tokens.

## Interaction States

States only change color, border, shadow, `transform` and `opacity`. Hover styles apply only under `@media (hover: hover)`; every hover style is also applied on `:focus-visible`, and touch uses `:active`. Nothing is reachable only by hover.

| Element | Rest | Hover / focus | Pressed (`:active`) | Selected |
|---|---|---|---|---|
| Primary Action Button | #b296f8 fill, #0f0f13 text | fill `color-mix(in oklab, #b296f8 88%, #ffffff)` | fill `color-mix(in oklab, #b296f8 88%, #0f0f13)`, `translateY(1px)` | — |
| Ghost Button | 1px #292929 border, #e6e6e6 text | border #b296f8 | fill #0f0f13, `translateY(1px)` | — |
| Nav Link | #e6e6e6 | #ffffff | #ffffff | current page: 2px #b296f8 underline, offset 6px (`aria-current="page"`); on the home page the underline moves to the section in view (`aria-current="true"`), and Home keeps `aria-current="page"` without it |
| Filter Chip | 1px #292929 border, #e6e6e6 text, transparent | border #b296f8 | `translateY(1px)` | check mark, fill #4b3f71, border #b296f8, text #ede9fe (`aria-pressed="true"`) |
| Feature Card | 1px #1d1d1d border, violet shadow | `translateY(-4px)`, border #594b7c; image `scale(1.03)` clipped by the card | — | — |
| Hero Thumbnail | `opacity: 0.6` | `opacity: 1` | — | `opacity: 1`, inset 2px #b296f8 ring (`aria-pressed="true"`) |

### Filter Chip
**Role:** Catalog filter (closed list of values)

Transparent background, 1px border #292929, text #e6e6e6, Inter 500 at 14px, letter-spacing 0.05em, padding 0 16px, min-height 44px, radius 10px. The selected state never relies on color alone: it adds a check mark before the label (drawn in CSS, #ede9fe) on top of the fill and the #b296f8 border (8.61:1 against the canvas).

## Motion

Motion explains a change (feedback, where something comes from, a slide change). Durations and curves are tokens; repeated motion uses only `transform` and `opacity`.

| Token | Value | Use |
|---|---|---|
| `--ease-move` | `cubic-bezier(0.65, 0, 0.35, 1)` | Slide sweep, things that travel |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances and settles |
| `--duration-feedback` | 160ms | Hover, focus, press |
| `--duration-enter` | 600ms | Entrance of hero text, rail and cards |
| `--duration-stagger` | 80ms | Delay step between entering items |
| `--duration-slide` | 900ms | Hero slide sweep |
| `--duration-settle` | 4500ms | One-shot settle of the active hero image (`scale(1.06)` to `scale(1)`), then still |
| `--duration-autoplay` | 7000ms | Time each hero slide stays before advancing on its own (only with the pause button) |
| `--duration-page` | 300ms | Cross-page fade and the cover that travels from a card to its game page |
| `--duration-scene` | 1300ms | One-shot scene zoom on page entrance (`scale(1.08)` to `scale(1)`) |

- Nothing moves on its own for more than 5 seconds, with one exception: hero autoplay. Slides advance every 7 s (`--duration-autoplay`) only with a visible pause button, pausing on hover, focus or hidden tab, and never with reduced motion. There is no looping animation and no pointer parallax.
- The hero vortex spins and brightens during a slide change and once on page entrance; otherwise it is still. The catalog backdrop vortex turns only with page scroll (scroll-driven, so the user controls it).
- Entrances are CSS only, run once, and start from a visible end state: without JavaScript or with motion reduced, everything is shown.
- **Page transitions:** cross-document view transitions. The header stays in place, the rest of the page fades (`--duration-page`), and a game cover travels from its card to the game page and between game pages. Each transition name appears once per page. Without browser support, navigation is a normal page load.
- In-page links to home sections scroll smoothly.
- **Entrances** (once per page load, CSS only): headline revealed from a mask, scene zoom (`--duration-scene`), staggered items (`--duration-stagger`), and side layers that slide in 32px from the left or right (`--duration-enter`). Scrolling is never hijacked.
- **Catalog backdrop:** a large, faint vortex behind the cards turns up to 90° across the catalog as the page scrolls, and takes the Game Accent of the card under the pointer or with focus.
- With `prefers-reduced-motion: reduce`: no sweep, settle, translate, scale, zoom, entrance, page transition, smooth scrolling or scroll-linked rotation. Slide and page changes are instant; hover and press keep only the color change.

## Overlays and Layers

- **Image veil (top):** `linear-gradient(to bottom, color-mix(in oklab, #0f0f13 70%, transparent) 0%, transparent 40%)`. At 70% obsidian, #e6e6e6 text stays at 6.85:1 and #ffffff at 8.55:1 even over a white pixel. Only #ffffff and #e6e6e6 text sit directly on the veil; muted (#9e9e9e) and violet text go on a #0f0f13 panel.
- **Image fade (bottom):** `linear-gradient(to bottom, transparent 65%, #000000 100%)`, so the hero melts into the canvas where the catalog begins.
- **Sweep haze:** a soft #b296f8 band at 25% opacity that follows the edge of the slide sweep. Decorative, hidden from assistive technology.
- **Canvas Glow:** soft, static radial #b296f8 light on the black canvas, fading to transparent before any edge: behind the About section and along the top of the footer at 18% (`--glow-canvas`), and behind the catalog at 10% (`--glow-canvas-soft`), lower because the backdrop vortex sits on top. Always violet (never the Game Accent), decorative and hidden from assistive technology. At the brightest point of the catalog (glow plus a white vortex ring), #9e9e9e text stays above 4.5:1.
- **Game Light:** on a game page, a static radial light in the Game Accent at 30% (`--glow-game-mix`), fixed to the viewport behind all content so it fills the full width: centered on the cover (on the stage once the game starts). Every text color stays above 4.5:1 over it for every game color. Decorative and hidden from assistive technology.
- **Game page vortex:** sits behind the cover, 48px larger on each side, and fades out toward its edges so it never crosses the buttons below.
- **Header:** transparent over the hero; after the hero, fill `color-mix(in oklab, #0f0f13 85%, transparent)`, `backdrop-filter: blur(12px)` (`--blur-header`) and a 1px #1d1d1d bottom border.
- **Hero title:** gradient from #ffffff to #e6e6e6, fully opaque.

| Token | Value | Layer |
|---|---|---|
| `--layer-base` | 0 | Page content |
| `--layer-hero-art` | 1 | Hero image, veils and vortex |
| `--layer-hero-content` | 2 | Hero panel, title and rail |
| `--layer-header` | 10 | Sticky header |
| `--layer-skip-link` | 100 | Skip link |

## Imagery

Imagery is hero-driven. The hero's main element is the site's own artwork, a large hexagonal violet-and-white vortex drawn in SVG on the black canvas, with the active game's real cover in a Hero Showcase Card in front of its center. Game cards show each game's real cover. No stock photography and no third-party illustrations. Iconography is line-based, drawn for the site, stroked in #b296f8 or #e6e6e6 with a consistent thin-to-medium stroke weight. The page is image-heavy in the hero and image-light in the body sections. The vortex takes the active game's Game Accent; the catalog repeats it as a large, faint backdrop.

## Layout

Full-bleed dark canvas with a max-width 1200px content container. The home hero is a full-viewport-height scene on the black canvas: the large vortex with the active game's cover in a Hero Showcase Card, beside a panel with eyebrow, headline, short copy, two CTAs (filled violet + ghost) and the slide rail. On short landscape screens (height up to 500px) the scene shrinks and sits next to the panel, so the headline and the primary action are visible without scrolling. Game pages follow Game Detail. Below the hero, the body lives in 48px-rhythm sections: the game catalog as a card grid with 16px gaps, then supporting text sections. Navigation is a top bar with logo left, links center and a contact CTA right. Generous 48px vertical breathing room between sections keeps the compact density from feeling cramped.

## Quick Reference

**Quick Color Reference**
- canvas: #000000
- elevated surface: #0f0f13
- border: #292929 / #1d1d1d
- text primary: #e6e6e6
- heading/brand: #ffffff
- muted text: #9e9e9e
- accent / primary action: #b296f8 (filled action)

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-void-black: #000000;
  --color-obsidian-surface: #0f0f13;
  --color-carbon-border: #292929;
  --color-graphite-card-edge: #1d1d1d;
  --color-ash-mist: #2a2a36;
  --color-platinum-text: #e6e6e6;
  --color-foil-highlight: #ffffff;
  --color-steel-muted: #9e9e9e;
  --color-portal-violet: #b296f8;
  --color-wisteria: #594b7c;
  --color-indigo-plum: #4b3f71;
  --color-lavender-mist: #ede9fe;
  --color-fuchsia-ink: #571c60;
  --color-verdant-edge: #0e4f26;
  --color-mint-whisper: #dcfce7;
  --color-cobalt-vein: #264264;
  --color-deep-tide: #06425d;
  --color-ice-blue: #dbeafe;

  /* Typography — Font Families */
  --font-suisse-intl: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.5;
  --tracking-caption: 0.2px;
  --text-body-sm: 14px;
  --leading-body-sm: 1.43;
  --tracking-body-sm: 0.05px;
  --text-body: 16px;
  --leading-body: 1.5;
  --tracking-body: 0.05px;
  --text-subheading: 18px;
  --leading-subheading: 1.56;
  --tracking-subheading: 0.05px;
  --text-heading-sm: 36px;
  --leading-heading-sm: 1.11;
  --tracking-heading-sm: -0.025px;
  --text-heading: 48px;
  --leading-heading: 1.11;
  --tracking-heading: -0.025px;
  --text-display: 72px;
  --leading-display: 1;
  --tracking-display: -0.025px;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-black: 900;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-96: 96px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 48px;
  --card-padding: 16px;
  --element-gap: 16px;

  /* Border Radius */
  --radius-lg: 10px;

  /* Named Radii */
  --radius-nav: 10px;
  --radius-cards: 10px;
  --radius-badges: 10px;
  --radius-inputs: 10px;
  --radius-buttons: 10px;

  /* Shadows */
  --shadow-xl: rgba(178, 150, 248, 0.2) 0px 25px 50px -12px;
  --shadow-subtle: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

  /* Surfaces */
  --surface-void: #000000;
  --surface-obsidian: #0f0f13;
  --surface-carbon-edge: #1d1d1d;
  --surface-portal-glow: #b296f8;

  /* Motion (DESIGN.md, Motion) */
  --ease-move: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-feedback: 160ms;
  --duration-enter: 600ms;
  --duration-stagger: 80ms;
  --duration-slide: 900ms;
  --duration-settle: 4500ms;
  --duration-autoplay: 7000ms;
  --duration-page: 300ms;
  --duration-scene: 1300ms;

  /* Overlays and Layers (DESIGN.md) */
  --blur-header: 12px;
  --glow-canvas: color-mix(in oklab, var(--color-portal-violet) 18%, transparent);
  --glow-canvas-soft: color-mix(in oklab, var(--color-portal-violet) 10%, transparent);
  --glow-game-mix: 30%;
  --layer-base: 0;
  --layer-hero-art: 1;
  --layer-hero-content: 2;
  --layer-header: 10;
  --layer-skip-link: 100;
}
```
