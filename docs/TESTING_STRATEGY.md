# /docs/TESTING_STRATEGY.md
# Oregon Jiu Jitsu Lab — Testing Strategy

---

## TDD Workflow Definition

**Red → Green → Refactor. Always.**

1. Write a failing test that describes the expected behavior
2. Write the minimum code to make it pass
3. Refactor without breaking the test
4. Commit only when tests pass

**No exceptions.** Components with no tests do not merge.

**Test file co-location rule:**
```
src/components/primitives/OJJButton.ts
tests/unit/OJJButton.test.ts       ← unit test
tests/integration/OJJButton.test.ts ← integration test if applicable
```

---

## Unit Test Scope (Vitest)

Unit tests cover **isolated component behavior**. No DOM rendering required for logic tests.

**What to unit test:**
- Attribute reflection to properties
- Property getters/setters
- Event emission (correct event name, detail, bubbles/composed)
- State transitions (open → closed, loading → loaded → error)
- Form validation logic
- Utility functions in `src/scripts/`
- Animation guard (`reducedMotion` check)
- ARIA state updates (attribute changes)

**What NOT to unit test at this level:**
- Visual appearance (that's Playwright's job)
- Third-party embed behavior (GymDesk)
- Network requests (mocked at integration level)

**Vitest config:**
- Environment: `happy-dom` (lightweight, fast)
- Coverage: V8 provider, 80% minimum threshold per component file
- No snapshot tests for logic — snapshots are brittle; use explicit assertions

```ts
// Example unit test pattern
import { describe, it, expect, vi } from 'vitest';
import { OJJButton } from '../../src/components/primitives/OJJButton';

describe('OJJButton', () => {
  it('reflects variant attribute to property', () => {
    const el = document.createElement('ojj-button') as OJJButton;
    el.setAttribute('variant', 'secondary');
    expect(el.variant).toBe('secondary');
  });

  it('emits no custom event on click by default', () => {
    const el = document.createElement('ojj-button') as OJJButton;
    const handler = vi.fn();
    el.addEventListener('ojj:button-click', handler);
    el.click();
    expect(handler).not.toHaveBeenCalled(); // uses native click
  });
});
```

---

## Integration Test Scope (Vitest)

Integration tests cover **component interactions within a rendered page fragment**.

**What to integration test:**
- Trial form: validation → submission → success/error state transitions
- Nav drawer: trigger → open → keyboard nav → close → focus return
- Schedule embed: loading state → iframe render → error fallback
- Form error handling: invalid submit → error message presence → aria-invalid state

**Environment:** `happy-dom` or `jsdom` with real DOM rendering via `customElements.define`

**Mock strategy:**
- Network: `vi.mock` or MSW (Mock Service Worker) for fetch calls
- GymDesk iframe: mock `src` with local test fixture

---

## Playwright MCP (In-Session Browser Testing)

The Playwright MCP server is configured in Claude Code settings. It provides live browser tools during development:

```
browser_navigate    — load a URL (e.g. http://localhost:5173)
browser_screenshot  — capture current viewport as image
browser_snapshot    — accessibility tree snapshot (faster than screenshot for logic checks)
browser_click       — interact with elements
browser_resize      — switch between mobile/desktop viewports
```

### Standard self-test workflow

After completing any UI change, before committing:

```
1. pnpm dev                          (in terminal)
2. browser_navigate http://localhost:5173
3. browser_resize 375 812            (iPhone SE — mobile-first check)
4. browser_screenshot                (inspect layout)
5. browser_resize 1280 800           (desktop check)
6. browser_screenshot
7. Verify UX checklist from UX_STRATEGY.md
8. Run axe via Playwright if structural changes made
```

### Mobile viewport sizes used for self-testing

| Label      | Width | Height | Breakpoint |
|------------|-------|--------|------------|
| iPhone SE  | 375   | 667    | base       |
| iPhone 14  | 390   | 844    | base       |
| Tablet     | 768   | 1024   | sm         |
| Desktop    | 1280  | 800    | lg         |

---

## Playwright Setup Structure

```
tests/e2e/
├── fixtures/
│   ├── test-data.ts          # Deterministic test input values
│   └── page-objects/         # Page Object Models
│       ├── HomePage.ts
│       ├── SchedulePage.ts
│       ├── TrialFormPage.ts
│       └── NavPage.ts
├── home.spec.ts
├── about.spec.ts
├── schedule.spec.ts
├── programs.spec.ts
├── shop.spec.ts
├── login.spec.ts
└── accessibility.spec.ts     # Cross-page axe-core tests
```

**`playwright.config.ts` requirements:**
- Projects: `chromium`, `firefox`, `webkit`
- Mobile project: `Mobile Chrome` (Pixel 5 viewport)
- Base URL: from environment variable `BASE_URL` (default: `http://localhost:5173`)
- Screenshot on failure: yes
- Video: `retain-on-failure`
- Reporter: `html` + `github` in CI

---

## Selector Strategy

**Priority order (strictest to most fragile):**
1. `getByRole` with accessible name — preferred
2. `getByLabel` — for form inputs
3. `getByTestId` — for elements with no accessible semantics
4. `locator('[data-testid="..."]')` — explicit test ID
5. CSS class selectors — FORBIDDEN in E2E tests
6. XPath — FORBIDDEN

```ts
// Correct
await page.getByRole('button', { name: 'Book a Free Trial' }).click();
await page.getByLabel('Email address').fill('test@example.com');
await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Schedule' }).click();

// Forbidden
await page.locator('.cta-button').click();
await page.locator('button.primary').click();
```

**`data-testid` usage:**
- Applied to elements that have no accessible role or name
- Format: `data-testid="[component]-[element]"` e.g., `data-testid="trial-form-success"`
- Never use for elements accessible via `getByRole` or `getByLabel`

---

## Deterministic Data Rules

- All test data defined in `tests/e2e/fixtures/test-data.ts`
- No hardcoded strings in test files — import from fixtures
- Form data: use consistent test values that never change
- No reliance on external APIs returning live data in E2E tests
- GymDesk embed tests: mock or skip live API — test the wrapper component behavior only

```ts
// tests/e2e/fixtures/test-data.ts
export const TRIAL_FORM_DATA = {
  name: 'Alex Torres',
  email: 'alex.torres.test@ojjlab.dev',
  phone: '503-555-0100',
  preferredDay: 'Tuesday',
} as const;
```

---

## CI Integration Expectations

**Pipeline (GitHub Actions):**

```yaml
jobs:
  quality:
    steps:
      - lint          # ESLint — must pass
      - typecheck     # tsc --noEmit -- must pass
      - unit-tests    # Vitest -- must pass, coverage threshold enforced
      - build         # Vite build -- must succeed
      - e2e-tests     # Playwright -- must pass on all 3 browsers
      - lighthouse-ci # Lighthouse -- score gates enforced
      - axe-ci        # Accessibility -- zero violations gate
```

**Branch protection rules:**
- All CI jobs must pass before merge to `main`
- No force-push to `main`
- Required review: 1 (at minimum, even solo project — use as self-review gate)

**Lighthouse CI thresholds (fail if below):**
- Performance: 90
- Accessibility: 100 (automated — manual testing supplements)
- Best Practices: 90
- SEO: 95

---

## Accessibility Testing Integration

**Automated (CI gate):**
```ts
// tests/e2e/accessibility.spec.ts
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  for (const url of ['/', '/about', '/schedule', '/programs', '/shop', '/login']) {
    test(`${url} has no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(url);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
```

**Manual testing checklist (per release):**
- [ ] Keyboard-only: complete primary journey on each page
- [ ] VoiceOver (macOS/iOS): navigate and complete trial form
- [ ] NVDA + Firefox (Windows): navigate and check schedule
- [ ] 200% zoom: no horizontal scroll, no content clipping
- [ ] High contrast mode (Windows): layout intact
- [ ] Reduced motion: confirm no GSAP animation plays

---

## Minimum E2E Scenarios Per Page

### Home
- [ ] Page loads with correct `h1`
- [ ] "Book a Free Trial" CTA navigates to or opens trial form
- [ ] Navigation links are keyboard accessible
- [ ] Skip link navigates to `#main-content`
- [ ] No axe violations

### About
- [ ] Instructor section renders with name and belt
- [ ] CTA present and functional
- [ ] No axe violations

### Schedule
- [ ] GymDesk embed renders (or fallback shown)
- [ ] Loading state is announced (if async)
- [ ] No axe violations

### Programs
- [ ] All program cards render
- [ ] CTA on each card navigates correctly
- [ ] No axe violations

### Shop
- [ ] Products render (or placeholder state)
- [ ] No axe violations

### Login
- [ ] GymDesk login embed renders (or redirect link present)
- [ ] No axe violations

### Cross-page
- [ ] Mobile nav drawer: opens, keyboard navigable, closes with Escape, focus returns
- [ ] All pages: skip link functional
- [ ] All pages: `<title>` is unique and descriptive
- [ ] Trial form: valid submission shows success, invalid shows errors with correct ARIA
