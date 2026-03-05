/**
 * E2E tests: Programs section pinned card carousel
 *
 * Validates the full scroll animation:
 *  1. Section pins when scrolled into view (GSAP pin-spacer created)
 *  2. Title is centered and visible at carousel entry
 *  3. Title fades as user scrolls through the carousel
 *  4. Track starts at x=0 then moves left (negative x) as user scrolls
 *  5. Each card snaps to viewport center when scroll pauses near it
 *  6. All 4 program cards are reachable by scrolling through
 *  7. Page scroll resumes naturally after all cards have been shown
 *
 * Timing notes:
 *  - scrub:1 means the GSAP tween lags ~1s behind raw scroll events
 *  - snap delay is 0.1s + up to 0.5s snap animation
 *  - Tests use 1800ms settle time after scroll to account for both
 */

import { test, expect } from '@playwright/test'

const VIEWPORT = { width: 1280, height: 800 }
const CENTER_X = VIEWPORT.width / 2
/** Max distance (px) a card's centre may be from the viewport centre to pass the snap assertion. */
const SNAP_TOLERANCE_PX = 80

// ── helpers ──────────────────────────────────────────────────────────────────

/** Instant-scroll the viewport so the programs section's top edge meets the viewport top. */
async function scrollToSection(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const section = document.querySelector('ojj-programs-section [data-carousel-section]')
    if (section) section.scrollIntoView({ behavior: 'instant' })
  })
  // Small pause for GSAP to register the new scroll position
  await page.waitForTimeout(300)
}

/** Read the current x-translation of the carousel track (px). */
async function trackX(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const track = document.querySelector('ojj-programs-section [data-track]') as HTMLElement
    return new DOMMatrix(getComputedStyle(track).transform).m41
  })
}

/** Return the horizontal distance (px) of each card's centre from the viewport centre. */
async function cardDistancesFromCenter(page: import('@playwright/test').Page): Promise<number[]> {
  return page.evaluate((cx) => {
    return Array.from(
      document.querySelectorAll('ojj-programs-section [data-track] > div')
    ).map((card) => {
      const r = card.getBoundingClientRect()
      return Math.abs(r.left + r.width / 2 - cx)
    })
  }, CENTER_X)
}

// ── test suite ────────────────────────────────────────────────────────────────

test.describe('Programs carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    // Override OS reduce-motion so animation actually runs in headless CI
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  // ── 1. Structure ───────────────────────────────────────────────────────────

  test('GSAP creates a pin-spacer when the section is scrolled into view', async ({ page }) => {
    await scrollToSection(page)
    // GSAP inserts a .pin-spacer sibling to hold the scroll height while the
    // section is position:fixed. Absence means ScrollTrigger never activated.
    const spacer = page.locator('.pin-spacer').first()
    await expect(spacer).toBeAttached()
  })

  test('section contains 4 program cards in the desktop track', async ({ page }) => {
    const cards = page.locator('ojj-programs-section [data-track] > div')
    await expect(cards).toHaveCount(4)
  })

  // ── 2. Title visibility at entry ───────────────────────────────────────────

  test('heading is fully visible when carousel first enters the viewport', async ({ page }) => {
    await scrollToSection(page)

    // Semantic heading must be accessible
    const heading = page.getByRole('heading', { name: 'Programs for Every Level' }).first()
    await expect(heading).toBeVisible()

    // Must be near full opacity (GSAP sets it, not CSS)
    const opacity = await page.evaluate(() => {
      const el = document.querySelector('ojj-programs-section [data-heading]') as HTMLElement
      return parseFloat(getComputedStyle(el).opacity)
    })
    expect(opacity).toBeGreaterThanOrEqual(0.9)
  })

  // ── 3. Title fades as user scrolls ────────────────────────────────────────

  test('heading opacity decreases as user scrolls into the carousel', async ({ page }) => {
    await scrollToSection(page)

    const opacityAtEntry = await page.evaluate(() => {
      const el = document.querySelector('ojj-programs-section [data-heading]') as HTMLElement
      return parseFloat(getComputedStyle(el).opacity)
    })

    // Scroll ~¼ of the way through the carousel
    await page.evaluate(() => window.scrollBy(0, 300))
    await page.waitForTimeout(1200) // wait for scrub lag

    const opacityMidway = await page.evaluate(() => {
      const el = document.querySelector('ojj-programs-section [data-heading]') as HTMLElement
      return parseFloat(getComputedStyle(el).opacity)
    })

    expect(opacityMidway).toBeLessThan(opacityAtEntry)
    // Heading should be substantially faded by this point
    expect(opacityMidway).toBeLessThan(0.4)
  })

  // ── 4. Track movement ─────────────────────────────────────────────────────

  test('track x is 0 (first card centred) when carousel entry is reached', async ({ page }) => {
    await scrollToSection(page)
    const x = await trackX(page)
    // Allow a small margin — scrub may not have fully settled in 300ms
    expect(x).toBeGreaterThan(-30)
  })

  test('track moves left (negative x) as user scrolls into the carousel', async ({ page }) => {
    await scrollToSection(page)
    await page.evaluate(() => window.scrollBy(0, 250))
    await page.waitForTimeout(1500) // wait for scrub + possible snap settle

    const x = await trackX(page)
    // Track must have moved meaningfully left
    expect(x).toBeLessThan(-80)
  })

  // ── 5. Snap behaviour ─────────────────────────────────────────────────────

  test('a card snaps to viewport centre when scroll pauses between cards', async ({ page }) => {
    await scrollToSection(page)

    // Scroll to a midpoint between card-0 and card-1 snap positions,
    // then stop. GSAP snap should correct to the nearest card centre.
    await page.evaluate(() => window.scrollBy(0, 180))
    // Wait: scrub lag (1s) + snap delay (0.1s) + snap animation (0.5s)
    await page.waitForTimeout(1800)

    const distances = await cardDistancesFromCenter(page)
    const closestDistance = Math.min(...distances)
    expect(closestDistance).toBeLessThanOrEqual(SNAP_TOLERANCE_PX)
  })

  test('each subsequent scroll advances to the next card centre', async ({ page }) => {
    await scrollToSection(page)

    // Measure actual scroll range from pin-spacer so positions are viewport-independent.
    const { triggerStart, scrollDist } = await page.evaluate(() => {
      const pinSpacer = document.querySelector(
        'ojj-programs-section .pin-spacer'
      ) as HTMLElement | null
      return {
        triggerStart: window.scrollY,
        scrollDist: pinSpacer ? pinSpacer.offsetHeight - window.innerHeight : 960,
      }
    })

    const centeredCards = new Set<number>()
    const n = 4 // number of program cards

    // Scroll to each card's exact snap position using scrollTo (no velocity accumulation).
    // inertia:false on the snap config ensures GSAP snaps by nearest position, not velocity.
    for (let card = 1; card < n; card++) {
      const targetY = triggerStart + Math.round((card / (n - 1)) * scrollDist)
      await page.evaluate((y) => window.scrollTo(0, y), targetY)
      await page.waitForTimeout(1800)

      const distances = await cardDistancesFromCenter(page)
      const idx = distances.findIndex((d) => d <= SNAP_TOLERANCE_PX)
      if (idx >= 0) centeredCards.add(idx)
    }

    // All 3 non-first cards should have been centred
    expect(centeredCards.size).toBeGreaterThanOrEqual(3)
  })

  // ── 6. Pin release ────────────────────────────────────────────────────────

  test('page scroll resumes after the last card has been shown', async ({ page }) => {
    await scrollToSection(page)

    // Scroll well past the entire carousel (programs section + spacer + buffer)
    await page.evaluate(() => window.scrollBy(0, 3000))
    await page.waitForTimeout(600)

    const scrollY = await page.evaluate(() => window.scrollY)
    // If the pin held, scrollY would be stuck near the section top (~848).
    // A value >> 1500 proves the pin released and normal scrolling resumed.
    expect(scrollY).toBeGreaterThan(1500)
  })
})
