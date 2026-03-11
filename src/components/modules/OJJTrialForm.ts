import { gsap } from 'gsap'
import { startLead, StartLeadInput } from '@/data/leads'
import { BaseElement } from '../base/BaseElement'
import { getLeadSource } from '@/data/source'
import { Navigate, Route } from '@/util/navigation'

const INPUT_CLASS = `w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500
rounded-md px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-brand-accent focus-visible:border-transparent`

export class OJJTrialForm extends BaseElement {
  static observedAttributes = ['action']

  protected render(): void {
    this.innerHTML = `
      <div class="max-w-xl mx-auto" data-form-wrapper>
        <form
          novalidate
          data-trial-form
          class="flex flex-col gap-4"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="trial-first-name" class="text-md font-semibold text-neutral-600">
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
              <label for="trial-last-name" class="text-md font-semibold text-neutral-600">
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
            <label for="trial-email" class="text-md font-semibold text-neutral-600">
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
            <label for="trial-phone" class="text-md font-semibold text-neutral-600">
              Phone Number <span class="text-neutral-500 font-normal text-xs">(optional)</span>
            </label>
            <input
              data-trial-form-phone
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

        <div
          data-trial-form-submit-success
          role="status"
          aria-live="polite"
          class="hidden text-center py-8"
        >
          <p class="text-3xl mb-3" aria-hidden="true">🥋</p>
          <h3 class="text-white font-bold text-xl mb-2">
            You're all set!
          </h3>
          <p class="text-neutral-400">
            One more step — we're redirecting you to pick a time for your free trial class.
          </p>
        </div>

        <p
          data-trial-form-submit-fail
          class="hidden text-brand-accent text-sm text-center mt-3"
          role="alert"
        >
          Something went wrong — please try again or call us at (503) 308-8455.
        </p>
      </div>
    `
  }

  protected override bindEvents(): void {
    const form = this._getForm()
    if (!form) return

    this._bindPhoneInputMask(this._getPhoneInput())

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      void this._handleSubmit(form)
    })
  }

  private async _handleSubmit(form: HTMLFormElement): Promise<void> {
    this._hideSubmissionMessages()

    if (!this._validate(form)) {
      return
    }

    const lead = this._buildLeadInput(form)

    this.emit('trial-submit', lead)

    this._setSubmitting(true)

    try {
      await this.onSubmit(lead)
      this._setSubmitting(false)
      await this._handleSubmitSuccess()
    } catch {
      this._setSubmitting(false)
      this._handleSubmitFailure()
    }
  }

  private async _handleSubmitSuccess(): Promise<void> {
    const successEl = this._getSuccessMessageEl()

    if (!successEl) {
      this._navigateToBookTrial()
      return
    }

    await this._animateSuccessMessage(successEl)
    this._navigateToBookTrial()
  }

  private _handleSubmitFailure(): void {
    const failEl = this._getFailureMessageEl()
    if (!failEl) return

    this._revealMessage(failEl)
    this._animateMessageIn(failEl, {
      yFrom: 4,
      duration: 0.22,
    })
  }

  private _buildLeadInput(form: HTMLFormElement): StartLeadInput {
    const formData = new FormData(form)
    const getValue = (key: string): string => {
      const value = formData.get(key)
      return typeof value === 'string' ? value : ''
    }

    return {
      firstName: getValue('firstName').trim(),
      lastName: getValue('lastName').trim(),
      email: getValue('email').trim(),
      phone: this._normalizePhoneForApi(getValue('phone')),
    }
  }

  private _getForm(): HTMLFormElement | null {
    return this.querySelector<HTMLFormElement>('[data-trial-form]')
  }

  private _getPhoneInput(): HTMLInputElement | null {
    return this.querySelector<HTMLInputElement>('[data-trial-form-phone]')
  }

  private _getSuccessMessageEl(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-trial-form-submit-success]')
  }

  private _getFailureMessageEl(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-trial-form-submit-fail]')
  }

  private _hideSubmissionMessages(): void {
    this._getSuccessMessageEl()?.classList.add('hidden')
    this._getFailureMessageEl()?.classList.add('hidden')
  }

  private _revealMessage(el: HTMLElement): void {
    el.classList.remove('hidden')
  }

  private _navigateToBookTrial(): void {
    Navigate(Route.BookTrial, { source: 'home-trial-form' })
  }

  private async _animateSuccessMessage(el: HTMLElement): Promise<void> {
    this._revealMessage(el)

    gsap.set(el, {
      autoAlpha: 0,
      y: 6,
    })

    await this._runTimeline(
      gsap
        .timeline({
          defaults: {
            duration: 0.28,
            ease: 'power2.out',
          },
        })
        .to(el, {
          autoAlpha: 1,
          y: 0,
          clearProps: 'transform',
        })
        .to({}, { duration: 0.7 }),
    )
  }

  private _animateMessageIn(
    el: HTMLElement,
    options: { yFrom: number; duration: number },
  ): void {
    gsap.fromTo(
      el,
      {
        autoAlpha: 0,
        y: options.yFrom,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: options.duration,
        ease: 'power2.out',
        clearProps: 'transform',
      },
    )
  }

  private _runTimeline(timeline: gsap.core.Timeline): Promise<void> {
    return new Promise((resolve) => {
      timeline.eventCallback('onComplete', () => resolve())
    })
  }

  private async onSubmit(formData: StartLeadInput): Promise<void> {
    const source = getLeadSource()

    const finalRequest = {
      ...formData,
      source,
      tags: [source],
    }

    await startLead(finalRequest)
  }

  private _normalizePhoneForApi(value: string): string | undefined {
    const digits = value.replace(/\D/g, '')

    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    }

    if (digits.length === 10) {
      return `+1${digits}`
    }

    return undefined
  }

  private _bindPhoneInputMask(input: HTMLInputElement | null): void {
    if (!input) return

    input.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      target.value = this._formatPhoneInput(target.value)
    })
  }

  private _formatPhoneInput(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10)

    const area = digits.slice(0, 3)
    const prefix = digits.slice(3, 6)
    const line = digits.slice(6, 10)

    if (digits.length <= 3) {
      return area
    }

    if (digits.length <= 6) {
      return `(${area}) ${prefix}`
    }

    return `(${area}) ${prefix}-${line}`
  }

  private _validate(form: HTMLFormElement): boolean {
    let valid = true

    const fields: Array<{
      name: string
      selector: string
      check: (el: HTMLInputElement) => boolean
    }> = [
      {
        name: 'firstName',
        selector: '[name="firstName"]',
        check: (el) => el.value.trim().length > 0,
      },
      {
        name: 'lastName',
        selector: '[name="lastName"]',
        check: (el) => el.value.trim().length > 0,
      },
      {
        name: 'email',
        selector: '[name="email"]',
        check: (el) => el.validity.valid,
      },
    ]

    let firstInvalid: HTMLInputElement | null = null

    for (const { name, selector, check } of fields) {
      const input = form.querySelector<HTMLInputElement>(selector)
      const error = this.querySelector<HTMLElement>(`[data-error="${name}"]`)

      if (!input) continue

      if (!check(input)) {
        error?.classList.remove('hidden')
        input.setAttribute('aria-invalid', 'true')

        if (!firstInvalid) {
          firstInvalid = input
        }

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
