/**
 * ojj-stats-bar — animated counter stats bar.
 *
 * Attributes:
 *   stats — JSON string: [{ value: number, label: string, suffix?: string }]
 *
 * Animation: counter() on each stat number on scroll enter.
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

interface Stat {
  value: number
  label: string
  suffix?: string
}

const DEFAULT_STATS: Stat[] = [
  { value: 150, label: 'Active Members', suffix: '+' },
  { value: 8, label: 'Years Training Oregon', suffix: '' },
  { value: 42, label: 'Competition Medals', suffix: '+' },
]

export class OJJStatsBar extends AnimatableMixin(BaseElement) {
  static observedAttributes = ['stats']

  protected render(): void {
    let stats: Stat[] = DEFAULT_STATS
    const raw = this.getAttribute('stats')
    if (raw) {
      try {
        stats = JSON.parse(raw) as Stat[]
      } catch {
        // fall back to defaults
      }
    }

    const items = stats
      .map(
        ({ value, label, suffix = '' }, i) => `
        <div class="text-center" data-stat="${String(i)}">
          <p class="font-heading text-4xl sm:text-5xl font-black text-brand-accent mb-1">
            <span data-counter="${String(value)}">0</span>${suffix}
          </p>
          <p class="text-neutral-400 text-sm uppercase tracking-wide font-medium">${label}</p>
        </div>
      `
      )
      .join('')

    this.innerHTML = `
      <div class="bg-neutral-900 border-y border-neutral-800 py-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800">
            ${items}
          </div>
        </div>
      </div>
    `
  }

  protected override bindEvents(): void {
    this.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
      const endValue = parseInt(el.dataset['counter'] ?? '0', 10)
      this.counter(el, endValue)
    })
  }
}

customElements.define('ojj-stats-bar', OJJStatsBar)
