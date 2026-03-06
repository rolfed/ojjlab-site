/**
 * home.ts — page-level scroll animations for the home page.
 *
 * Wrapped in turbo:load so animations re-initialise on every Turbo
 * navigation that lands on this page. turbo:load also fires on the
 * initial page load, so no separate DOMContentLoaded handler is needed.
 */

import { scrollReveal } from '@/animations/animate'

function initHomeAnimations(): void {
  if (window.location.pathname !== '/') { return }

  const whyHeading = document.querySelector('[data-why-heading]')
  const whyItems = document.querySelectorAll('[data-why-list] li')
  const reviews = document.querySelectorAll('[data-reviews-grid] ojj-review-card')
  const trialHeading = document.querySelector('[data-trial-heading]')
  const trialSub = document.querySelector('[data-trial-sub]')
  const trialForm = document.querySelector('[data-trial-form]')

  if (whyHeading) { scrollReveal(whyHeading, 'fadeUp', { once: false }) }
  if (whyItems.length) { scrollReveal(whyItems, 'stagger', { once: false }) }
  if (reviews.length) { scrollReveal(reviews, 'stagger', { once: false }) }
  if (trialHeading) { scrollReveal(trialHeading, 'fadeUp', { once: false }) }
  if (trialSub) { scrollReveal(trialSub, 'fadeUp', { once: false, delay: 0.1 }) }
  if (trialForm) { scrollReveal(trialForm, 'fadeUp', { once: false, delay: 0.2 }) }
}

document.addEventListener('turbo:load', initHomeAnimations)
