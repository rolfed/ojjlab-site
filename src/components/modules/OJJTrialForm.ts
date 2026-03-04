/**
 * ojj-trial-form — free trial class request form.
 *
 * Progressive enhancement: renders a standard HTML form.
 * On submit, shows inline success state.
 *
 * Attributes:
 *   action  — form action URL (default: "/api/trial" — placeholder)
 *
 * Events:
 *   ojj:trial-submit — fired on form submit with { name, email, phone? }
 *   ojj:trial-success — fired after successful submission
 */

import { BaseElement } from '../base/BaseElement'

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
          <div class="flex flex-col gap-1.5">
            <label for="trial-name" class="text-sm font-semibold text-neutral-200">
              Full Name <span class="text-brand-accent" aria-hidden="true">*</span>
            </label>
            <input
              id="trial-name"
              name="name"
              type="text"
              required
              autocomplete="name"
              placeholder="Jane Smith"
              class="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500
                     rounded-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-accent focus-visible:border-transparent"
            />
            <p class="text-brand-accent text-xs hidden" role="alert" data-error="name">
              Please enter your full name.
            </p>
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
              class="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500
                     rounded-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-accent focus-visible:border-transparent"
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
              class="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500
                     rounded-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-accent focus-visible:border-transparent"
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

        <!-- Success state (hidden until submit) -->
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
      </div>
    `
  }

  protected override bindEvents(): void {
    const form = this.querySelector<HTMLFormElement>('[data-trial-form]')
    if (!form) return

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      if (!this._validate(form)) return

      const data = new FormData(form)
      const payload = {
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        phone: data.get('phone') ? String(data.get('phone')) : undefined,
      }

      this.emit('trial-submit', payload)

      // Disable submit while "submitting"
      const btn = this.querySelector<HTMLButtonElement>('[data-submit-btn]')
      if (btn) {
        btn.disabled = true
        btn.textContent = 'Submitting…'
      }

      // Simulate async — real implementation hooks into fetch/GymDesk redirect
      setTimeout(() => {
        this._showSuccess()
        this.emit('trial-success', payload)
      }, 800)
    })
  }

  private _validate(form: HTMLFormElement): boolean {
    let valid = true

    const nameInput = form.querySelector<HTMLInputElement>('[name="name"]')
    const emailInput = form.querySelector<HTMLInputElement>('[name="email"]')

    const nameError = this.querySelector<HTMLElement>('[data-error="name"]')
    const emailError = this.querySelector<HTMLElement>('[data-error="email"]')

    if (nameInput && !nameInput.value.trim()) {
      if (nameError) nameError.classList.remove('hidden')
      nameInput.setAttribute('aria-invalid', 'true')
      nameInput.focus()
      valid = false
    } else {
      if (nameError) nameError.classList.add('hidden')
      nameInput?.removeAttribute('aria-invalid')
    }

    if (emailInput && !emailInput.validity.valid) {
      if (emailError) emailError.classList.remove('hidden')
      emailInput.setAttribute('aria-invalid', 'true')
      if (valid) emailInput.focus()
      valid = false
    } else {
      if (emailError) emailError.classList.add('hidden')
      emailInput?.removeAttribute('aria-invalid')
    }

    return valid
  }

  private _showSuccess(): void {
    const form = this.querySelector<HTMLFormElement>('[data-trial-form]')
    const success = this.querySelector<HTMLElement>('[data-success]')
    if (form) form.classList.add('hidden')
    if (success) success.classList.remove('hidden')
  }
}

customElements.define('ojj-trial-form', OJJTrialForm)
