/**
 * ojj-consent-banner — Cookie consent + motion preference banner.
 *
 * Shows on every visit until the user makes a choice. Preference is stored
 * in a cookie named 'ojj_consent' that expires after 30 days.
 *
 * Values:
 *   'full'      → Accept All: cookies + animations enabled (default behaviour)
 *   'essential' → Essentials Only: cookies declined, animations disabled
 *
 * Animations run immediately on page load regardless of banner state.
 * Clicking "Essentials Only" is the only action that disables them.
 */

import { BaseElement } from '../base/BaseElement'

const COOKIE_NAME = 'ojj_consent'
const COOKIE_DAYS = 30

function readCookie(): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)')
  )
  return match && match[1] !== undefined ? decodeURIComponent(match[1]) : null
}

function writeCookie(value: string, days: number): void {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
  ].join('; ')
}

/** Returns true if a consent cookie exists (either value). */
export function hasConsent(): boolean {
  return readCookie() !== null
}

/** Returns true if animations are allowed per stored preference. */
export function animationsAllowed(): boolean {
  return readCookie() !== 'essential'
}

export function applyMotionPreference(animated: boolean): void {
  if (animated) {
    document.documentElement.removeAttribute('data-reduce-motion')
    const animEl = document.querySelector<HTMLElement>('[data-programs-anim]')
    const gridEl = document.querySelector<HTMLElement>('[data-programs-grid]')
    if (animEl) { animEl.style.removeProperty('display') }
    if (gridEl) { gridEl.style.removeProperty('display') }
  } else {
    document.documentElement.setAttribute('data-reduce-motion', '')
    const animEl = document.querySelector<HTMLElement>('[data-programs-anim]')
    const gridEl = document.querySelector<HTMLElement>('[data-programs-grid]')
    if (animEl) { animEl.style.setProperty('display', 'none') }
    if (gridEl) { gridEl.style.setProperty('display', 'block') }
  }
}

export class OJJConsentBanner extends BaseElement {
  protected render(): void {
    this.innerHTML = `
      <div
        role="dialog"
        aria-label="Cookie and animation preferences"
        aria-modal="false"
        class="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-700 shadow-2xl"
      >
        <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">

          <div class="flex-1 text-sm text-neutral-300 leading-relaxed">
            <p>
              This site uses cookies and scroll animations. Animations are already running —
              click <strong class="text-white">Essentials Only</strong> to disable them.
              <a href="/privacy/" class="underline hover:text-white transition-colors ml-1">
                Privacy Policy
              </a>
            </p>
          </div>

          <div class="flex gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              data-decline
              class="flex-1 sm:flex-none px-4 py-2 text-sm text-neutral-400 border border-neutral-600 rounded hover:border-neutral-400 hover:text-neutral-200 transition-colors"
              type="button"
            >
              Essentials Only
            </button>
            <button
              data-accept
              class="flex-1 sm:flex-none px-5 py-2 text-sm bg-brand-red text-white rounded hover:bg-red-500 transition-colors font-semibold"
              type="button"
            >
              Got It
            </button>
          </div>

        </div>
      </div>
    `
  }

  protected override bindEvents(): void {
    this.querySelector('[data-accept]')?.addEventListener('click', () => {
      writeCookie('full', COOKIE_DAYS)
      this.remove()
    })

    this.querySelector('[data-decline]')?.addEventListener('click', () => {
      writeCookie('essential', COOKIE_DAYS)
      applyMotionPreference(false)
      this.remove()
    })
  }
}

customElements.define('ojj-consent-banner', OJJConsentBanner)
