/**
 * ojj-icon — inline SVG icon primitive.
 *
 * Attributes:
 *   name    — icon name (required): 'menu' | 'close' | 'arrow-right' | 'chevron-right' | 'external'
 *   size    — pixel size (default: 24)
 *   label   — accessible label; omit for decorative icons (sets aria-hidden when absent)
 */

import { BaseElement } from '../base/BaseElement'

type IconName = 'menu' | 'close' | 'arrow-right' | 'chevron-right' | 'external'

const ICONS: Record<IconName, string> = {
  menu: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  'arrow-right': `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  'chevron-right': `<polyline points="9 18 15 12 9 6"/>`,
  external: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
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
