/**
 * animate.ts — GSAP executor functions for all animation presets.
 *
 * Call initAnimations() once before any component connectedCallback fires.
 * All executor functions are null-safe and reducedMotion-aware via gsap.config.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type AnimationOptions, PRESETS } from './presets'

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
