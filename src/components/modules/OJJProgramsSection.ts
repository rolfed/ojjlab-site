/**
 * ojj-programs-section — 6-card programs section.
 *
 * Desktop (motion-safe): cinematic pinned reveal via pinnedReveal().
 * Mobile + reduced-motion: vertical stagger grid (CSS-only, no pin).
 *
 * Layout switching is CSS-only via motion-safe: variants:
 *   — Desktop animation container: hidden motion-safe:md:flex  (hidden when reduced-motion)
 *   — Grid fallback container:     motion-safe:md:hidden       (shown when reduced-motion)
 *
 * User motion preference (from OJJConsentBanner) is stored in localStorage and
 * applied as data-reduce-motion on <html>. bindEvents() checks this attribute
 * before setting up the pinned reveal.
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'
import { isMobile } from '../../animations/animate'

const PROGRAMS = [
  {
    title: 'Little Grapplers',
    badge: 'Ages 5–10',
    description:
      'Playful, structured BJJ for younger kids. We focus on motor skills, listening, and core grappling concepts through games and age-appropriate drilling in a safe, encouraging environment.',
    ctaHref: '/programs/#youth-little',
    accentColor: '#0f3460',
  },
  {
    title: 'Youth BJJ',
    badge: 'Ages 10–15',
    description:
      'Serious BJJ fundamentals for tweens and teens. Students learn takedowns, guard work, and submissions while building confidence, discipline, and self-defense skills.',
    ctaHref: '/programs/#youth-juniors',
    accentColor: '#0a2444',
  },
  {
    title: 'Jiu Jitsu 101',
    badge: 'Beginners',
    description:
      'New to BJJ? Start here. Jiu Jitsu 101 covers the fundamental positions, movements, and submissions in a welcoming, no-pressure environment. No experience required.',
    ctaHref: '/programs/#101',
    accentColor: '#1a1a2e',
  },
  {
    title: 'Adult Jiu Jitsu',
    badge: 'Adults',
    description:
      'Comprehensive BJJ curriculum for adults of all experience levels. Learn takedowns, guard passing, submissions, and live rolling in a structured, supportive environment.',
    ctaHref: '/programs/#adult',
    accentColor: '#2d1b4e',
  },
  {
    title: 'Competition Team',
    badge: 'Competition',
    description:
      'Intensive training for athletes who want to compete. Covers tournament strategy, advanced techniques, and match preparation under experienced coaching.',
    ctaHref: '/programs/#competition',
    accentColor: '#4a0e0e',
  },
  {
    title: 'Kickboxing',
    badge: 'Striking',
    description:
      'Stand-up striking program covering punches, kicks, knees, and elbows. Build cardio, coordination, and real self-defense skills in a high-energy class for all levels.',
    ctaHref: '/programs/#kickboxing',
    accentColor: '#1a2e0e',
  },
]

export class OJJProgramsSection extends AnimatableMixin(BaseElement) {
  protected render(): void {
    const desktopCards = PROGRAMS.map(
      ({ title, badge, description, ctaHref, accentColor }) => `
        <div data-card class="flex-shrink-0 w-80 md:w-96">
          <ojj-program-card
            title="${title}"
            badge="${badge}"
            description="${description}"
            cta-href="${ctaHref}"
            accent-color="${accentColor}"
          ></ojj-program-card>
        </div>
      `
    ).join('')

    const gridCards = PROGRAMS.map(
      ({ title, badge, description, ctaHref, accentColor }) => `
        <div class="w-full">
          <ojj-program-card
            title="${title}"
            badge="${badge}"
            description="${description}"
            cta-href="${ctaHref}"
            accent-color="${accentColor}"
          ></ojj-program-card>
        </div>
      `
    ).join('')

    this.innerHTML = `
      <section aria-label="Programs for Every Level" class="relative" data-programs>

        <!-- Desktop animation layout — hidden on mobile -->
        <div data-programs-anim class="hidden md:flex min-h-screen relative overflow-hidden">

          <!-- Heading + subtitle: perfectly centered (H + V) in the viewport -->
          <div data-heading-wrap
               class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10 pointer-events-none">
            <h2 data-heading
                class="font-heading text-3xl sm:text-4xl font-black text-white mb-4">
              Programs for Every Level
            </h2>
            <p data-sub class="text-neutral-400 text-lg max-w-2xl mx-auto">
              From your first class to your first gold medal — we have a program designed for you.
            </p>
          </div>

          <!-- Card track: vertically centered, horizontal overflow clipped -->
          <div class="absolute inset-0 flex items-center overflow-hidden">
            <div data-track class="flex gap-6 will-change-transform">
              ${desktopCards}
            </div>
          </div>

        </div>

        <!-- Grid fallback — mobile always; shown on desktop when reduced-motion -->
        <div data-programs-grid class="md:hidden px-4 py-16">
          <div class="text-center mb-10">
            <h2 class="font-heading text-3xl font-black text-white mb-4">
              Programs for Every Level
            </h2>
            <p class="text-neutral-400 text-lg max-w-2xl mx-auto">
              From your first class to your first gold medal — we have a program designed for you.
            </p>
          </div>
          <div data-mobile-cards class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            ${gridCards}
          </div>
        </div>

      </section>
    `
  }

  protected override bindEvents(): void {
    const userReducedMotion = document.documentElement.hasAttribute('data-reduce-motion')
    if (!isMobile() && !userReducedMotion) {
      const trigger     = this.querySelector<HTMLElement>('[data-programs]')
      const headingWrap = this.querySelector<HTMLElement>('[data-heading-wrap]')
      const track       = this.querySelector<HTMLElement>('[data-track]')
      const cards       = Array.from(this.querySelectorAll<HTMLElement>('[data-card]'))
      if (!trigger || !headingWrap || !track || !cards.length) { return }
      this.programsReveal({ trigger, headingWrap, track, cards })
    } else {
      const mobileCards = this.querySelectorAll<HTMLElement>('[data-mobile-cards] > div')
      this.scrollReveal(mobileCards, 'stagger')
    }
  }
}

customElements.define('ojj-programs-section', OJJProgramsSection)
