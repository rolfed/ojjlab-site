import { chromium } from '@playwright/test'

void (async (): Promise<void> => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 800 })

  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const info = await page.evaluate((): unknown => {
    const section = document.querySelector<HTMLElement>('[data-carousel-section]')
    const track = document.querySelector<HTMLElement>('[data-track]')
    const heading = document.querySelector<HTMLElement>('[data-heading]')
    const cs = (el: HTMLElement | null): CSSStyleDeclaration | null => el ? getComputedStyle(el) : null
    const ss = cs(section), ts = cs(track)
    return {
      sectionExists: !!section,
      trackExists: !!track,
      headingExists: !!heading,
      section: section ? { w: section.offsetWidth, h: section.offsetHeight } : null,
      track: track ? { w: track.offsetWidth, h: track.offsetHeight, scrollW: track.scrollWidth } : null,
      sectionDisplay: ss?.display,
      sectionPosition: ss?.position,
      sectionOverflow: ss?.overflow,
      trackDisplay: ts?.display,
      trackHeight: ts?.height,
      trackTransform: ts?.transform,
      trackPaddingLeft: ts?.paddingLeft,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
      pinSpacers: Array.from(document.querySelectorAll('[class*="pin-spacer"]')).map(e => ({
        cls: (e as HTMLElement).className,
        h: (e as HTMLElement).offsetHeight,
      })),
    }
  })
  console.log('=== INITIAL DOM ===')
  console.log(JSON.stringify(info, null, 2))

  await page.screenshot({ path: '/tmp/c0-load.png' })

  await page.evaluate((): void => {
    const s = document.querySelector('[data-carousel-section]')
    if (s) s.scrollIntoView({ behavior: 'instant' })
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/c1-enter.png' })

  const enterState = await page.evaluate((): unknown => {
    const track = document.querySelector('[data-track]') as HTMLElement
    const heading = document.querySelector('[data-heading]') as HTMLElement
    return {
      scrollY: window.scrollY,
      trackTransform: getComputedStyle(track).transform,
      trackPaddingLeft: getComputedStyle(track).paddingLeft,
      headingOpacity: getComputedStyle(heading).opacity,
      pinSpacers: Array.from(document.querySelectorAll('[class*="pin-spacer"]')).map(e => ({
        h: (e as HTMLElement).offsetHeight
      })),
    }
  })
  console.log('\n=== AT SECTION ENTRY ===')
  console.log(JSON.stringify(enterState, null, 2))

  await page.evaluate((): void => { window.scrollBy(0, 800) })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/c2-mid.png' })

  const midState = await page.evaluate((): unknown => {
    const track = document.querySelector('[data-track]') as HTMLElement
    const heading = document.querySelector('[data-heading]') as HTMLElement
    const cards = Array.from(document.querySelectorAll('[data-track] > div')).map(c => {
      const r = (c as HTMLElement).getBoundingClientRect()
      const s = getComputedStyle(c as HTMLElement)
      return { left: Math.round(r.left), transform: s.transform, opacity: s.opacity }
    })
    return {
      scrollY: window.scrollY,
      trackTransform: getComputedStyle(track).transform,
      headingOpacity: getComputedStyle(heading).opacity,
      cards,
      pinSpacers: Array.from(document.querySelectorAll('[class*="pin-spacer"]')).map(e => ({
        h: (e as HTMLElement).offsetHeight
      })),
    }
  })
  console.log('\n=== MID SCROLL (+800px) ===')
  console.log(JSON.stringify(midState, null, 2))

  await page.evaluate((): void => { window.scrollBy(0, 2000) })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/c3-end.png' })

  const endState = await page.evaluate((): unknown => {
    const track = document.querySelector('[data-track]') as HTMLElement
    return {
      scrollY: window.scrollY,
      trackTransform: getComputedStyle(track).transform,
    }
  })
  console.log('\n=== END SCROLL ===')
  console.log(JSON.stringify(endState, null, 2))

  console.log('\n=== CONSOLE ERRORS ===')
  console.log(errors.length ? errors.join('\n') : 'none')

  await browser.close()
})()
