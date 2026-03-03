# /docs/TECHNICAL_ARCHITECTURE.md
# Oregon Jiu Jitsu Lab — Technical Architecture

---

## Architecture Decision: MPA

**Decision: Multi-Page Application (MPA) with optional View Transitions.**

**Rationale:**
- 6 pages with distinct content — no shared state requiring SPA complexity
- MPA delivers better SEO out of the box (full HTML per route, no hydration)
- Progressive enhancement is trivially achieved — pages work without JS
- GymDesk integration is embed/redirect, not client-side state
- View Transitions API provides SPA-like feel without SPA overhead
- Simpler build, simpler mental model, simpler maintenance

**What this means:**
- Each page is a standalone HTML document
- Web Components hydrate on top of server-rendered HTML
- No client-side routing library
- No virtual DOM

---

## Routing Strategy

Static file routing. Each page is a directory with an `index.html`.

```
/             → src/pages/home/index.html
/about        → src/pages/about/index.html
/schedule     → src/pages/schedule/index.html
/programs     → src/pages/programs/index.html
/shop         → src/pages/shop/index.html
/login        → src/pages/login/index.html
```

Server handles 404 → `src/pages/404/index.html`.
Redirect rules managed in hosting platform config (Netlify `_redirects` or Cloudflare `_routes.json`).

---

## Folder Structure

```
ojjlab-site/
├── src/
│   ├── components/          # Web Components (one file per component)
│   │   ├── base/            # BaseElement class, mixins
│   │   ├── primitives/      # Button, Link, Icon, Badge
│   │   ├── layout/          # SiteHeader, SiteNav, SiteFooter, PageHero
│   │   ├── modules/         # ScheduleEmbed, TrialForm, ProgramCard, TestimonialBlock
│   │   └── index.ts         # Barrel — registers all components
│   ├── pages/               # HTML entry points
│   │   ├── home/
│   │   ├── about/
│   │   ├── schedule/
│   │   ├── programs/
│   │   ├── shop/
│   │   ├── login/
│   │   └── 404/
│   ├── styles/
│   │   ├── tokens.css       # CSS custom properties (design tokens)
│   │   ├── base.css         # Reset, typography defaults, landmark spacing
│   │   └── utilities.css    # Tailwind @layer utilities overrides if needed
│   ├── scripts/
│   │   ├── animation.ts     # GSAP setup, reducedMotion check, shared timelines
│   │   └── analytics.ts     # GA4 or Plausible initialization
│   └── assets/
│       ├── images/          # Optimized images (WebP + AVIF)
│       ├── fonts/           # Self-hosted font files
│       └── icons/           # SVG sprite or individual SVGs
├── tests/
│   ├── unit/                # Vitest unit tests per component
│   ├── integration/         # Vitest integration tests
│   └── e2e/                 # Playwright tests per page
├── docs/                    # This documentation
├── public/                  # Static assets copied as-is
│   ├── robots.txt
│   ├── sitemap.xml
│   └── favicon.ico
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── package.json
```

---

## Web Components Base Class Strategy

Single abstract base class. All components extend it.

```ts
// src/components/base/BaseElement.ts
export abstract class BaseElement extends HTMLElement {
  protected reducedMotion: boolean;

  constructor() {
    super();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  connectedCallback(): void {
    this.render();
    this.bindEvents();
  }

  disconnectedCallback(): void {
    this.cleanup();
  }

  protected abstract render(): void;
  protected bindEvents(): void {}
  protected cleanup(): void {}
}
```

**Component registration pattern:**
```ts
// Each component file self-registers
customElements.define('ojj-button', OJJButton);
```

**Shadow DOM policy:**
- Use Shadow DOM for encapsulated, reusable UI primitives (buttons, badges, icons)
- Use Light DOM for layout/page-level components that need global CSS (header, footer, hero)
- Do NOT use Shadow DOM for components that must participate in form submission

---

## Styling Strategy: Tailwind + Design Tokens

**Layer:**
1. CSS custom properties (tokens) defined in `tokens.css` — source of truth
2. Tailwind configured to use those tokens as its design system
3. Utility classes applied in HTML templates
4. Component-scoped styles in `<style>` blocks where Shadow DOM is used

**Token categories:**
```css
:root {
  /* Brand */
  --color-brand-primary: #1a1a2e;     /* Deep navy */
  --color-brand-accent:  #e63946;     /* Aggressive red */
  --color-brand-gold:    #f4a261;     /* Secondary warmth */

  /* Neutral */
  --color-neutral-50 through --color-neutral-950

  /* Semantic */
  --color-surface:       var(--color-neutral-50);
  --color-on-surface:    var(--color-neutral-950);
  --color-interactive:   var(--color-brand-accent);
  --color-interactive-hover: ...;

  /* Typography */
  --font-heading: 'Font Name', system-ui, sans-serif;
  --font-body:    system-ui, -apple-system, sans-serif;

  /* Spacing scale follows Tailwind defaults */
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

**Tailwind config extends these tokens — does not define its own values independently.**

---

## State Management Approach

No global state library. Three tiers:

1. **DOM state** — interactive UI state (menu open, tab selected) managed via attributes and `dataset`
2. **URL state** — schedule filters reflected in URL params (`?day=monday&level=beginner`)
3. **Session state** — GymDesk owns all authenticated state; we do not duplicate it

Custom events used for cross-component communication:
```ts
// Dispatching
this.dispatchEvent(new CustomEvent('ojj:nav-open', { bubbles: true, composed: true }));

// Listening (on a parent or document level)
document.addEventListener('ojj:nav-open', handler);
```

---

## Build Tooling Strategy

**Build tool: Vite**
- Fast dev server with HMR
- TypeScript first-class support
- Multi-entry HTML pages via `rollup-plugin-html` or Vite's native MPA support
- Asset optimization built-in (image processing via `vite-imagetools`)

**Test runner: Vitest** (unit + integration)
**E2E: Playwright**
**Type checking: `tsc --noEmit`** (separate from build, run in CI)
**Linting: ESLint** with `@typescript-eslint`
**Formatting: Prettier** (non-negotiable — no debates)

**CI pipeline (GitHub Actions):**
```
lint → typecheck → unit tests → build → playwright tests → lighthouse CI
```
All steps are gates. Failure at any step blocks merge.

---

## Performance Strategy

**Images:**
- All images served as WebP with AVIF where supported
- `<picture>` element with `srcset` and `sizes`
- Hero/LCP image: `fetchpriority="high"`, no `loading="lazy"`
- All below-fold images: `loading="lazy"`
- Defined `width` and `height` attributes on all images (prevents CLS)

**Fonts:**
- Self-hosted (no Google Fonts DNS lookup)
- `font-display: swap`
- Subset to used characters
- Preloaded in `<head>`: `<link rel="preload" as="font">`

**JS:**
- Code-split per page — no page loads JS for another page
- Web Components registered only when page needs them
- GSAP: imported only on pages with animation
- `type="module"` — modern bundle, no polyfill bloat

**CSS:**
- Tailwind purges unused classes at build time
- Critical CSS inlined in `<head>` for above-fold content (Vite plugin or manual)
- No `@import` chains

**Caching:**
- Static assets: content-hashed filenames → `Cache-Control: immutable`
- HTML pages: short TTL or `no-cache` for content freshness

---

## SEO Strategy

- Semantic HTML on every page (no `div` soup)
- Unique `<title>` and `<meta name="description">` per page
- Open Graph tags on all pages (at minimum: `og:title`, `og:description`, `og:image`, `og:url`)
- Structured data (JSON-LD) on:
  - Home: `LocalBusiness` + `SportsActivityLocation`
  - Schedule: `Event` schema per class (if data is static or cacheable)
  - About: `Person` schema for instructor
- `robots.txt` and `sitemap.xml` in `/public`
- Canonical URLs set per page
- No orphaned pages (every page linked from nav or sitemap)
- Social sharing images: 1200×630px, generated or static per page

---

## Progressive Enhancement Plan

Every page must render meaningful content without JavaScript:

| Feature | Without JS | With JS |
|---|---|---|
| Navigation | Static HTML links | Animated drawer on mobile |
| Schedule | Static HTML table or GymDesk iframe | Enhanced filter UI |
| Trial form | Native HTML form submit | AJAX submit + inline success/error |
| Animations | Elements at final state | GSAP entrance/scroll animations |
| Page transitions | Standard browser navigation | View Transitions API |

Implementation rule: HTML is written first. JS is applied as enhancement layer.

---

## Dependency Philosophy

Before adding a dependency, answer:
1. Can native browser APIs do this? (If yes: no dependency)
2. Can it be implemented in < 50 lines? (If yes: implement it)
3. Is the dependency actively maintained with a history of security response? (Must be yes)
4. Does it tree-shake well? (Must be yes, or size justification required)

**Approved dependencies:**
- `gsap` — animation (explicitly required)
- `tailwindcss` — styling (explicitly required)
- `vite` — build tooling
- `vitest` — unit testing
- `@playwright/test` — E2E testing
- `typescript` — language
- `eslint` + `@typescript-eslint/*` — linting
- `prettier` — formatting
- `axe-core` / `@axe-core/playwright` — accessibility testing

**Everything else requires documented justification.**

---

## Scalability Plan

**Content scaling:**
- Programs sub-pages: add HTML files, no architectural change
- Blog/news: add `/news` directory, same pattern — requires no new system
- Instructors page: same pattern

**Feature scaling:**
- Online booking form: replace GymDesk embed with richer integration if API available
- Member portal: remains GymDesk — not built in-house
- E-commerce: Phase 2 — evaluate Shopify Buy SDK (embed) vs full platform migration

**Component scaling:**
- New components follow existing BaseElement pattern
- Design tokens extend, never replace existing values
- New token categories documented in `tokens.css` with comment headers
