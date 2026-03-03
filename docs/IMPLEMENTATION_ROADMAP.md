# /docs/IMPLEMENTATION_ROADMAP.md
# Oregon Jiu Jitsu Lab — Implementation Roadmap

---

## MVP Definition

A deployable site that:
1. Renders all 6 pages with real content
2. Passes Lighthouse CI thresholds (90/100/90/95)
3. Passes axe-core with zero violations on all pages
4. Trial class form submits successfully
5. GymDesk schedule embed loads (or shows fallback)
6. GymDesk login redirects correctly
7. All Playwright E2E scenarios pass on Chromium, Firefox, WebKit

**Not in MVP:**
- Shop with payment processing (link/redirect only)
- CMS for content editing
- Blog
- Member-only content beyond GymDesk redirect

---

## Phased Execution Plan

### Phase 0 — Foundation (Pre-implementation)
**Goal:** Project is configured, CI runs, and no code is written without a test.

Deliverables:
- [ ] Repository initialized, GitHub Actions configured
- [ ] Vite + TypeScript strict setup
- [ ] Tailwind configured with design tokens in `tokens.css`
- [ ] ESLint + Prettier configured and enforced
- [ ] Vitest + Playwright configured with base structure
- [ ] `BaseElement` abstract class written and tested
- [ ] Skip link + minimal shell HTML template validated
- [ ] Deployment pipeline to staging (Netlify/Vercel/Cloudflare) live

**Gate:** CI pipeline runs all checks. Deployment to staging is automatic on merge to `main`.

---

### Phase 1 — Design System + Layout Shell
**Goal:** All pages share a consistent, accessible, tested layout shell.

Build order (dependency-driven):
1. Design tokens — all other work depends on this
2. `ojj-icon` — used by nav, buttons
3. `ojj-button` — used everywhere
4. `ojj-site-header` + `ojj-nav` + `ojj-nav-drawer` — required for every page
5. `ojj-site-footer`
6. `ojj-page-hero` — used on every page's above-fold
7. Shell HTML for all 6 pages (heading, landmark structure, nav, footer only)

**Gate:**
- All components have passing unit tests
- All 6 shell pages pass axe-core
- Keyboard navigation (skip link, nav, drawer) verified by Playwright

---

### Phase 2 — Home + About Pages
**Goal:** Primary trust-building and conversion pages complete.

Build order:
1. `ojj-testimonial`
2. `ojj-instructor-card`
3. `ojj-trial-form` (without live endpoint — mock success)
4. Home page content assembly
5. About page content assembly

**Gate:**
- Trial form: validation, error states, success state tested (unit + E2E)
- Home + About axe-core clean
- Mobile nav fully functional on both pages
- Lighthouse CI passes

---

### Phase 3 — Schedule + Programs Pages
**Goal:** Core utility pages complete — the reason students return.

Build order:
1. `ojj-schedule-embed` (loading, loaded, error states)
2. `ojj-program-card`
3. Schedule page assembly
4. Programs page assembly (adult, youth, competition sections)

**Gate:**
- Schedule embed: loading/error/fallback states all tested
- Program cards: all CTAs functional
- URL param filter state (if GymDesk supports it) working or deferred to Phase 5
- Both pages axe-core clean

---

### Phase 4 — Shop + Login Pages + Production Readiness
**Goal:** Site is complete and production-ready.

Build order:
1. Shop page — product grid (static or linked to external) + placeholder for Phase 2 e-commerce
2. Login page — redirect implementation
3. SEO layer: meta tags, JSON-LD structured data, sitemap, robots.txt
4. Performance hardening: image optimization, font subsetting, critical CSS
5. Analytics integration (Plausible preferred)
6. Full Playwright suite execution on all pages + browsers
7. Manual accessibility audit
8. Content freeze + final Lighthouse CI run

**Gate:**
- All Playwright scenarios pass
- Zero axe violations
- Lighthouse: Performance ≥90, Accessibility 100, Best Practices ≥90, SEO ≥95
- Manual keyboard audit complete
- Manual screen reader audit complete
- Client content review and sign-off

---

### Phase 5 — Post-Launch Enhancements
Backlog (prioritized by business impact):
- Schedule filter UI (if GymDesk supports URL params)
- Shop: Shopify Buy SDK or full e-commerce evaluation
- Blog/news section
- View Transitions API page animations
- Sub-pages for individual programs
- Instructor profiles expansion

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GymDesk embed URL changes | Medium | High | Env var; fallback always present |
| Client delays providing content/photos | High | Medium | Use placeholders; decouple content from code |
| GymDesk schedule embed UX is poor | Medium | Medium | Document limitation; escalate to GymDesk API option |
| GSAP license compliance | Low | Low | GSAP free tier covers non-SaaS sites; verify terms |
| Browser support for View Transitions | Low | Low | Progressive enhancement; fallback is instant navigation |
| Tailwind v4 breaking changes | Low | Low | Pin to major version; test before upgrading |

---

## Drift Prevention Rules

1. **No undocumented architectural decisions.** New patterns require a docs update before implementation.
2. **No new dependencies without justification** in `TECHNICAL_ARCHITECTURE.md` Dependency Philosophy section.
3. **No new components without** entry in `COMPONENT_SYSTEM.md`.
4. **No merges without passing CI.** The pipeline is the enforcer, not reviews alone.
5. **Design token changes require** corresponding update in `tokens.css` and `TECHNICAL_ARCHITECTURE.md`.
6. **GymDesk integration changes require** update to `GYMDESK_INTEGRATION.md` before implementation.

---

## Documentation Update Protocol

When a doc needs updating:
1. Update the doc in the same PR as the code change
2. PR description includes: "Docs updated: [filename]"
3. Doc and code must be coherent at merge — no "docs to follow" accepted

When docs conflict with code:
- **Code is wrong.** Docs are the specification.
- Exception: if docs are demonstrably outdated, update docs first, then code.

---

## Production Readiness Definition

The site is production-ready when:

- [ ] All Phase 0–4 gates passed
- [ ] Custom domain configured and HTTPS active
- [ ] Analytics collecting data and verified
- [ ] GymDesk embed URLs pointing to production GymDesk account
- [ ] Trial form submitting to production endpoint
- [ ] 404 page functional
- [ ] All environment variables set in production hosting platform
- [ ] Lighthouse CI run on production URL (not localhost)
- [ ] Backup/rollback strategy documented (hosting platform handles this)
- [ ] Client trained on how to request content changes
