/**
 * Animation presets — type-only GSAP dependency (no runtime import).
 * Consumed by animate.ts executor functions.
 */
import type gsap from 'gsap'

export type PresetKey =
  | 'fadeUp'
  | 'fadeIn'
  | 'stagger'
  | 'parallax'
  | 'counter'
  | 'horizontalPin'

export interface ScrollTriggerDefaults {
  start?: string
  end?: string
  once?: boolean
  scrub?: number | boolean
  pin?: boolean
  anticipatePin?: number
  stagger?: number
}

export interface AnimationPreset {
  /** GSAP from-vars (for fromTo, the "from" state) */
  vars: gsap.TweenVars
  /** GSAP to-vars (for fromTo, the "to" state — omit for .to() tweens) */
  toVars?: gsap.TweenVars
  defaults?: {
    duration?: number
    ease?: string
  }
  scrollTrigger?: ScrollTriggerDefaults
}

/** Consumer overrides passed to executor functions */
export interface AnimationOptions {
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  scrub?: number | boolean
  start?: string
  end?: string
  once?: boolean
  pin?: boolean
}

export const PRESETS: Record<PresetKey, AnimationPreset> = {
  fadeUp: {
    vars: { opacity: 0, y: 40 },
    toVars: { opacity: 1, y: 0 },
    defaults: { duration: 0.7, ease: 'power2.out' },
    scrollTrigger: { start: 'top 85%', once: true },
  },

  fadeIn: {
    vars: { opacity: 0 },
    toVars: { opacity: 1 },
    defaults: { duration: 0.6, ease: 'power1.out' },
    scrollTrigger: { start: 'top 85%', once: true },
  },

  stagger: {
    vars: { opacity: 0, y: 32 },
    toVars: { opacity: 1, y: 0 },
    defaults: { duration: 0.6, ease: 'power2.out' },
    scrollTrigger: { start: 'top 85%', once: true, stagger: 0.1 },
  },

  parallax: {
    // from: yPercent 0 → to: yPercent -20 (element moves up as you scroll)
    vars: { yPercent: 0 },
    toVars: { yPercent: -20 },
    scrollTrigger: { scrub: 0.5 },
  },

  counter: {
    vars: { value: 0 },
    defaults: { duration: 1.5, ease: 'power2.out' },
    scrollTrigger: { start: 'top 80%', once: true },
  },

  horizontalPin: {
    vars: { x: 0 },
    scrollTrigger: { scrub: 1, pin: true, anticipatePin: 1 },
  },
}
