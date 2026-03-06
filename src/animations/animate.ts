/**
 * animate.ts — GSAP executor functions for all animation presets.
 *
 * Call initAnimations() once before any component connectedCallback fires.
 * All executor functions are null-safe and reducedMotion-aware via gsap.config.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type AnimationOptions, PRESETS } from './presets'

// Must be at module level — guarantees registration before any connectedCallback fires.
// (Component modules import mixin.ts → animate.ts, so this evaluates first.)
gsap.registerPlugin(ScrollTrigger)

export type { AnimationOptions }

/** True when viewport is below the mobile breakpoint (768 px). */
export function isMobile(): boolean {
  return window.matchMedia('(max-width: 767px)').matches
}

/**
 * Register plugins, configure reducedMotion, and attach global cleanup.
 * Must be called once in src/main.ts before component scripts load.
 */
export function initAnimations(): void {
  // Plugin is already registered at module level above.
  // reducedMotion config still needs to run here at startup.

  // Animations are controlled by our consent banner (ojj_consent cookie),
  // not the OS prefers-reduced-motion setting. Setting reducedMotion: false
  // prevents GSAP from auto-disabling tweens based on OS preference.
  // Cast required — reducedMotion is a valid runtime option not yet in @types/gsap
  ;(gsap.config as (config: Record<string, unknown>) => void)({ reducedMotion: false })

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

  if (!triggerEl) { return null }

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
  if (staggerVal !== undefined) { toVars.stagger = staggerVal }

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
  if (validTargets.length === 0) { return null }

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
  if (!target || isMobile()) { return null }

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
  if (!container || !track || isMobile()) { return null }

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

export interface PinnedRevealConfig {
  trigger: HTMLElement
  heading: HTMLElement
  sub?: HTMLElement | null
  track: HTMLElement
}

/**
 * Cinematic pinned reveal: heading shrinks up while the horizontal card track
 * scrubs left. Returns null on mobile or reduced-motion.
 *
 * Returns the Timeline so callers can kill() both the timeline and its
 * linked ScrollTrigger together.
 */
export function pinnedReveal(config: PinnedRevealConfig): gsap.core.Timeline | null {
  if (isMobile()) { return null }

  const { trigger, heading, sub, track } = config

  // Motion is controlled by our consent banner (data-reduce-motion on <html>),
  // not the OS prefers-reduced-motion setting.
  const reducedMotion = document.documentElement.hasAttribute('data-reduce-motion')

  if (reducedMotion) {
    gsap.set(heading, { clearProps: 'all' })
    if (sub) { gsap.set(sub, { clearProps: 'all' }) }
    return null
  }

  const HEADING_PHASE_PX = 600

  gsap.set(track, { x: 0 })

  const trackDist = (): number => {
    const wrap = track.parentElement!
    const wrapRect = wrap.getBoundingClientRect()
    const wrapPadLeft = parseFloat(getComputedStyle(wrap).paddingLeft)
    const naturalLeft = wrapRect.left + wrapPadLeft
    const viewportW = document.documentElement.clientWidth
    return Math.max(track.scrollWidth + naturalLeft - viewportW, 0)
  }

  // Debug label derived from the trigger's first data-* attribute key.
  const label = Object.keys(trigger.dataset)[0] ?? trigger.tagName.toLowerCase()

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top top',
      end: () => `+=${HEADING_PHASE_PX + trackDist()}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      invalidateOnRefresh: true,

      // ── Debug callbacks (dev only) ────────────────────────────────────
      onEnter: () =>
        console.log(`[ST:${label}] onEnter — pin active`),
      onLeave: (self) =>
        console.log(`[ST:${label}] onLeave — progress=${self.progress.toFixed(2)} pin released`),
      onEnterBack: (self) =>
        console.log(`[ST:${label}] onEnterBack — progress=${self.progress.toFixed(2)}`),
      onLeaveBack: () =>
        console.log(`[ST:${label}] onLeaveBack — above pin start`),
      onUpdate: (self) =>
        console.debug(`[ST:${label}] onUpdate — progress=${self.progress.toFixed(3)} dir=${self.direction}`),
    },
  })

  // Phase 1 (40%): heading shrinks toward top of viewport, subtitle fades.
  // y is a lazy function so it re-evaluates on invalidateOnRefresh, landing
  // the heading at NAV_CLEARANCE px below the viewport top regardless of
  // card height or viewport size.
  const NAV_CLEARANCE = 80
  tl.to(heading, {
    y: (_i, el) => NAV_CLEARANCE - (el as HTMLElement).getBoundingClientRect().top,
    scale: 0.55,
    ease: 'power2.inOut',
    duration: 0.4,
  })
  if (sub) {
    tl.to(sub, { opacity: 0, y: -24, ease: 'power2.in', duration: 0.25 }, '<')
  }

  // Phase 2 (60%): card track scrolls left until last card is fully visible.
  tl.to(track, { x: () => -trackDist(), ease: 'none', duration: 0.6 })

  return tl
}

export interface ProgramsRevealConfig {
  trigger: HTMLElement
  headingWrap: HTMLElement
  track: HTMLElement
  cards: HTMLElement[]
}

/**
 * Cinematic centered-card reveal:
 *   Phase 1 — heading + subtitle fade out (slides up)
 *   Phase 2 — cards reveal, first card perfectly centered in viewport
 *   Phase 3 — carousel: user scrolls through cards; at any moment the center
 *              card is full-size/full-opacity, adjacent cards are scaled down and
 *              faded, cards beyond ±1 are invisible.
 *
 * Returns null on mobile (< 768px) or reduced-motion.
 */
export function programsReveal(config: ProgramsRevealConfig): gsap.core.Timeline | null {
  if (isMobile()) { return null }

  const { trigger, headingWrap, track, cards } = config
  const reducedMotion = document.documentElement.hasAttribute('data-reduce-motion')

  if (reducedMotion) {
    gsap.set(headingWrap, { clearProps: 'all' })
    return null
  }

  // offsetWidth returns the layout width, independent of GSAP scale transforms.
  // getBoundingClientRect().width would return the visual (scaled) size, causing
  // the carousel to undershoot and the last card to never reach center.
  const getCardWidth = (): number => (cards[0] as HTMLElement | undefined)?.offsetWidth ?? 0
  const getGap = (): number => parseFloat(getComputedStyle(track).gap) || 24
  const carouselDist = (): number => (cards.length - 1) * (getCardWidth() + getGap())
  const startX = (): number => window.innerWidth / 2 - getCardWidth() / 2

  // Shared reveal multiplier (0 → 1 during phase 2, stays at 1 during phase 3)
  const reveal = { progress: 0 }

  // Initial state
  gsap.set(headingWrap, { opacity: 1, y: 0 })
  gsap.set(track, { x: startX })
  gsap.set(cards, { opacity: 0, scale: 0.88 })

  const updateCards = (): void => {
    const cx = window.innerWidth / 2
    const cardStep = getCardWidth() + getGap()
    cards.forEach((card) => {
      const r = card.getBoundingClientRect()
      const distInCards = Math.abs(cx - (r.left + r.width / 2)) / cardStep
      // opacity: center = 1.0, ±1 = 0.5, ≥ 1.5 = 0
      const distOpacity = gsap.utils.clamp(0, 1, 1.5 - distInCards)
      // scale: center = 1.05, ±1 = 0.82
      const scale = gsap.utils.clamp(0.82, 1.05, 1.05 - distInCards * 0.20)
      gsap.set(card, { opacity: distOpacity * reveal.progress, scale })
    })
  }

  // Per-card carousel timing constants.
  // Each card transition moves over CARD_MOVE_DUR, then holds on the centered
  // card for CARD_PAUSE_DUR before the next transition begins.
  // The final card gets a longer pause (CARD_PAUSE_LAST_DUR) to signal completion.
  const CARD_MOVE_DUR = 0.10
  const CARD_PAUSE_DUR = 0.06
  const CARD_PAUSE_LAST_DUR = 0.14  // longer dwell on the final card
  const N_TRANSITIONS = cards.length - 1
  // Every card gets a pause (N_TRANSITIONS total): (N_TRANSITIONS - 1) regular + 1 last
  const N_REGULAR_PAUSES = N_TRANSITIONS - 1

  // Scale the total scroll end to reserve enough pixels for the pause zones.
  const PAUSE_SCALE =
    1 + (N_REGULAR_PAUSES * CARD_PAUSE_DUR + CARD_PAUSE_LAST_DUR) / (N_TRANSITIONS * CARD_MOVE_DUR)
  const PIN_PX = 600

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top top',
      // Extend end by PAUSE_SCALE so each pause zone has comfortable scroll room.
      end: () => `+=${PIN_PX + carouselDist() * PAUSE_SCALE}`,
      pin: true,
      anticipatePin: 1,
      // scrub: 1.5 — animation catches up to scroll over 1.5 s, giving an organic
      // spring feel. Best practice: 1–2 s for scrubbed pinned sections.
      scrub: 1.5,
      invalidateOnRefresh: true,
      onUpdate: updateCards,
    },
  })

  // Phase 1: heading + subtitle slide up and fade out
  tl.to(headingWrap, { opacity: 0, y: -48, ease: 'power2.in', duration: 0.20 })

  // Phase 2: reveal multiplier drives card opacity via onUpdate (overlaps phase 1 tail)
  tl.to(reveal, { progress: 1, ease: 'power2.out', duration: 0.15 }, '-=0.05')

  // Phase 3: per-card carousel with dwell pauses.
  // ease: 'sine.inOut' — gradual start and end avoids the snap feel that
  // power2.inOut produces when accelerating out of a held pause position.
  for (let i = 1; i <= N_TRANSITIONS; i++) {
    const iCopy = i
    tl.to(track, {
      x: () => startX() - iCopy * (getCardWidth() + getGap()),
      ease: 'sine.inOut',
      duration: CARD_MOVE_DUR,
    })
    // Every card gets a dwell pause; last card holds longer to signal completion.
    tl.to({}, { duration: i < N_TRANSITIONS ? CARD_PAUSE_DUR : CARD_PAUSE_LAST_DUR })
  }

  return tl
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
  if (!track) { return null }

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

/**
 * Count-up animation for a stat number element.
 * Uses a proxy object to avoid innerText layout thrash.
 */
export function counter(
  target: Element | null,
  endValue: number,
  opts: AnimationOptions = {}
): gsap.core.Tween | null {
  if (!target) { return null }

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
