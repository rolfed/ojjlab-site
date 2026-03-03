# /docs/ACCESSIBILITY_STANDARDS.md
# Oregon Jiu Jitsu Lab — Accessibility Standards

---

## WCAG 2.2 AA Interpretation

Target: WCAG 2.2 Level AA, full conformance.
Aspirational: Level AAA on perceivable criteria where feasible without degrading UX.

**New in 2.2 that apply to this site:**
- **2.4.11 Focus Appearance (AA):** Focus indicators must have minimum 3:1 contrast ratio against adjacent color and enclose at least the component perimeter
- **2.5.3 Label in Name:** Interactive elements whose label is visible must have that text in their accessible name
- **3.2.6 Consistent Help (A):** If a contact mechanism appears on multiple pages, it must be in the same relative location
- **3.3.7 Redundant Entry (A):** Form info previously entered must not be required again in same session
- **2.4.12 Focus Not Obscured (AA):** Focused element must not be entirely hidden by sticky/fixed elements

---

## Landmark Structure Requirements

Every page must contain exactly:

```html
<header role="banner">        <!-- site header, nav -->
<nav aria-label="Main">       <!-- primary navigation -->
<main id="main-content">      <!-- page-specific content -->
<footer role="contentinfo">   <!-- site footer -->
```

Additional landmarks as needed:
```html
<nav aria-label="Breadcrumb">         <!-- if breadcrumbs exist -->
<section aria-labelledby="[heading-id]"> <!-- distinct content regions -->
<aside aria-label="[description]">    <!-- supplementary content -->
```

**Rules:**
- Only one `<main>` per page
- `<nav>` always has a distinct `aria-label` if more than one exists per page
- `<section>` must have an accessible name (via `aria-labelledby` or `aria-label`)
- `<div>` is never used as a landmark replacement

---

## Heading Structure Rules

- `<h1>`: Exactly one per page. Contains the page's primary topic.
- `<h2>`: Major sections within the page
- `<h3>`: Sub-sections within an `<h2>` section
- No heading levels skipped (h1 → h3 without h2 is a violation)
- Headings convey structure, not visual size — use CSS for sizing
- Navigation labels are NOT headings

**Home page heading example:**
```
h1: Oregon Jiu Jitsu Lab
  h2: Adult Brazilian Jiu Jitsu
  h2: Youth Programs
  h2: What Our Students Say
  h2: Find Us
```

---

## Keyboard Interaction Standards

All interactive elements must be operable via keyboard.

| Element | Expected Keyboard Behavior |
|---|---|
| Links | `Tab` to focus, `Enter` to activate |
| Buttons | `Tab` to focus, `Enter` or `Space` to activate |
| Nav drawer | `Escape` closes, focus returns to trigger |
| Modal/Dialog | Focus trapped inside, `Escape` closes |
| Schedule filters | `Tab` between options, `Space`/`Enter` to select |
| Form inputs | Standard browser behavior, no custom override |
| Custom dropdowns | Arrow keys navigate options, `Enter` selects, `Escape` collapses |

**Tab order must be logical** — matches visual reading order. Never use `tabindex > 0`.

Allowed `tabindex` values:
- `tabindex="0"` — add custom element to tab order
- `tabindex="-1"` — remove from tab order, allow programmatic focus

---

## Focus Management Rules

**When focus MUST be moved programmatically:**
- Navigation drawer opens: focus moves to first link inside drawer
- Navigation drawer closes: focus returns to hamburger button
- Modal opens: focus moves to modal heading or first interactive element
- Modal closes: focus returns to trigger element
- In-page form submission success: focus moves to success message container (with `tabindex="-1"`)
- In-page form error: focus moves to error summary, not first error field

**Focus must never:**
- Disappear into a void (black hole focus)
- Be trapped without an escape mechanism
- Skip over visible interactive elements

---

## ARIA Usage Policy

**Use ARIA only when native HTML is insufficient.**

### Allowed patterns:
```html
<!-- Describe state -->
<button aria-expanded="false" aria-controls="nav-drawer">Menu</button>

<!-- Label unlabeled elements -->
<button aria-label="Close navigation menu">×</button>

<!-- Live regions for dynamic content -->
<div role="status" aria-live="polite" aria-atomic="true"></div>
<div role="alert" aria-live="assertive"></div>

<!-- Labeling form groups -->
<fieldset><legend>Preferred training day</legend></fieldset>

<!-- Current page in nav -->
<a href="/schedule" aria-current="page">Schedule</a>
```

### Forbidden patterns:
```html
<!-- Redundant ARIA -->
<button role="button">          <!-- role="button" is implicit -->
<nav role="navigation">         <!-- role="navigation" is implicit -->
<h2 role="heading">             <!-- role is implicit -->

<!-- ARIA that lies -->
<div role="button">             <!-- Use <button> instead -->
<span role="link" tabindex="0"> <!-- Use <a> instead -->

<!-- Hiding visible content from AT -->
<p aria-hidden="true">Important information</p>
```

---

## Animation Accessibility Constraints

1. All GSAP animations must check `prefers-reduced-motion` before playing
2. Component base class exposes `reducedMotion` boolean — all components use it
3. No animation conveys information unavailable in static state
4. No animation lasts more than 5 seconds unless user-controlled
5. No flashing content > 3 times per second (seizure threshold)
6. Parallax scrolling is disabled under `prefers-reduced-motion`
7. Loading spinners: use `role="status"` with live region for screen reader announcement

```ts
// Base pattern — all animated components use this
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) {
  gsap.from(el, { opacity: 0, y: 20, duration: 0.4 });
} else {
  // Element is already in final state via CSS
}
```

---

## Form Accessibility Rules

- Every `<input>`, `<select>`, `<textarea>` has a programmatically associated `<label>`
- `placeholder` is not a label replacement
- Required fields: marked with `required` attribute + visible indicator (asterisk with legend)
- Error messages: associated via `aria-describedby`, not just visual proximity
- Error state: `aria-invalid="true"` on the input
- Success messages: announced via `role="status"` live region
- No timeout on form sessions
- Multi-step forms: announce step progress via `aria-live` region

```html
<!-- Required field pattern -->
<label for="email">
  Email address
  <span aria-hidden="true" class="required-indicator">*</span>
</label>
<input
  type="email"
  id="email"
  name="email"
  required
  aria-required="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert" aria-live="assertive" hidden>
  Please enter a valid email address.
</p>
```

---

## Contrast + Typography Standards

**Text contrast minimums (WCAG 2.2 AA):**
- Normal text (< 18pt / < 14pt bold): 4.5:1
- Large text (≥ 18pt / ≥ 14pt bold): 3:1
- UI components and graphical objects: 3:1
- Focus indicators: 3:1 against adjacent colors

**Typography rules:**
- Base font size: 16px minimum (1rem)
- Line height: 1.5 minimum for body text
- Letter spacing: never overridden to a value that causes illegibility
- Font scaling: layout must not break at 200% zoom
- No text as image (except logos)
- System font stack as fallback before custom fonts load

**Type scale (defined as design tokens):**
```
--text-xs:   0.75rem   (12px)
--text-sm:   0.875rem  (14px)
--text-base: 1rem      (16px)
--text-lg:   1.125rem  (18px)
--text-xl:   1.25rem   (20px)
--text-2xl:  1.5rem    (24px)
--text-3xl:  1.875rem  (30px)
--text-4xl:  2.25rem   (36px)
--text-5xl:  3rem      (48px)
```

---

## Component-Level Accessibility Checklist

For every component before merge:

- [ ] Correct semantic HTML element used
- [ ] Accessible name present (label, aria-label, or aria-labelledby)
- [ ] Keyboard operable — all interactions achievable without mouse
- [ ] Focus visible — custom focus indicator meets 2.4.11
- [ ] ARIA state reflects visual state (expanded, selected, checked, invalid)
- [ ] Color not the only means of conveying information
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Screen reader tested (VoiceOver + Safari, NVDA + Firefox minimum)
- [ ] Contrast ratios verified with browser DevTools or axe
- [ ] Touch targets: minimum 44×44px on mobile

---

## Accessibility Definition of Done

A feature is not done until:

1. `axe-core` reports zero violations in automated test
2. Keyboard-only navigation completes the feature's primary interaction
3. Screen reader announces state changes correctly (tested manually)
4. Focus management is correct for any dynamic content
5. `prefers-reduced-motion` disables all non-essential animation
6. Color contrast verified at all interactive states (default, hover, focus, disabled)
7. Playwright accessibility test passes (see TESTING_STRATEGY.md)
