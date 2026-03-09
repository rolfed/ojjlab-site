/**
 * ojj-trial-form — free trial class request form.
 *
 * Progressive enhancement: renders a standard HTML form.
 * On submit, calls submitFreeTrial() which POSTs to GHL and redirects.
 *
 * Attributes:
 *   action  — form action URL (default: "/api/trial" — fallback without JS)
 *
 * Events:
 *   ojj:trial-submit — fired on form submit with { firstName, lastName, email, phone? }
 */

import { BaseElement } from '../base/BaseElement'
import { submitFreeTrial } from '@/service/forms'

const INPUT_CLASS = `w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500
  rounded-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-brand-accent focus-visible:border-transparent`

export class OJJTrialForm extends BaseElement {
  static observedAttributes = ['action']

  protected render(): void {
    const action = this.getAttribute('action') ?? '/api/trial'

    this.innerHTML = `
      <div class="max-w-xl mx-auto" data-form-wrapper>
        <form
          action="${action}"
          method="POST"
          novalidate
          data-trial-form
          class="flex flex-col gap-4"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="trial-first-name" class="text-sm font-semibold text-neutral-200">
                First Name <span class="text-brand-accent" aria-hidden="true">*</span>
              </label>
              <input
                id="trial-first-name"
                name="firstName"
                type="text"
                required
                autocomplete="given-name"
                placeholder="Jane"
                class="${INPUT_CLASS}"
              />
              <p class="text-brand-accent text-xs hidden" role="alert" data-error="firstName">
                Please enter your first name.
              </p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="trial-last-name" class="text-sm font-semibold text-neutral-200">
                Last Name <span class="text-brand-accent" aria-hidden="true">*</span>
              </label>
              <input
                id="trial-last-name"
                name="lastName"
                type="text"
                required
                autocomplete="family-name"
                placeholder="Smith"
                class="${INPUT_CLASS}"
              />
              <p class="text-brand-accent text-xs hidden" role="alert" data-error="lastName">
                Please enter your last name.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="trial-email" class="text-sm font-semibold text-neutral-200">
              Email Address <span class="text-brand-accent" aria-hidden="true">*</span>
            </label>
            <input
              id="trial-email"
              name="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="${INPUT_CLASS}"
            />
            <p class="text-brand-accent text-xs hidden" role="alert" data-error="email">
              Please enter a valid email address.
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="trial-phone" class="text-sm font-semibold text-neutral-200">
              Phone Number <span class="text-neutral-500 font-normal text-xs">(optional)</span>
            </label>
            <input
              id="trial-phone"
              name="phone"
              type="tel"
              autocomplete="tel"
              placeholder="(503) 555-0100"
              class="${INPUT_CLASS}"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-brand-accent text-white font-bold text-base py-4 rounded-md
                   hover:bg-red-700 transition-colors focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2
                   focus-visible:ring-offset-neutral-950 disabled:opacity-50"
            data-submit-btn
          >
            Book My Free Trial
          </button>
        </form>

        <!-- Success state (shown if redirect doesn't fire) -->
        <div
          role="status"
          aria-live="polite"
          class="hidden text-center py-8"
          data-success
        >
          <p class="text-3xl mb-3" aria-hidden="true">🥋</p>
          <h3 class="text-white font-bold text-xl mb-2">You're on the mat!</h3>
          <p class="text-neutral-400">We'll be in touch shortly with your trial class details.</p>
        </div>

        <!-- Error state -->
        <p
          class="hidden text-brand-accent text-sm text-center mt-3"
          role="alert"
          data-submit-error
        >
          Something went wrong — please try again or call us at (503) 308-8455.
        </p>
      </div>
    `
  }

  protected override bindEvents(): void {
    const form = this.querySelector<HTMLFormElement>('[data-trial-form]')
    if (!form) return

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      if (!this._validate(form)) return

      const formData = new FormData(form)
      const getStr = (key: string): string => {
        const val = formData.get(key)
        return typeof val === 'string' ? val : ''
      }

      this.emit('trial-submit', {
        firstName: getStr('firstName'),
        lastName:  getStr('lastName'),
        email:     getStr('email'),
        phone:     getStr('phone') || undefined,
      })

      this._setSubmitting(true)

      submitFreeTrial(formData).catch(() => {
        this._setSubmitting(false)
        const errorEl = this.querySelector<HTMLElement>('[data-submit-error]')
        errorEl?.classList.remove('hidden')
      })
    })
  }

  private _validate(form: HTMLFormElement): boolean {
    let valid = true

    const fields: Array<{ name: string; selector: string; check: (el: HTMLInputElement) => boolean }> = [
      { name: 'firstName', selector: '[name="firstName"]', check: (el) => el.value.trim().length > 0 },
      { name: 'lastName',  selector: '[name="lastName"]',  check: (el) => el.value.trim().length > 0 },
      { name: 'email',     selector: '[name="email"]',     check: (el) => el.validity.valid },
    ]

    let firstInvalid: HTMLInputElement | null = null

    for (const { name, selector, check } of fields) {
      const input = form.querySelector<HTMLInputElement>(selector)
      const error = this.querySelector<HTMLElement>(`[data-error="${name}"]`)
      if (!input) continue

      if (!check(input)) {
        error?.classList.remove('hidden')
        input.setAttribute('aria-invalid', 'true')
        if (!firstInvalid) firstInvalid = input
        valid = false
      } else {
        error?.classList.add('hidden')
        input.removeAttribute('aria-invalid')
      }
    }

    firstInvalid?.focus()
    return valid
  }

  private _setSubmitting(submitting: boolean): void {
    const btn = this.querySelector<HTMLButtonElement>('[data-submit-btn]')
    if (!btn) return
    btn.disabled = submitting
    btn.textContent = submitting ? 'Submitting…' : 'Book My Free Trial'
  }
}

customElements.define('ojj-trial-form', OJJTrialForm)
