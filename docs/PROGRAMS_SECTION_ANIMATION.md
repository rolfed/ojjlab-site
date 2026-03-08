# Programs Section — Cinematic Reveal: Expected Behaviour

## Overview

The Programs section delivers a three-phase cinematic sequence on desktop via `pinnedReveal()`.
Mobile gets a simple stagger fadeUp — no pin, no shrink.

**Entry point:** `OJJProgramsSection.bindEvents()` → `this.pinnedReveal({ trigger, heading, sub, track })`
**Executor:** `src/animations/animate.ts → pinnedReveal()`
**Note:** `pinHorizontal()` is NOT used here — it is a separate utility for basic horizontal scrolling.

---

## States

### State 0 — At rest (before section enters viewport)
- `<ojj-programs-section>` is below the fold
- Heading + subtitle are at their natural positions (no transform applied)
- Card track is at `x: 0` (natural flow position)

### State 1 — Section enters viewport (pre-pin)
- The section scrolls into view from below
- Heading "Programs for Every Level" is visible in the upper portion of the section
- Subtitle "From your first class..." is visible below heading
- All four program cards are visible in the lower portion of the viewport
- **Nothing is animated yet** — the pin has not kicked in

### State 2 — Pin engages (`start: 'top top'`)
- Trigger: top edge of `[data-programs]` reaches top edge of viewport
- The section is fixed to the viewport (GSAP pin spacer takes over document flow)
- Console logs: `[ST:programs] onEnter — pin active`
- The scrub animation begins responding to scroll

### State 3 — Heading phase (0%–40% of pin scroll range, 600px virtual scroll)
- Heading: translates upward to land exactly 80px (`NAV_CLEARANCE`) below the viewport top, shrinks to `scale: 0.55`
  - `y` is a lazy function re-evaluated on `invalidateOnRefresh`, so it always lands correctly regardless of viewport size
- Subtitle: fades out (`opacity: 0`) and drifts up (`y: -24px`)
- Card track: stays at `x: 0` — not yet moving
- Easing: `power2.inOut` on heading, `power2.in` on subtitle
- Scrub lag: 1 second

### State 4 — Track phase (40%–100% of pin scroll range)
- Heading: held at final position (80px below viewport top, `scale: 0.55`)
- Subtitle: held at `opacity: 0` (invisible)
- Card track: translates left by `trackDist` pixels — cards slide in from right
  - Youth BJJ → Jiu Jitsu 101 → Adult Jiu Jitsu → Competition Team
- Easing: `none` (linear, 1:1 with scroll)

### State 5 — Pin releases
- Trigger: scroll reaches `start + 600 + trackDist` pixels
- Console logs: `[ST:programs] onLeave — progress=1.00 pin released`
- Section un-pins and resumes normal document flow
- Next section ("Why Oregon Jiu Jitsu Lab?") scrolls into view naturally

---

## Scroll Math

```
Total pin scroll range = HEADING_PHASE_PX + trackDist
                       = 600 + Math.max(track.scrollWidth + naturalLeft - clientWidth, 0)

trackDist uses the wrap's geometry (not track.getBoundingClientRect, which includes
GSAP transforms) and document.documentElement.clientWidth (excludes scrollbar) so the
last card's right edge aligns with the visible content area, not the scrollbar-inclusive
window.innerWidth.

naturalLeft = trackWrap.getBoundingClientRect().left
            + parseFloat(getComputedStyle(trackWrap).paddingLeft)
            = 0 + 32 = 32px  (at default desktop layout)

At 1280px browser (1265px clientWidth with scrollbar), 4 cards × 384px + 3 gaps × 24px = 1608px track width
trackDist = 1608 + 32 - 1265 = 375px

Total pin range ≈ 975px of virtual scroll
```

Timeline proportions (`duration` controls relative weight):
- Heading tween: `duration: 0.4` → 40% of total
- Track tween: `duration: 0.6` → 60% of total

---

## Debug Console Logs

All logs are attached to the ScrollTrigger callbacks in `pinnedReveal()`. The label
is derived from the trigger element's first `data-*` attribute key (e.g. `programs`).

| Event | Log |
|-------|-----|
| Pin engages | `[ST:programs] onEnter — pin active` |
| Pin releases (scroll past end) | `[ST:programs] onLeave — progress=1.00 pin released` |
| Scroll back into pin | `[ST:programs] onEnterBack — progress=X.XX` |
| Scroll back above pin start | `[ST:programs] onLeaveBack — above pin start` |
| Every scroll tick | `[ST:programs] onUpdate — progress=X.XXX dir=1` (console.debug — enable Verbose in DevTools) |

---

## Mobile Behaviour (< 768px)

- `pinnedReveal()` returns `null` immediately — no ScrollTrigger created
- `[data-track]` is hidden (`hidden md:flex`)
- Mobile cards (`[data-mobile-cards]`) are shown in a single-column grid
- `scrollReveal(mobileCards, 'stagger')` — simple `fadeUp` stagger on scroll
- No horizontal scroll, no pin, no transform

---

## Reduced Motion Behaviour

- `window.matchMedia('(prefers-reduced-motion: reduce)').matches === true`
- `gsap.set(heading, { clearProps: 'all' })` — removes any GSAP transforms
- `gsap.set(sub, { clearProps: 'all' })` — same
- Returns `null` — no ScrollTrigger, no animation
- All content is immediately visible in its natural layout position

---

## Resize Behaviour

- `invalidateOnRefresh: true` — on `ScrollTrigger.refresh()` (fired by Turbo Drive on each navigation):
  - `end` function re-evaluates `trackDist` with current DOM geometry
  - Track `x` target re-evaluates via lazy function `() => -trackDist()`
  - Heading `y` target re-evaluates via lazy function `(_i, el) => NAV_CLEARANCE - el.getBoundingClientRect().top`
  - Pin spacer height is recalculated
- `isMobile()` is checked only at component mount

---

## Turbo Drive Integration

With `@hotwired/turbo` installed, the lifecycle is:

1. `turbo:before-render` fires → `ScrollTrigger.getAll().forEach(st => st.kill())` — all active ScrollTriggers including the pin are killed
2. Body swap occurs → `disconnectedCallback()` fires on `<ojj-programs-section>` → `AnimatableMixin.cleanup()` kills the tracked Timeline
3. `turbo:render` fires → `ScrollTrigger.refresh()` recalculates positions for the new page

On return navigation back to the home page, `connectedCallback()` re-fires, `bindEvents()` re-runs, and `pinnedReveal()` creates a fresh ScrollTrigger.

---

## Accessibility

- Section landmark: `<section aria-label="Programs for Every Level">`
- All four cards are in the DOM and accessible regardless of animation state
- At `scale: 0.55`, heading is still readable by screen readers (transforms do not affect the accessibility tree)
- Mobile `md:hidden` wrapper hides desktop layout from screen readers on mobile

---

## GSAP Configuration Reference

```typescript
// src/animations/animate.ts — pinnedReveal()

const HEADING_PHASE_PX = 600
const NAV_CLEARANCE = 80

// Clear any stale GSAP transform so trackDist reads the natural position.
gsap.set(track, { x: 0 })

const trackDist = (): number => {
  const wrap = track.parentElement!
  const wrapRect = wrap.getBoundingClientRect()
  const wrapPadLeft = parseFloat(getComputedStyle(wrap).paddingLeft)
  const naturalLeft = wrapRect.left + wrapPadLeft
  const viewportW = document.documentElement.clientWidth   // excludes scrollbar
  return Math.max(track.scrollWidth + naturalLeft - viewportW, 0)
}

const tl = gsap.timeline({
  scrollTrigger: {
    trigger,                                        // [data-programs] <section>
    start: 'top top',                               // pin when section top hits viewport top
    end: () => `+=${HEADING_PHASE_PX + trackDist()}`,
    pin: true,
    anticipatePin: 1,                               // prevents flash on fast scroll
    scrub: 1,                                       // 1s smoothing lag
    invalidateOnRefresh: true,                      // recalculate on resize / Turbo refresh
  },
})

// Phase 1 (40%): heading shrinks toward top of viewport
tl.to(heading, {
  y: (_i, el) => NAV_CLEARANCE - el.getBoundingClientRect().top,  // lazy — lands at 80px from top
  scale: 0.55,
  ease: 'power2.inOut',
  duration: 0.4,
})
tl.to(sub, { opacity: 0, y: -24, ease: 'power2.in', duration: 0.25 }, '<')

// Phase 2 (60%): card track scrolls left
tl.to(track, { x: () => -trackDist(), ease: 'none', duration: 0.6 })
```

---

## Known Limitations

1. **Heading not vertically centered at entry** — The heading sits in the upper ~25–30% of the viewport because `flex-1` on the heading-wrap must share space with the card track (~450–550px). True vertical centering would require an absolutely-positioned card track layout.
