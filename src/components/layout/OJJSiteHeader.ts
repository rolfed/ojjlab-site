/**
 * ojj-site-header — site-wide header with logo, nav, and CTA.
 *
 * Attributes:
 *   current-page — forwarded to ojj-nav for active link highlighting
 *   transparent  — boolean; makes header bg transparent (for hero overlap)
 *
 * Manages ojj-nav-drawer open/close state.
 */

import { BaseElement } from '../base/BaseElement'

export class OJJSiteHeader extends BaseElement {
  static observedAttributes = ['current-page', 'transparent']

  protected render(): void {
    const current = this.getAttribute('current-page') ?? '/'
    const transparent = this.hasAttribute('transparent')
    const bgCls = transparent
      ? 'bg-transparent'
      : 'bg-brand-primary/95 backdrop-blur-sm border-b border-neutral-800'

    this.innerHTML = `
      <header
        role="banner"
        class="fixed top-0 left-0 right-0 z-30 ${bgCls} transition-colors duration-300"
        data-header
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <!-- Logo -->
          <a
            href="/"
            class="flex items-center"
            aria-label="Oregon Jiu Jitsu Lab — home"
          >
            <img
              src="/images/ojjlab-logo.png"
              alt="Oregon Jiu Jitsu Lab"
              width="192"
              height="60"
              class="h-8 w-auto"
            >
          </a>

          <!-- Nav + CTA -->
          <div class="flex items-center gap-4">
            <ojj-nav current-page="${current}"></ojj-nav>
            <a
              href="/schedule/"
              class="hidden md:inline-flex items-center gap-2 bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Free Trial
            </a>
          </div>
        </div>
      </header>

      <!-- Mobile drawer (always in DOM, toggled via attribute) -->
      <ojj-nav-drawer id="nav-drawer"></ojj-nav-drawer>
    `
  }

  protected override bindEvents(): void {
    // Open drawer when ojj-nav emits nav-open
    this.addEventListener('ojj:nav-open', () => {
      const drawer = this.querySelector('ojj-nav-drawer')
      drawer?.setAttribute('open', '')
      // Update toggle button aria-expanded
      const toggle = this.querySelector<HTMLButtonElement>('[aria-controls="nav-drawer"]')
      if (toggle) toggle.setAttribute('aria-expanded', 'true')
    })

    // Close drawer when it emits nav-close
    this.addEventListener('ojj:nav-close', () => {
      const toggle = this.querySelector<HTMLButtonElement>('[aria-controls="nav-drawer"]')
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false')
        toggle.focus()
      }
    })

    // Scroll: add solid bg when page is scrolled (only in transparent mode)
    if (this.hasAttribute('transparent')) {
      const header = this.querySelector<HTMLElement>('[data-header]')
      window.addEventListener('scroll', () => {
        if (!header) return
        if (window.scrollY > 50) {
          header.classList.remove('bg-transparent')
          header.classList.add('bg-brand-primary/95', 'backdrop-blur-sm', 'border-b', 'border-neutral-800')
        } else {
          header.classList.add('bg-transparent')
          header.classList.remove('bg-brand-primary/95', 'backdrop-blur-sm', 'border-b', 'border-neutral-800')
        }
      }, { passive: true })
    }
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-site-header', OJJSiteHeader)
