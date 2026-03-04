/**
 * ojj-nav — site navigation bar (desktop links + mobile menu trigger).
 *
 * Attributes:
 *   current-page — path to highlight as aria-current (e.g. "/", "/about/")
 *
 * Events:
 *   ojj:nav-open — fired when hamburger button is clicked
 */

import { BaseElement } from '../base/BaseElement'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Schedule', href: '/schedule/' },
  { label: 'Programs', href: '/programs/' },
  { label: 'Shop', href: '/shop/' },
]

export class OJJNav extends BaseElement {
  static observedAttributes = ['current-page']

  protected render(): void {
    const current = this.getAttribute('current-page') ?? '/'

    const links = NAV_LINKS.map(({ label, href }) => {
      const isCurrent = href === current
      const base = 'text-sm font-medium transition-colors duration-150'
      const active = isCurrent
        ? 'text-brand-accent'
        : 'text-neutral-300 hover:text-white'
      const aria = isCurrent ? 'aria-current="page"' : ''
      return `<a href="${href}" class="${base} ${active}" ${aria}>${label}</a>`
    }).join('')

    this.innerHTML = `
      <nav aria-label="Main" class="flex items-center gap-6">
        <div class="hidden md:flex items-center gap-6">${links}</div>
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="nav-drawer"
          class="md:hidden flex items-center justify-center w-10 h-10 text-neutral-100 hover:text-white"
          data-menu-toggle
        >
          <ojj-icon name="menu" size="24" aria-hidden="true"></ojj-icon>
        </button>
      </nav>
    `
  }

  protected override bindEvents(): void {
    this.querySelector('[data-menu-toggle]')?.addEventListener('click', () => {
      this.emit('nav-open')
    })
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-nav', OJJNav)
