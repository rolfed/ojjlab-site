/**
 * ojj-badge — belt/label badge primitive.
 *
 * Attributes:
 *   color — 'white' | 'blue' | 'purple' | 'brown' | 'black' | 'gold' | 'accent' (default: 'accent')
 *
 * Slot: text content (e.g. "Black Belt", "Head Instructor")
 */

import { BaseElement } from '../base/BaseElement'

type BadgeColor = 'white' | 'blue' | 'purple' | 'brown' | 'black' | 'gold' | 'accent'

const COLOR_CLASSES: Record<BadgeColor, string> = {
  white: 'bg-neutral-100 text-neutral-900',
  blue: 'bg-blue-600 text-white',
  purple: 'bg-purple-600 text-white',
  brown: 'bg-amber-800 text-white',
  black: 'bg-neutral-900 text-white',
  gold: 'bg-brand-gold text-neutral-900',
  accent: 'bg-brand-accent text-white',
}

export class OJJBadge extends BaseElement {
  static observedAttributes = ['color']

  protected render(): void {
    const color = (this.getAttribute('color') ?? 'accent') as BadgeColor
    const colorCls = COLOR_CLASSES[color]
    const text = this.textContent.trim()

    this.innerHTML = `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${colorCls}">
        ${text}
      </span>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-badge', OJJBadge)
