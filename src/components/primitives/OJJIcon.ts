/**
 * ojj-icon — inline SVG icon primitive.
 *
 * Attributes:
 *   name    — icon name (required): 'menu' | 'close' | 'arrow-right' | 'chevron-right' | 'external'
 *   size    — pixel size (default: 24)
 *   label   — accessible label; omit for decorative icons (sets aria-hidden when absent)
 */

import { BaseElement } from '../base/BaseElement'

type IconName =
  | 'menu'
  | 'close'
  | 'arrow-right'
  | 'chevron-right'
  | 'external'
  | 'map-pin'
  | 'phone'
  | 'mail'

const ICONS: Record<IconName, string> = {
  menu: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  'arrow-right': `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  'chevron-right': `<polyline points="9 18 15 12 9 6"/>`,
  external: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
  'map-pin': `<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
  phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>`,
  mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
}

export class OJJIcon extends BaseElement {
  static observedAttributes = ['name', 'size', 'label']

  protected render(): void {
    const name = (this.getAttribute('name') ?? 'menu') as IconName
    const size = this.getAttribute('size') ?? '24'
    const label = this.getAttribute('label')
    const paths = ICONS[name] ?? ICONS.menu

    const ariaAttrs = label
      ? `role="img" aria-label="${label}"`
      : `aria-hidden="true" focusable="false"`

    this.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${size}"
        height="${size}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ${ariaAttrs}
      >${paths}</svg>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-icon', OJJIcon)
