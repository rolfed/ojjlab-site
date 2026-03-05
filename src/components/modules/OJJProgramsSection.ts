/**
 * ojj-programs-section — 4-card programs section.
 *
 * Desktop: pinned horizontal scroll via pinHorizontal().
 * Mobile: vertical stagger grid (pinHorizontal returns null, CSS takes over).
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'
import { isMobile } from '../../animations/animate'

const PROGRAMS = [
  {
    title: 'Adult BJJ',
    badge: 'Adults',
    description:
      'Comprehensive BJJ curriculum for adults of all experience levels. Learn takedowns, guard passing, submissions, and competition strategy in a structured environment.',
    ctaHref: '/programs/#adult',
    accentColor: '#1a1a2e',
  },
  {
    title: 'Youth BJJ',
    badge: 'Youth',
    description:
      'Fun, safe, and structured BJJ training for kids ages 5–15. We build confidence, discipline, and self-defense skills through age-appropriate drilling and positional sparring.',
    ctaHref: '/programs/#youth',
    accentColor: '#0f3460',
  },
  {
    title: "Women's BJJ",
    badge: "Women's",
    description:
      'A dedicated women-only class creating a supportive, welcoming space to learn BJJ. All levels welcome — no prior experience necessary.',
    ctaHref: '/programs/#womens',
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
]

export class OJJProgramsSection extends AnimatableMixin(BaseElement) {
  protected render(): void {
    const cards = PROGRAMS.map(
      ({ title, badge, description, ctaHref, accentColor }) => `
        <div class="flex-shrink-0 w-80 md:w-96">
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
      <section aria-labelledby="programs-heading" class="relative" data-container>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2
              id="programs-heading"
              data-animate="heading"
              class="font-heading text-3xl sm:text-4xl font-black text-white mb-4"
            >
              Programs for Every Level
            </h2>
            <p data-animate="sub" class="text-neutral-400 text-lg max-w-2xl mx-auto">
              From your first class to your first gold medal — we have a program designed for you.
            </p>
          </div>
        </div>

        <!-- Horizontal scroll track (desktop: pinned, mobile: hidden — cards below shown instead) -->
        <div class="hidden md:block" data-pin-wrapper>
          <div data-track class="flex gap-6 px-8 pb-8 will-change-transform" style="width: max-content">
            ${cards}
          </div>
        </div>

        <!-- Mobile: vertical grid -->
        <div class="md:hidden px-4 pb-16">
          <div data-mobile-cards class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${cards}
          </div>
        </div>
      </section>
    `
  }

  protected override bindEvents(): void {
    const heading = this.querySelector<HTMLElement>('[data-animate="heading"]')
    const sub = this.querySelector<HTMLElement>('[data-animate="sub"]')

    this.scrollReveal([heading, sub].filter((el): el is HTMLElement => el !== null), 'stagger')

    if (!isMobile()) {
      const container = this.querySelector<HTMLElement>('[data-pin-wrapper]')
      const track = this.querySelector<HTMLElement>('[data-track]')
      this.pinHorizontal(container, track)
    } else {
      const mobileCards = this.querySelectorAll<HTMLElement>('[data-mobile-cards] > div')
      this.scrollReveal(mobileCards, 'stagger')
    }
  }
}

customElements.define('ojj-programs-section', OJJProgramsSection)
