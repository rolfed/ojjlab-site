# /docs/UX_STRATEGY.md
# Oregon Jiu Jitsu Lab — UX Strategy

---

## Information Architecture

```
/ (Home)
├── /about
├── /schedule
├── /programs
│   ├── /programs/adult-bjj
│   ├── /programs/youth-bjj
│   └── /programs/competition-team
├── /shop
└── /login
```

**Decision:** Flat hierarchy. No sub-navigation complexity at MVP. Programs expands if content warrants sub-pages; otherwise single page with anchor sections.

---

## Navigation Model

### Desktop
- Fixed top navigation bar
- Logo (left) → Nav links (center or right) → Primary CTA button "Book a Free Trial" (right, high-contrast)
- Links: Home, About, Schedule, Programs, Shop, Login
- No mega-menus. No dropdowns at MVP.
- Active page indicated via underline + color token, not bold weight alone (contrast-safe)

### Mobile
- Fixed top bar: Logo (left) + Hamburger (right)
- Full-screen slide-in drawer on open
- Nav links stacked vertically, large tap targets (min 44×44px)
- CTA "Book a Free Trial" pinned at bottom of drawer
- Drawer closes on link selection, Escape key, or outside tap
- No bottom navigation bar — drawer pattern is sufficient

### Keyboard Navigation
- Tab order: Skip link → Logo → Nav links → Main CTA → Page content
- Skip-to-main-content link is the first focusable element (visible on focus)
- Hamburger button: `aria-expanded` toggled, `aria-controls` references drawer ID

---

## Page Role Definitions

| Page | Primary Role | Secondary Role |
|---|---|---|
| Home | Impression → Intent | Brand trust anchor |
| About | Trust builder | Lineage + instructor credibility |
| Schedule | Decision enabler | GymDesk gateway |
| Programs | Segmentation engine | Trial conversion |
| Shop | Revenue channel | Brand merchandise |
| Login | Utility / retention | GymDesk authentication |

---

## Conversion Funnel Positioning

```
Awareness → Interest → Consideration → Intent → Action
  Home       About       Programs       Schedule   Booking Form
                                        About
```

Every page contains:
1. A contextually relevant secondary CTA (schedule or trial)
2. Social proof element (testimonial, student count, lineage marker)
3. No dead ends — every terminal section links forward

---

## 2026 UX Best Practices Applied

**Applied patterns:**
- Container queries over media queries for component responsiveness
- View Transitions API for page-to-page navigation (progressive — falls back to no transition)
- `prefers-reduced-motion` respected at CSS and JS layers
- Scroll-driven animations replacing JS scroll listeners where possible
- Declarative popover API for modals/drawers (no custom focus trap needed where supported)
- `:has()` selector for state-driven styling without JS
- `loading="lazy"` and `fetchpriority="high"` on LCP images
- Font subsetting + `font-display: swap`

**Not applied (premature):**
- AI-personalized content
- Persistent user state without login
- Gesture-based navigation

---

## Cognitive Load Reduction Strategy

**Page-level rules:**
- One primary CTA per page (never compete with itself)
- Hero section answers: What is this? Who is it for? What do I do next?
- No carousels for primary content — static grids preferred
- Schedule page: filter-first, calendar-second
- Programs page: persona-match first ("Are you an adult beginner?")

**Copy rules:**
- Headlines ≤ 8 words
- Body paragraphs ≤ 3 sentences in marketing sections
- CTAs use action verbs: "Book", "View", "Start", not "Learn More", "Click Here"

**Visual rules:**
- Maximum 2 typefaces (heading + body)
- Maximum 4 colors in active UI (primary, secondary, neutral, accent)
- Whitespace is structure — no section cramming

---

## Content Hierarchy Rules

Every page follows this stack:
1. **Hook** — What this page does for you (headline + sub)
2. **Proof** — Why believe it (instructor, photos, testimonials)
3. **Detail** — Specific information (schedule times, program descriptions)
4. **Action** — What to do next (CTA)

No page inverts this order. No page skips Hook or Action.

---

## Motion Philosophy

**GSAP is permitted for:**
- Hero entrance animations (opacity + transform, no layout-affecting properties)
- Scroll-triggered reveals (opacity + translateY only)
- Nav drawer open/close (transform: translateX)
- Page transition overlays if View Transitions API not supported

**GSAP is forbidden for:**
- Animating layout properties (width, height, padding, margin)
- Continuous/looping animations on non-decorative elements
- Any animation that conveys information not available statically

**`prefers-reduced-motion` contract:**
- All GSAP timelines check `window.matchMedia('(prefers-reduced-motion: reduce)')`
- If reduced motion: set all animated elements to final state immediately, skip tweens
- CSS animations: `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`
- This is enforced at the base component level, not per-animation

---

## Trust-Building Strategy (Martial Arts Context)

BJJ carries a high trust threshold due to: physical contact, instructor authority, community culture.

**Trust signals in priority order:**
1. Instructor lineage (belt, who they trained under, affiliation)
2. Real photography — mats, students, instructor — no stock photos
3. Transparent pricing (or "contact for pricing" if not public)
4. Belt/rank progression explanation (demystifies BJJ for beginners)
5. Student testimonials with names + duration training
6. Affiliation badges (IBJJF, UAEJJF, or association logos if applicable)
7. Address, phone, and Google Maps embed (legitimacy markers)
8. Social proof: active Instagram feed or student count

**Anti-patterns to avoid:**
- Aggressive popups or chat widgets within first 5 seconds
- "Limited time offer" language — undermines authenticity
- Stock martial arts photography
- Vague about pricing without a clear next step
