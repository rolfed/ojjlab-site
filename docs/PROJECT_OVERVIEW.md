# /docs/PROJECT_OVERVIEW.md
# Oregon Jiu Jitsu Lab — Project Overview

---

## Website Mission

Establish Oregon Jiu Jitsu Lab's digital presence as the authoritative, trustworthy resource for BJJ training in Oregon. Convert curious visitors into trial class bookings. Retain students through seamless schedule access and account management.

---

## Business Objectives

| Priority | Objective | Measurement |
|---|---|---|
| 1 | Drive trial class sign-ups | Form submissions / month |
| 2 | Reduce friction for existing students | Schedule page session time < 10s |
| 3 | Establish credibility and brand authority | Bounce rate < 45% |
| 4 | Enable gear/apparel revenue | Shop conversion rate |
| 5 | Support GymDesk member management | Login success rate, support ticket volume |

---

## Success Metrics

**Acquisition**
- Organic search ranking: top 3 for "jiu jitsu [city/region]" keywords
- Trial class form completions: tracked via analytics event
- Cost per acquisition from organic: $0 (SEO-first strategy)

**Engagement**
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 on all pages
- Lighthouse score: 90+ on Performance, Accessibility, SEO, Best Practices
- Time on Schedule page: > 30s median

**Retention**
- Returning visitor rate: > 40%
- GymDesk login click-through rate from site: tracked

**Accessibility**
- Zero automated WCAG 2.2 AA violations (axe-core CI gate)
- Manual audit: keyboard-only completion of all primary user journeys

---

## User Personas

### Persona 1: The Curious Adult (Primary)
- Age 25–45, no martial arts background
- Searching for a hobby, fitness outlet, or self-defense skill
- Decision mode: comparison shopping, needs trust signals fast
- Devices: mobile-first (65%+ of traffic)
- Goal: understand what BJJ is, see class options, book a trial

### Persona 2: The Transfer Student
- Has trained BJJ elsewhere, relocated to Oregon
- Needs: schedule, location, instructor credentials, mat culture signals
- Decision speed: fast — already sold on BJJ
- Goal: find schedule, assess lineage/culture, contact or show up

### Persona 3: The Parent (Youth Programs)
- Age 30–50, researching kids' martial arts
- Needs: safety signals, structured curriculum, instructor background
- High trust threshold before contact
- Goal: understand youth program, book trial or call

### Persona 4: The Existing Member
- Already enrolled, returns for schedule and account access
- Low patience for friction
- Goal: check class times, log into GymDesk, buy gear

---

## Core User Journeys Per Page

**Home**
- Land → understand value prop (< 5 seconds) → CTA to trial class or schedule

**About**
- Land → learn instructor/lineage → build trust → CTA to trial or programs

**Schedule**
- Land → find relevant class by day/time/level → CTA to book or log in

**Programs**
- Land → identify applicable program (adult, youth, competition) → CTA to trial or schedule

**Shop**
- Land → browse gear → purchase or external redirect → return

**Login**
- Land → authenticate via GymDesk → redirect to member portal

---

## Conversion Strategy

Primary conversion: **Trial Class Booking**
- Single, high-contrast CTA on every page above the fold
- CTA copy: "Book a Free Trial" (not "Contact Us", not "Learn More")
- Form: Name, Email, Phone, Preferred Day — 4 fields max
- No account creation required for trial booking

Secondary conversion: **Schedule Engagement**
- Frictionless schedule view (no login wall for read-only schedule)
- GymDesk embed for live schedule data

Tertiary: **Shop Purchase**
- Low-friction product browsing
- External checkout acceptable for MVP

---

## Non-Negotiable Engineering Principles

1. **TypeScript strict mode** — no `any`, no implicit types
2. **Standards-based Web Components** — no framework abstractions
3. **Progressive enhancement** — pages must function without JS
4. **Performance-first** — no render-blocking resources, no layout shift
5. **TDD** — unit tests written before implementation
6. **WCAG 2.2 AA** — accessibility is a build gate, not a QA afterthought
7. **Minimal dependencies** — every dependency requires justification
8. **SEO-conscious** — semantic HTML, structured data, proper heading hierarchy

---

## Explicit Assumptions

- GymDesk is the current and planned member management system
- No existing codebase — greenfield build
- No dedicated design team — system generates its own design language from tokens
- Hosting: static-capable (Netlify, Vercel, or Cloudflare Pages)
- Domain and DNS: managed externally, not in scope
- Analytics: Google Analytics 4 or Plausible (privacy-first preferred)
- No CMS required for MVP — content managed via source files
- Shop for MVP: external link or minimal product display; full e-commerce in Phase 2
- Instructor name, lineage, and program details to be provided by client
- Photography/video assets to be provided by client; placeholders used in development
