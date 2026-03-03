# /docs/COMPONENT_SYSTEM.md
# Oregon Jiu Jitsu Lab — Component System

---

## Design System Philosophy

- Components are built for **composition, not configuration**
- A component does one thing and does it accessibly
- Styling lives in Tailwind utilities applied to HTML; tokens provide the values
- Components expose a minimal, documented API — no surprise behaviors
- Every component is independently testable in isolation

---

## Naming Conventions

**Custom element names:** `ojj-[noun]` or `ojj-[noun]-[modifier]`
- `ojj-button`
- `ojj-nav`
- `ojj-nav-drawer`
- `ojj-hero`
- `ojj-trial-form`
- `ojj-schedule-embed`
- `ojj-program-card`
- `ojj-testimonial`

**File names:** `[ComponentName].ts` — PascalCase matching the class name
**Class names:** `OJJButton`, `OJJNavDrawer`, `OJJScheduleEmbed`

**CSS class names (Tailwind-first):** Utility classes only. Custom classes only for states that Tailwind cannot express.

**Events:** `ojj:[event-name]` — namespaced, kebab-case
- `ojj:nav-open`
- `ojj:nav-close`
- `ojj:form-submit`
- `ojj:form-success`
- `ojj:form-error`

---

## Component API Rules

**Attributes (HTML-facing):** Use for configuration set at HTML authoring time.
```html
<ojj-button variant="primary" size="lg" disabled>Book a Free Trial</ojj-button>
```
- Always strings or booleans
- Reflected to properties via `static observedAttributes`
- Boolean attributes follow HTML convention: presence = true, absence = false

**Properties (JS-facing):** Use for complex data or programmatic control.
```ts
scheduleEmbed.filterOptions = { day: 'monday', level: 'beginner' };
```
- Objects, arrays, functions
- Never set via HTML attribute

**Slots:** Use for content injection into templates.
```html
<ojj-program-card>
  <span slot="title">Adult BJJ</span>
  <p slot="description">...</p>
  <img slot="image" src="..." alt="...">
</ojj-program-card>
```

**No callbacks as attributes.** Events only for outbound communication.

---

## UI Primitives

### `ojj-button`
- **Variants:** `primary`, `secondary`, `ghost`
- **Sizes:** `sm`, `md` (default), `lg`
- **Attributes:** `variant`, `size`, `disabled`, `type` (button|submit|reset), `href` (renders as `<a>` if set)
- **Shadow DOM:** Yes
- **Accessibility:** Renders as `<button>` or `<a>`. `disabled` applied as attribute + `aria-disabled`. Never `div` or `span`.
- **States styled:** default, hover, focus (custom focus ring meeting 2.4.11), active, disabled

### `ojj-icon`
- **Attributes:** `name` (SVG sprite ID), `size`, `aria-label` (if decorative, omit — component sets `aria-hidden="true"`)
- **Shadow DOM:** Yes
- **Accessibility:** Decorative by default (`aria-hidden="true"`). Informative: `aria-label` required.

### `ojj-badge`
- **Variants:** `belt-white`, `belt-blue`, `belt-purple`, `belt-brown`, `belt-black`, `program`, `new`
- **Shadow DOM:** Yes
- **Accessibility:** Inline text. No interactive behavior. Color supplemented by text.

---

## Layout Components

### `ojj-site-header`
- **Shadow DOM:** No (participates in global layout)
- **Contains:** Logo, `ojj-nav`, CTA button, hamburger trigger
- **Behavior:** Sticky on scroll past 100px (adds class `is-scrolled`)
- **Accessibility:** `<header>` landmark. Skip link is first child of document body, not this component.
- **Attributes:** None (static)

### `ojj-nav`
- **Shadow DOM:** No
- **Contains:** `<nav aria-label="Main">` with link list
- **Desktop:** Horizontal. **Mobile:** Hidden, controlled by `ojj-nav-drawer`
- **Accessibility:** `aria-current="page"` on active link, set server-side via HTML

### `ojj-nav-drawer`
- **Shadow DOM:** No
- **Behavior:** Controlled via `open` attribute. Opens/closes with animation (respects `reducedMotion`).
- **Attributes:** `open` (boolean)
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-label="Navigation menu"`. Focus trapped inside when open. Escape closes. Focus returns to trigger on close.

### `ojj-site-footer`
- **Shadow DOM:** No
- **Contains:** Logo, nav links, address, social links, legal copy
- **Accessibility:** `<footer>` landmark. Address in `<address>` element.

### `ojj-page-hero`
- **Shadow DOM:** No
- **Slots:** `heading`, `subheading`, `cta`, `media`
- **Behavior:** GSAP entrance animation (reducedMotion-aware)
- **Accessibility:** Background images are decorative. No content conveyed by background only.

---

## Page Modules

### `ojj-trial-form`
- **Shadow DOM:** No (must participate in form)
- **Behavior:** Collects Name, Email, Phone, Preferred Day. Submits to endpoint or form service. Shows inline success/error.
- **Attributes:** `action` (form endpoint URL), `method` (get|post)
- **Accessibility:** Full form accessibility requirements (see ACCESSIBILITY_STANDARDS.md). Error announced via live region. Success announced via `role="status"`.
- **Testing:** Unit test validation logic. E2E test full submit flow.

### `ojj-schedule-embed`
- **Shadow DOM:** No
- **Behavior:** Wraps GymDesk schedule iframe. Shows loading skeleton. Shows error state if iframe fails.
- **Attributes:** `src` (GymDesk embed URL), `title`
- **Accessibility:** `<iframe title="Class Schedule">`. Loading state announced via live region.

### `ojj-program-card`
- **Shadow DOM:** Yes
- **Slots:** `image`, `title`, `description`, `cta`
- **Accessibility:** Card is not interactive. Internal CTA (`ojj-button`) is the interactive element. Heading level set via `heading-level` attribute (default: 3).

### `ojj-testimonial`
- **Shadow DOM:** Yes
- **Slots:** `quote`, `attribution`
- **Accessibility:** `<blockquote>` for quote. `<cite>` for attribution. No carousel — static grid.

### `ojj-instructor-card`
- **Shadow DOM:** Yes
- **Slots:** `photo`, `name`, `belt`, `bio`
- **Accessibility:** `<article>` wrapper. Belt information not conveyed by color alone.

### `ojj-map-embed`
- **Shadow DOM:** No
- **Behavior:** Google Maps iframe with lazy loading. Falls back to address + directions link.
- **Attributes:** `src`, `address`
- **Accessibility:** `<iframe title="Map to Oregon Jiu Jitsu Lab">`. Fallback link always visible.

---

## Accessibility Expectations Per Component Type

| Type | Expectation |
|---|---|
| Interactive (button, link) | Keyboard operable, visible focus, accessible name |
| Form | Label association, error handling, live regions |
| Modal/Drawer | Focus trap, Escape closes, focus returns to trigger |
| Decorative (icon, background) | `aria-hidden="true"` |
| Dynamic content | `aria-live` region, appropriate politeness level |
| Cards | Not interactive wrapper; interactive elements inside have individual labels |
| Embeds (iframe) | `title` attribute required; loading/error states announced |

---

## Testing Expectations Per Component Type

| Component Type | Unit Tests | Integration Tests | E2E Tests |
|---|---|---|---|
| UI Primitive | Render, attribute reflection, event emission | - | - |
| Layout | Render, slot projection, landmark presence | Mobile/desktop breakpoint | Skip link, nav keyboard |
| Interactive module | State transitions, event handling, validation | Form submission flow | Full user journey |
| Embed | Loading/error state logic | - | Iframe presence, fallback |

See TESTING_STRATEGY.md for full testing requirements.
