/**
 * ojj-nav-drawer — mobile off-canvas navigation drawer.
 *
 * Opened/closed via the `open` boolean attribute.
 * Traps focus when open. Closes on Escape or overlay click.
 * Returns focus to the trigger element on close.
 *
 * Attributes:
 *   open — boolean; presence = open
 *
 * Events:
 *   ojj:nav-close — fired when drawer requests close
 */

import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Schedule', href: '/schedule/' },
  { label: 'Programs', href: '/programs/' },
  { label: 'Shop', href: '/shop/' },
  { label: 'Login', href: '/login/' },
]

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex="0"]'

export class OJJNavDrawer extends AnimatableMixin(BaseElement) {
  static observedAttributes = ['open']

  private _boundKeydown: (e: KeyboardEvent) => void

  constructor() {
    super()
    this._boundKeydown = this._handleKeydown.bind(this)
  }

  protected render(): void {
    const links = NAV_LINKS.map(({ label, href }) =>
      `<a href="${href}" class="block px-6 py-3 text-lg font-medium text-neutral-100 hover:text-white hover:bg-neutral-800 transition-colors">${label}</a>`
    ).join('')

    this.innerHTML = `
      <!-- Overlay -->
      <div
        data-overlay
        class="fixed inset-0 bg-black/60 z-40 hidden"
        aria-hidden="true"
      ></div>

      <!-- Drawer panel -->
      <div
        id="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        class="fixed top-0 right-0 h-full w-72 max-w-full bg-brand-primary z-50 shadow-2xl
               flex flex-col translate-x-full transition-transform duration-300"
        data-panel
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <span class="text-white font-bold text-lg">Menu</span>
          <button
            type="button"
            aria-label="Close navigation menu"
            class="flex items-center justify-center w-10 h-10 text-neutral-300 hover:text-white"
            data-close
          >
            <ojj-icon name="close" size="24" aria-hidden="true"></ojj-icon>
          </button>
        </div>

        <nav aria-label="Mobile main" class="flex-1 overflow-y-auto py-4">
          ${links}
        </nav>

        <div class="px-6 py-4 border-t border-neutral-800">
          <a
            href="/login/"
            class="block w-full text-center bg-brand-accent text-white font-semibold py-3 rounded-md hover:bg-red-700 transition-colors"
          >
            Member Login
          </a>
        </div>
      </div>
    `
  }

  protected override bindEvents(): void {
    this.querySelector('[data-close]')?.addEventListener('click', () => this._close())
    this.querySelector('[data-overlay]')?.addEventListener('click', () => this._close())
  }

  attributeChangedCallback(name: string, _old: string | null, newVal: string | null): void {
    if (name !== 'open' || !this.isConnected) return
    if (newVal !== null) {
      this._openDrawer()
    } else {
      this._closeDrawer()
    }
  }

  private _openDrawer(): void {
    const overlay = this.querySelector<HTMLElement>('[data-overlay]')
    const panel = this.querySelector<HTMLElement>('[data-panel]')
    if (!overlay || !panel) return

    overlay.classList.remove('hidden')
    // Force reflow before removing translate so transition fires
    panel.getBoundingClientRect()
    panel.classList.remove('translate-x-full')
    panel.removeAttribute('hidden')

    document.addEventListener('keydown', this._boundKeydown)
    document.body.style.overflow = 'hidden'

    // Focus first focusable element in drawer
    const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE)
    firstFocusable?.focus()
  }

  private _closeDrawer(): void {
    const overlay = this.querySelector<HTMLElement>('[data-overlay]')
    const panel = this.querySelector<HTMLElement>('[data-panel]')
    if (!overlay || !panel) return

    panel.classList.add('translate-x-full')
    overlay.classList.add('hidden')

    document.removeEventListener('keydown', this._boundKeydown)
    document.body.style.overflow = ''
  }

  private _close(): void {
    this.removeAttribute('open')
    this.emit('nav-close')
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this._close()
      return
    }

    if (e.key !== 'Tab') return

    const panel = this.querySelector<HTMLElement>('[data-panel]')
    if (!panel) return

    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (!first || !last) return

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  protected override cleanup(): void {
    document.removeEventListener('keydown', this._boundKeydown)
    document.body.style.overflow = ''
    super.cleanup()
  }
}

customElements.define('ojj-nav-drawer', OJJNavDrawer)
