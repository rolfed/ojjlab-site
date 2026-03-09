/**
 * src/main.ts — shared entry point for all pages.
 *
 * Load order:
 * 1. gsap.registerPlugin(ScrollTrigger, ScrollSmoother) fires at animate.ts module level
 * 2. All Web Components are registered via customElements.define
 * 3. initAnimations() configures reducedMotion + creates ScrollSmoother — called exactly ONCE
 * 4. @hotwired/turbo activates Drive (intercepts link clicks, swaps <body>)
 * 5. Turbo lifecycle hooks wire GSAP cleanup and persistent header sync
 */

import { initAnimations, createSmoother } from '@/animations/animate'
import '@/components/index'
import '@hotwired/turbo'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/dist/ScrollSmoother'
import { hasConsent, animationsAllowed, applyMotionPreference } from '@/components/modules/OJJConsentBanner'

// Called exactly once — registers plugins, configures reducedMotion, creates smoother
initAnimations()

// Kill smoother and all ScrollTriggers before Turbo swaps the body.
// Component-level tweens are killed automatically in AnimatableMixin.cleanup()
// when disconnectedCallback fires as old body elements are removed.
document.addEventListener('turbo:before-render', () => {
  ScrollSmoother.get()?.kill()
  ScrollTrigger.getAll().forEach((st) => { st.kill(); })
})

// After each body swap: recreate smoother, recalculate scroll positions,
// and sync the persistent header's attributes to match the new page.
document.addEventListener('turbo:render', () => {
  createSmoother()
  ScrollTrigger.refresh()

  const header = document.querySelector('ojj-site-header')
  if (header) {
    header.setAttribute('current-page', window.location.pathname)

    // Transparent header only on the home page — signalled via a <meta> tag
    // so this listener can read it from the newly-rendered <head>.
    const isTransparent = document.querySelector('meta[name="ojj:header-transparent"]') !== null
    if (isTransparent) {
      header.setAttribute('transparent', '')
    } else {
      header.removeAttribute('transparent')
    }
  }
})

// Close the nav drawer before navigation begins so it doesn't persist
// in an open state across the body swap.
document.addEventListener('turbo:before-visit', () => {
  const drawer = document.querySelector('ojj-nav-drawer')
  if (drawer?.hasAttribute('open')) { drawer.removeAttribute('open') }
})

// Restore consent preferences on every page load (initial + Turbo navigations).
// Must run after components mount so DOM targets exist for applyMotionPreference.
document.addEventListener('turbo:load', () => {
  if (hasConsent()) {
    // User has previously chosen — apply their motion preference
    if (!animationsAllowed()) { applyMotionPreference(false) }
  } else {
    // First visit — inject banner if not already present
    if (!document.querySelector('ojj-consent-banner')) {
      document.body.insertAdjacentHTML('beforeend', '<ojj-consent-banner></ojj-consent-banner>')
    }
  }
})
