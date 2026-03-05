/**
 * animate.ts — GSAP executor functions for all animation presets.
 *
 * ScrollTrigger is registered at module level so it is available before any
 * component connectedCallback fires (ES module evaluation order guarantees this
 * because animate.ts is imported transitively by components/index.ts).
 *
 * Call initAnimations() once in main.ts for additional setup (reducedMotion
 * config, visibility-change cleanup).
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type AnimationOptions, PRESETS } from './presets'

// Register immediately — must precede any gsap.to/fromTo call that uses scrollTrigger.
// GSAP deduplicates registrations, so calling registerPlugin again in initAnimations() is safe.
gsap.registerPlugin(ScrollTrigger)

export type { AnimationOptions }

/** True when viewport is below the mobile breakpoint (768 px). */
export function isMobile(): boolean {
  return window.matchMedia('(max-width: 767px)').matches
}

/** True when the user has requested reduced motion at the OS level. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Register plugins, configure reducedMotion, and attach global cleanup.
 * Must be called once in src/main.ts before component scripts load.
 */
export function initAnimations(): void {
  gsap.registerPlugin(ScrollTrigger)

  // GSAP honours prefers-reduced-motion: disables motion when set to 'user'
  // Cast required — reducedMotion is a valid runtime option not yet in @types/gsap
  ;(gsap.config as (config: Record<string, unknown>) => void)({ reducedMotion: 'user' })

  // Kill all ScrollTriggers when the tab goes hidden (page unload / bfcache)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  })
}

/**
 * Fade-reveal a single element or a list of elements on scroll.
 * Preset: 'fadeUp' | 'fadeIn' | 'stagger'
 */
export function scrollReveal(
  target: Element | Element[] | NodeListOf<Element>,
  presetKey: 'fadeUp' | 'fadeIn' | 'stagger',
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  const preset = PRESETS[presetKey]
  const defaults = preset.defaults ?? {}
  const stDefaults = preset.scrollTrigger ?? {}

  const targets = target instanceof NodeList ? Array.from(target) : target

  // For stagger preset we animate all targets together with stagger spacing
  const staggerVal =
    presetKey === 'stagger' ? (opts.stagger ?? stDefaults.stagger ?? 0.1) : undefined

  const triggerEl: Element | undefined = Array.isArray(targets)
    ? (targets as Element[])[0]
    : (targets as Element)

  if (!triggerEl) return null

  const toVars: gsap.TweenVars = {
    ...preset.toVars,
    duration: opts.duration ?? defaults.duration ?? 0.6,
    delay: opts.delay ?? 0,
    ease: opts.ease ?? defaults.ease ?? 'power2.out',
    scrollTrigger: {
      trigger: triggerEl as Element,
      start: opts.start ?? stDefaults.start ?? 'top 85%',
      once: opts.once ?? stDefaults.once ?? true,
    },
  }
  if (staggerVal !== undefined) toVars.stagger = staggerVal

  return gsap.fromTo(targets, preset.vars, toVars)
}

/**
 * Load-time stagger entrance (no ScrollTrigger).
 * Used for hero elements that should animate immediately on page load.
 */
export function heroEntrance(
  targets: (Element | null)[],
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  const validTargets = targets.filter((t): t is Element => t !== null)
  if (validTargets.length === 0) return null

  return gsap.fromTo(
    validTargets,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: opts.duration ?? 0.7,
      delay: opts.delay ?? 0.15,
      ease: opts.ease ?? 'power2.out',
      stagger: opts.stagger ?? 0.12,
    }
  )
}

/**
 * Scrub-based parallax Y offset.
 * Returns null on mobile (< 768px) — element falls back to CSS layout.
 */
export function parallax(
  target: Element | null,
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  if (!target || isMobile()) return null

  const preset = PRESETS.parallax
  const stDefaults = preset.scrollTrigger ?? {}

  return gsap.fromTo(target, preset.vars, {
    ...preset.toVars,
    ease: 'none',
    scrollTrigger: {
      trigger: target,
      start: opts.start ?? 'top bottom',
      end: opts.end ?? 'bottom top',
      scrub: opts.scrub ?? stDefaults.scrub ?? 0.5,
    },
  })
}

/**
 * Pin container and scroll the inner track horizontally.
 * Returns null on mobile (< 768px) — falls back to vertical layout.
 */
export function pinHorizontal(
  container: Element | null,
  track: Element | null,
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  if (!container || !track || isMobile()) return null

  const trackEl = track as HTMLElement
  const scrollWidth = trackEl.scrollWidth - trackEl.clientWidth

  return gsap.to(track, {
    x: -scrollWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: opts.start ?? 'top top',
      end: () => `+=${scrollWidth}`,
      scrub: opts.scrub ?? 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })
}

/**
 * Infinite looping marquee.
 * Uses modifiers to wrap x position seamlessly.
 * Pauses on hover/focus-within.
 */
export function marquee(
  track: Element | null,
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  if (!track) return null

  const trackEl = track as HTMLElement
  const totalWidth = trackEl.scrollWidth / 2 // track contains content duplicated once

  const tween = gsap.to(track, {
    x: -totalWidth,
    duration: opts.duration ?? 20,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x: number) => parseFloat(x.toString()) % totalWidth),
    },
  })

  // Pause on hover / focus-within
  const parent = track.parentElement
  if (parent) {
    parent.addEventListener('mouseenter', () => tween.pause())
    parent.addEventListener('mouseleave', () => tween.play())
    parent.addEventListener('focusin', () => tween.pause())
    parent.addEventListener('focusout', () => tween.play())
  }

  return tween
}

// ── pinnedCardCarousel constants ───────────────────────────────────────────
const CARD_MIN_SCALE = 0.85
const CARD_MIN_OPACITY = 0.55
const CARD_SCALE_RANGE = 0.15       // full scale = CARD_MIN_SCALE + CARD_SCALE_RANGE
const CARD_OPACITY_RANGE = 0.45     // full opacity = CARD_MIN_OPACITY + CARD_OPACITY_RANGE
const HEADING_FADE_RATE = 4         // heading is fully gone at 1/HEADING_FADE_RATE scroll progress
const HEADING_SLIDE_Y = 50          // px the heading travels upward while fading
const SUB_SLIDE_Y = 30              // px the sub-heading travels upward while fading
const CARD_INFLUENCE_RADIUS = 0.6   // fraction of viewport width used as max distance for scaling

/**
 * Museum-of-Money style pinned card carousel.
 * Pin the container, scrub track horizontally, fade heading, scale cards at center.
 *
 * Returns null on mobile (< 768px) or when prefers-reduced-motion is set —
 * callers fall back to vertical layout in both cases.
 */
export function pinnedCardCarousel(
  container: Element | null,
  track: Element | null,
  heading: Element | null,
  sub: Element | null,
  cards: Element[]
): ScrollTrigger | null {
  if (!container || !track || cards.length === 0 || isMobile() || prefersReducedMotion()) return null
  if (!(track instanceof HTMLElement) || !(container instanceof HTMLElement)) return null

  const trackEl = track
  const firstCard = cards[0]
  if (!(firstCard instanceof HTMLElement)) return null

  // Force track to flex + viewport height regardless of CSS timing.
  // The component's connectedCallback may fire before the stylesheet has been
  // fully applied (Vite dev HMR, first paint), so we own these properties in JS.
  trackEl.style.display = 'flex'
  trackEl.style.alignItems = 'center'
  trackEl.style.height = '100vh'

  // Symmetric padding so first and last cards are equally centred.
  // scrollWidth on an overflow:visible flex container doesn't include right padding,
  // so scroll distance is derived from actual card positions (not scrollWidth).
  const lastCard = cards[cards.length - 1] as HTMLElement

  const computePadding = () => {
    const cardWidth = firstCard.offsetWidth || 320 // fallback to w-80 (320px) if unmeasured
    const pad = Math.max(0, window.innerWidth / 2 - cardWidth / 2)
    trackEl.style.paddingLeft = `${pad}px`
    trackEl.style.paddingRight = `${pad}px`
  }
  computePadding()

  // Distance the track must travel: from first-card-centred to last-card-centred.
  // Measured from card offsetLeft so it's independent of scrollWidth quirks.
  const scrollDistance = () => {
    const lastCx = lastCard.offsetLeft + (lastCard.offsetWidth || 320) / 2
    return Math.max(0, lastCx - window.innerWidth / 2)
  }

  // Initial card state: small + dim
  gsap.set(cards, { scale: CARD_MIN_SCALE, opacity: CARD_MIN_OPACITY })

  const clamp = gsap.utils.clamp(0, 1)

  // The tween IS the scrubbed animation — GSAP smoothly interpolates x
  const tween = gsap.to(track, {
    x: () => -scrollDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${scrollDistance()}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      invalidateOnRefresh: true,
      // Snap each card to viewport centre. Equal intervals work because cards are
      // equally spaced (no gap, equal widths) → each card advances by 1/(n-1) progress.
      snap: {
        snapTo: (progress: number) => {
          const step = 1 / (cards.length - 1)
          return Math.round(progress / step) * step
        },
        inertia: false,
        duration: { min: 0.2, max: 0.5 },
        ease: 'power1.inOut',
        delay: 0.1,
      },
      onRefresh: computePadding,
      onUpdate() {
        const progress = tween.scrollTrigger?.progress ?? 0

        // Batch all DOM reads before any writes to avoid layout thrash
        const center = window.innerWidth / 2
        const cardRects = cards.map((c) => (c as HTMLElement).getBoundingClientRect())

        // Writes: heading fade
        if (heading) {
          gsap.set(heading, {
            opacity: clamp(1 - progress * HEADING_FADE_RATE),
            y: progress * -HEADING_SLIDE_Y,
          })
        }
        if (sub) {
          gsap.set(sub, {
            opacity: clamp((1 - progress * HEADING_FADE_RATE) * CARD_MIN_OPACITY),
            y: progress * -SUB_SLIDE_Y,
          })
        }

        // Writes: per-card scale based on distance from viewport center
        const maxDist = window.innerWidth * CARD_INFLUENCE_RADIUS
        cards.forEach((card, i) => {
          const rect = cardRects[i]!
          const dist = Math.abs(rect.left + rect.width / 2 - center)
          const t = clamp(1 - dist / maxDist)
          const eased = t * t // power-2: sharper falloff away from center
          gsap.set(card, {
            scale: CARD_MIN_SCALE + eased * CARD_SCALE_RANGE,
            opacity: CARD_MIN_OPACITY + eased * CARD_OPACITY_RANGE,
          })
        })
      },
    },
  })

  // Refresh after the next paint so GSAP measures correct post-layout dimensions.
  // This is needed when connectedCallback fires before the browser has performed
  // its first layout pass (e.g. Vite HMR, or custom-element upgrade on DOMContentLoaded).
  requestAnimationFrame(() => {
    computePadding()
    ScrollTrigger.refresh()
  })

  return tween.scrollTrigger ?? null
}

/**
 * Count-up animation for a stat number element.
 * Uses a proxy object to avoid innerText layout thrash.
 */
export function counter(
  target: Element | null,
  endValue: number,
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  if (!target) return null

  const preset = PRESETS.counter
  const defaults = preset.defaults ?? {}
  const stDefaults = preset.scrollTrigger ?? {}

  const proxy = { value: 0 }

  return gsap.to(proxy, {
    value: endValue,
    duration: opts.duration ?? defaults.duration ?? 1.5,
    ease: opts.ease ?? defaults.ease ?? 'power2.out',
    onUpdate() {
      target.textContent = String(Math.round(proxy.value))
    },
    scrollTrigger: {
      trigger: target,
      start: opts.start ?? stDefaults.start ?? 'top 80%',
      once: opts.once ?? stDefaults.once ?? true,
    },
  })
}
