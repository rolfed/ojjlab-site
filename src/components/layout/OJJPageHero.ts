/**
 * ojj-page-hero — full-viewport hero section with headline, subheadline, CTA, and parallax bg.
 *
 * Attributes:
 *   headline     — main h1 text
 *   subheadline  — supporting paragraph
 *   cta-label    — primary CTA button label (default: "Book a Free Trial")
 *   cta-href     — primary CTA href (default: "/schedule/")
 *   bg-gradient  — optional Tailwind gradient class override
 *
 * Animation: heroEntrance on load, parallax on bg layer.
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

export class OJJPageHero extends AnimatableMixin(BaseElement) {
  static observedAttributes = ['headline', 'subheadline', 'cta-label', 'cta-href']

  protected render(): void {
    const headline = this.getAttribute('headline') ?? 'Train Like a Champion'
    const sub = this.getAttribute('subheadline') ?? 'Brazilian Jiu Jitsu for all levels in Oregon'
    const ctaLabel = this.getAttribute('cta-label') ?? 'Book a Free Trial'
    const ctaHref = this.getAttribute('cta-href') ?? '/schedule/'

    this.innerHTML = `
      <section
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-primary"
        aria-label="Hero"
      >
        <!-- Parallax background layer -->
        <div
          data-bg
          class="absolute inset-0 bg-gradient-to-br from-brand-primary via-neutral-900 to-neutral-950 will-change-transform"
          aria-hidden="true"
        ></div>

        <!-- Decorative accent -->
        <div
          class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(ellipse at 60% 40%, var(--color-brand-accent) 0%, transparent 60%)"
          aria-hidden="true"
        ></div>

        <!-- Content -->
        <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-animate="headline"
            class="font-heading text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6"
          >
            ${headline}
          </h1>

          <p
            data-animate="sub"
            class="text-lg sm:text-xl lg:text-2xl text-neutral-300 max-w-2xl mx-auto mb-10"
          >
            ${sub}
          </p>

          <div data-animate="cta" class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="${ctaHref}"
              class="inline-flex items-center justify-center gap-2 bg-brand-accent text-white font-bold text-lg px-8 py-4 rounded-md hover:bg-red-700 transition-colors"
            >
              ${ctaLabel}
              <ojj-icon name="arrow-right" size="20" aria-hidden="true"></ojj-icon>
            </a>
            <a
              href="/programs/"
              class="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-md hover:bg-white hover:text-brand-primary transition-colors"
            >
              View Programs
            </a>
          </div>
        </div>

      </section>
    `
  }

  protected override bindEvents(): void {
    const headline = this.querySelector<HTMLElement>('[data-animate="headline"]')
    const sub = this.querySelector<HTMLElement>('[data-animate="sub"]')
    const cta = this.querySelector<HTMLElement>('[data-animate="cta"]')
    const bg = this.querySelector<HTMLElement>('[data-bg]')

    this.heroEntrance([headline, sub, cta])
    this.parallax(bg)
  }
}

customElements.define('ojj-page-hero', OJJPageHero)
