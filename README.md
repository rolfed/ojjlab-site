# Oregon Jiu Jitsu Lab — Website

The official website for Oregon Jiu Jitsu Lab.

---

## Stack

| Concern | Tool |
|---|---|
| Language | TypeScript (strict) |
| Components | Standards-based Web Components |
| Styling | Tailwind CSS v4 |
| Animation | GSAP (reduced-motion aware) |
| Build | Vite |
| Unit/Integration Tests | Vitest |
| E2E Tests | Playwright |
| Accessibility Testing | axe-core (CI gate) |
| Edge Worker | Cloudflare Workers (Wrangler) |
| Hosting | Cloudflare Pages |

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

## Local Setup

### Prerequisites

- [Node.js 22+](https://nodejs.org)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`
- [direnv](https://direnv.net) — `brew install direnv`

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
CLOUDFLARE_API_TOKEN=    # Cloudflare User API token (Workers:Edit, Pages:Edit, Account Settings:Read)
CLOUDFLARE_ACCOUNT_ID=   # Found in the Cloudflare dashboard right sidebar
VITE_GYMDESK_SCHEDULE_URL=
VITE_GYMDESK_LOGIN_URL=
```

### 3. Configure Worker secrets

```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
```

Open `apps/worker/.dev.vars` and fill in:

```
GHL_API_KEY=
GHL_LOCATION_ID=
```

### 4. Allow direnv

direnv auto-loads `.env` into your shell whenever you `cd` into this project.

```bash
# Add to ~/.zshrc if not already there:
eval "$(direnv hook zsh)"
source ~/.zshrc

# Approve the .envrc in this repo (one time):
direnv allow .
```

### 5. Start the dev server

```bash
# Site only (http://localhost:5173)
pnpm dev

# Site + Worker together (http://localhost:5173 + http://localhost:8787)
make dev
```

---

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Typecheck + production build |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | Lint with ESLint |
| `pnpm typecheck` | TypeScript typecheck only |
| `pnpm publish:staging` | Build + deploy Pages + Worker to staging |
| `pnpm publish:prod` | Build + deploy Pages + Worker to production |

---

## Deploying

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in your shell (direnv handles this automatically).

```bash
# Deploy to staging (ojjlab-com.pages.dev)
pnpm publish:staging

# Deploy to production
pnpm publish:prod
```

See [docs/RUNBOOK_CLOUDFLARE.md](./docs/RUNBOOK_CLOUDFLARE.md) for first-time Cloudflare setup.

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
| [RUNBOOK_CLOUDFLARE.md](./docs/RUNBOOK_CLOUDFLARE.md) | Cloudflare Pages + Worker setup and ops |

---

## Engineering Principles

- Progressive enhancement — all pages are functional without JavaScript
- Mobile-first — base styles target 375px, scale up with breakpoints
- WCAG 2.2 AA — zero axe-core violations is a hard CI gate
- Performance-first — Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Minimal dependencies — every dependency requires documented justification
