# Oregon Jiu Jitsu Lab — Website

The official website for Oregon Jiu Jitsu Lab.

---

## Stack

| Concern | Tool |
|---|---|
| Language | TypeScript (strict) |
| Components | Standards-based Web Components |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | GSAP (reduced-motion aware) |
| Build | Vite |
| Unit/Integration Tests | Vitest |
| E2E Tests | Playwright |
| Accessibility Testing | axe-core (CI gate) |

**No frontend frameworks.** React, Vue, Svelte, Astro, and Next.js are explicitly excluded.

---

## Pages

- `/` — Home
- `/about` — About
- `/schedule` — Schedule (GymDesk embed)
- `/programs` — Programs
- `/shop` — Shop
- `/login` — Login (GymDesk redirect)

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values.

```
VITE_GYMDESK_SCHEDULE_URL=   # GymDesk schedule embed URL
VITE_GYMDESK_LOGIN_URL=      # GymDesk member login URL
```

---

## Documentation

All architectural decisions, standards, and implementation guidance live in [`/docs`](./docs).

| Document | Purpose |
|---|---|
| [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) | Mission, personas, objectives, assumptions |
| [UX_STRATEGY.md](./docs/UX_STRATEGY.md) | IA, navigation, content hierarchy, motion |
| [ACCESSIBILITY_STANDARDS.md](./docs/ACCESSIBILITY_STANDARDS.md) | WCAG 2.2 AA standards, component checklist |
| [TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md) | Architecture decisions, folder structure, tooling |
| [COMPONENT_SYSTEM.md](./docs/COMPONENT_SYSTEM.md) | Component API, naming, design system |
| [TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md) | TDD workflow, Playwright setup, CI gates |
| [GYMDESK_INTEGRATION.md](./docs/GYMDESK_INTEGRATION.md) | Schedule embed, login redirect, fallbacks |
| [IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) | Phased plan, MVP definition, risk assessment |

Docs are the specification. Code follows docs. If they conflict, update docs first.

---

## Engineering Principles

- Progressive enhancement — all pages are functional without JavaScript
- WCAG 2.2 AA — zero axe-core violations is a hard CI gate
- TDD — tests are written before implementation
- Performance-first — Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Minimal dependencies — every dependency requires documented justification

---

## Current Phase

See [IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) for the phased build plan.

**Current:** Phase 0 — Foundation
