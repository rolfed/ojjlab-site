/**
 * ojj-marquee — infinite scrolling text strip.
 *
 * Content is duplicated once in the DOM to enable seamless looping.
 * Pauses on hover and focus-within (managed in animate.ts marquee()).
 *
 * Attributes:
 *   items    — pipe-separated list of items (default: built-in BJJ phrases)
 *   duration — scroll duration in seconds (default: 20)
 *   separator — separator string between items (default: " · ")
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

const DEFAULT_ITEMS = [
  'Brazilian Jiu Jitsu',
  'Adults',
  'Youth',
  'All Levels Welcome',
  'Competition Team',
  "Women's BJJ",
  'Oregon',
  'Free Trial Class',
]

export class OJJMarquee extends AnimatableMixin(BaseElement) {
  static observedAttributes = ['items', 'duration', 'separator']

  protected render(): void {
    const rawItems = this.getAttribute('items')
    const items = rawItems ? rawItems.split('|').map((s) => s.trim()) : DEFAULT_ITEMS
    const sep = this.getAttribute('separator') ?? ' · '
    const text = items.join(sep) + sep

    // Duplicate for seamless loop
    const content = `<span>${text}</span><span aria-hidden="true">${text}</span>`

    this.innerHTML = `
      <div
        class="overflow-hidden bg-brand-accent text-white py-3 select-none"
        aria-label="Marquee: ${items.join(', ')}"
      >
        <div
          data-track
          class="flex whitespace-nowrap will-change-transform"
          style="width: max-content"
        >
          ${content}
        </div>
      </div>
    `
  }

  protected override bindEvents(): void {
    const track = this.querySelector<HTMLElement>('[data-track]')
    const duration = parseFloat(this.getAttribute('duration') ?? '20')
    this.marquee(track, { duration })
  }
}

customElements.define('ojj-marquee', OJJMarquee)
