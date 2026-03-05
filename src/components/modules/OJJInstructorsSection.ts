/**
 * ojj-instructors-section — instructor carousel / grid.
 *
 * Desktop (≥768px): pinned viewport with GSAP scroll, heading fades, cards scale at center.
 * Mobile (<768px): vertical stagger grid.
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'
import { isMobile } from '../../animations/animate'

const INSTRUCTORS = [
  {
    name: 'Coach Alex Rivera',
    belt: 'black',
    title: 'Head Instructor',
    bio: '3rd degree black belt with 15+ years of competitive and coaching experience. IBJJF World Champion 2018.',
  },
  {
    name: 'Coach Maria Santos',
    belt: 'black',
    title: "Women's Program Lead",
    bio: '2nd degree black belt and 3× Pan American Champion. Passionate about creating safe, empowering training spaces for women.',
  },
  {
    name: 'Coach Jordan Lee',
    belt: 'brown',
    title: 'Youth Program Director',
    bio: 'Brown belt with a background in youth athletics coaching. Specialises in age-appropriate curriculum and positive reinforcement.',
  },
]

function renderCard(instructor: (typeof INSTRUCTORS)[number]): string {
  const { name, belt, title, bio } = instructor
  return `
    <div class="flex-shrink-0 w-72 lg:w-80">
      <ojj-instructor-card
        name="${name}"
        belt="${belt}"
        title="${title}"
        bio="${bio}"
      ></ojj-instructor-card>
    </div>
  `
}

export class OJJInstructorsSection extends AnimatableMixin(BaseElement) {
  protected render(): void {
    const cards = INSTRUCTORS.map(renderCard).join('')

    this.innerHTML = `
      <section aria-label="Meet Your Instructors"
               class="relative bg-brand-primary"
               data-carousel-section>

        <!-- Desktop: absolute heading overlay — centred, fades on scroll -->
        <div class="hidden md:flex absolute inset-0 flex-col items-center justify-center
                    z-10 pointer-events-none text-center"
             data-heading-block>
          <h2 data-heading
              class="font-heading text-5xl lg:text-7xl font-black text-white leading-none mb-4">
            Meet Your Instructors
          </h2>
          <p data-sub class="text-neutral-400 text-lg">
            Black belts dedicated to your development on and off the mat.
          </p>
          <p data-scroll-hint class="mt-6 text-sm text-neutral-500 flex items-center justify-center gap-2">
            Scroll to explore
            <ojj-icon name="arrow-right" size="14" aria-hidden="true"></ojj-icon>
          </p>
        </div>

        <!-- Desktop: horizontal carousel track -->
        <div class="hidden md:flex items-center h-screen will-change-transform" data-track>
          ${cards}
        </div>

        <!-- Mobile: standard vertical layout -->
        <div class="md:hidden px-4 py-16">
          <h2 id="instructors-heading" class="font-heading text-3xl font-black text-white mb-2">
            Meet Your Instructors
          </h2>
          <p class="text-neutral-400 mb-8">Black belts dedicated to your development.</p>
          <div data-mobile-cards class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            ${cards}
          </div>
        </div>

      </section>
    `
  }

  protected override bindEvents(): void {
    const section = this.querySelector<HTMLElement>('[data-carousel-section]')
    const track = this.querySelector<HTMLElement>('[data-track]')
    const heading = this.querySelector<HTMLElement>('[data-heading]')
    const sub = this.querySelector<HTMLElement>('[data-sub]')
    const cardWrappers = Array.from(this.querySelectorAll<HTMLElement>('[data-track] > div'))

    // Only stagger-reveal the mobile grid when actually on mobile — the elements
    // are always in the DOM (hidden md:flex hides them via CSS), so without this
    // guard we'd register live ScrollTriggers against invisible desktop elements.
    if (isMobile()) {
      const mobileCards = this.querySelectorAll<HTMLElement>('[data-mobile-cards] > div')
      if (mobileCards.length) this.scrollReveal(mobileCards, 'stagger')
    }

    this.pinnedCardCarousel(section, track, heading, sub, cardWrappers)
  }
}

customElements.define('ojj-instructors-section', OJJInstructorsSection)
