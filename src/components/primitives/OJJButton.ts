/**
 * ojj-button — styled button / link primitive.
 *
 * Renders an <a> when `href` is set, otherwise a <button>.
 *
 * Attributes:
 *   href     — turns element into an <a> link
 *   variant  — 'primary' | 'secondary' | 'ghost' (default: 'primary')
 *   size     — 'sm' | 'md' | 'lg' (default: 'md')
 *   disabled — disables interaction (boolean attribute)
 *   external — adds target="_blank" rel="noopener noreferrer" + icon (for <a>)
 *
 * Slot: button label (text + optional ojj-icon)
 *
 * Events:
 *   ojj:button-click — fired on click (detail: { href? })
 */

import { BaseElement } from '../base/BaseElement'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-accent text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
  secondary:
    'bg-transparent border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-neutral-100 hover:text-white underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export class OJJButton extends BaseElement {
  static observedAttributes = ['href', 'variant', 'size', 'disabled', 'external']

  protected render(): void {
    const href = this.getAttribute('href')
    const variant = (this.getAttribute('variant') ?? 'primary') as Variant
    const size = (this.getAttribute('size') ?? 'md') as Size
    const disabled = this.hasAttribute('disabled')
    const external = this.hasAttribute('external')

    const variantCls = VARIANT_CLASSES[variant]
    const sizeCls = SIZE_CLASSES[size]
    const baseCls = `inline-flex items-center gap-2 font-semibold rounded-md transition-colors duration-150 cursor-pointer ${variantCls} ${sizeCls}`
    const disabledCls = disabled ? 'opacity-50 pointer-events-none' : ''

    // Preserve slot content before re-render
    const slotContent = this.querySelector('[data-slot]')?.innerHTML ?? this.textContent.trim()

    if (href) {
      const externalAttrs = external
        ? `target="_blank" rel="noopener noreferrer"`
        : ''
      const externalIcon = external
        ? `<ojj-icon name="external" size="16" aria-hidden="true"></ojj-icon>`
        : ''
      this.innerHTML = `
        <a
          href="${href}"
          class="${baseCls} ${disabledCls}"
          ${disabled ? 'aria-disabled="true" tabindex="-1"' : ''}
          ${externalAttrs}
        >${slotContent}${externalIcon}</a>
      `
    } else {
      this.innerHTML = `
        <button
          type="button"
          class="${baseCls} ${disabledCls}"
          ${disabled ? 'disabled aria-disabled="true"' : ''}
        >${slotContent}</button>
      `
    }
  }

  protected override bindEvents(): void {
    const el = this.querySelector('a, button')
    el?.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled')) {
        e.preventDefault()
        return
      }
      this.emit('button-click', { href: this.getAttribute('href') ?? undefined })
    })
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-button', OJJButton)
