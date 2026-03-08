/**
 * ojj-booking-form — Step 2 of the free trial signup flow.
 *
 * Renders a program selector (segmented control) then reveals the matching
 * fieldset: Adult experience questions, or a parent form with dynamic child
 * rows for Little Grapplers / Young Athletes.
 *
 * Progressive enhancement:
 *   Without JS — all program sections are visible; the form degrades to a
 *   conventional multi-section layout.
 *   With JS — [data-enhanced] is set on the form; CSS drives show/hide and the
 *   segmented control becomes interactive.
 *
 * On valid submit → redirect to /trial-class-next-steps
 */

import { BaseElement } from '../base/BaseElement'

// ── Types ─────────────────────────────────────────────────────────────────────

type Program = 'adult' | 'little-grapplers' | 'young-athletes'

// ── Constants ─────────────────────────────────────────────────────────────────

const REDIRECT_URL = '/trial-class-next-steps'

const INPUT = [
  'w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500',
  'rounded-md px-4 py-3 text-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:border-transparent',
].join(' ')

const TEXTAREA = INPUT + ' resize-none'

const LABEL = 'text-sm font-semibold text-neutral-200'

const ERR_CLASS = 'text-brand-accent text-xs hidden mt-0.5'

// ── Template helpers ──────────────────────────────────────────────────────────

/** Renders the three-segment program toggle as radio buttons styled with CSS. */
function programToggleHTML(): string {
  const segments: Array<{ value: Program; label: string; sub: string }> = [
    { value: 'adult',            label: 'Adult',           sub: '' },
    { value: 'little-grapplers', label: 'Little Grapplers', sub: 'ages 5–10' },
    { value: 'young-athletes',   label: 'Young Athletes',  sub: 'ages 10–15' },
  ]

  const buttons = segments.map(({ value, label, sub }, i) => `
    <label class="relative flex-1 min-w-0 flex">
      <input
        type="radio"
        name="program"
        value="${value}"
        class="sr-only peer"
        ${i === 0 ? 'checked' : ''}
      />
      <span class="
        flex flex-col items-center justify-center gap-0.5
        h-full py-3 px-2 rounded-lg cursor-pointer select-none
        text-xs sm:text-sm font-semibold leading-tight text-center
        transition-colors duration-150
        text-neutral-400 hover:text-white
        peer-checked:bg-brand-accent peer-checked:text-white
        peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-neutral-900
      ">
        ${label}
        ${sub ? `<span class="text-xs font-normal opacity-80">${sub}</span>` : ''}
      </span>
    </label>
  `).join('')

  return `
    <fieldset class="border-0 p-0 m-0">
      <legend class="text-white font-bold text-base mb-3">
        I'm signing up for:
      </legend>
      <div class="flex gap-1 bg-neutral-800 rounded-xl p-1" role="group">
        ${buttons}
      </div>
    </fieldset>
  `
}

/** Returns a label + input/textarea + optional error message block. */
function fieldGroup(
  id:       string,
  label:    string,
  required: boolean,
  control:  string,
  errorMsg: string | null = null,
): string {
  const badge = required
    ? `<span class="text-brand-accent" aria-hidden="true">*</span>`
    : `<span class="text-neutral-500 font-normal text-xs">(optional)</span>`

  return `
    <div class="flex flex-col gap-1">
      <label for="${id}" class="${LABEL}">
        ${label} ${badge}
      </label>
      ${control}
      ${errorMsg ? `<p class="${ERR_CLASS}" role="alert" data-error="${id}">${errorMsg}</p>` : ''}
    </div>
  `
}

/** Adult program fieldset — experience questions. */
function adultSectionHTML(): string {
  return `
    <fieldset data-program-section="adult" class="flex flex-col gap-5 border-0 p-0 m-0">
      <legend class="sr-only">Adult experience questions</legend>

      <!-- Have you trained before? (yes / no radio) -->
      <div class="flex flex-col gap-2">
        <p class="${LABEL}">
          Have you trained jiu-jitsu before?
          <span class="text-brand-accent" aria-hidden="true">*</span>
        </p>
        <div class="flex gap-6" role="group" aria-required="true">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio" name="hasTrained" value="yes"
              data-trained-radio
              class="w-4 h-4 accent-brand-accent"
            />
            <span class="text-sm text-neutral-300 group-hover:text-white transition-colors">Yes</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio" name="hasTrained" value="no"
              data-trained-radio
              class="w-4 h-4 accent-brand-accent"
            />
            <span class="text-sm text-neutral-300 group-hover:text-white transition-colors">No</span>
          </label>
        </div>
        <p class="${ERR_CLASS}" role="alert" data-error="hasTrained">
          Please let us know if you've trained before.
        </p>
      </div>

      <!-- How long? — only shown when hasTrained = yes -->
      <div data-trained-detail hidden class="flex flex-col gap-1">
        ${fieldGroup(
          'yearsTraining',
          'How long have you trained?',
          true,
          `<input id="yearsTraining" name="yearsTraining" type="text"
             placeholder="e.g. 6 months, 2 years"
             class="${INPUT}" />`,
          "Please tell us how long you've trained.",
        )}
      </div>

      ${fieldGroup(
        'priorMartialArts',
        'Any prior martial arts experience?',
        false,
        `<input id="priorMartialArts" name="priorMartialArts" type="text"
           placeholder="e.g. Wrestling, Boxing — or leave blank"
           class="${INPUT}" />`,
      )}

      ${fieldGroup(
        'adultNotes',
        'Anything we should know before your first class?',
        false,
        `<textarea id="adultNotes" name="adultNotes" rows="3"
           placeholder="Injuries, goals, questions — anything is welcome."
           class="${TEXTAREA}"></textarea>`,
      )}
    </fieldset>
  `
}

/** A single child entry row (name + age + notes). */
function childEntryHTML(prefix: string, index: number, removable: boolean): string {
  return `
    <div data-child-entry class="flex flex-col gap-3 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
      <div class="flex items-center justify-between min-h-6">
        <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wide" data-child-label>
          Child ${index + 1}
        </span>
        ${removable ? `
          <button
            type="button"
            data-remove-child
            aria-label="Remove child ${index + 1}"
            class="text-xs text-neutral-500 hover:text-brand-accent transition-colors
                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded"
          >Remove</button>
        ` : '<span></span>'}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${fieldGroup(
          `${prefix}-name-${index}`,
          "Child's Name",
          true,
          `<input
             id="${prefix}-name-${index}"
             name="${prefix}-name-${index}"
             type="text"
             autocomplete="off"
             placeholder="Full name"
             class="${INPUT}"
           />`,
          "Please enter the child's name.",
        )}
        ${fieldGroup(
          `${prefix}-age-${index}`,
          "Child's Age",
          true,
          `<input
             id="${prefix}-age-${index}"
             name="${prefix}-age-${index}"
             type="number"
             min="3" max="17"
             placeholder="Age"
             class="${INPUT}"
           />`,
          "Please enter the child's age.",
        )}
      </div>

      ${fieldGroup(
        `${prefix}-notes-${index}`,
        'Notes',
        false,
        `<textarea
           id="${prefix}-notes-${index}"
           name="${prefix}-notes-${index}"
           rows="2"
           placeholder="Injuries, medical notes, or anything we should know"
           class="${TEXTAREA}"
         ></textarea>`,
      )}
    </div>
  `
}

/** Children program fieldset — parent form with dynamic rows. */
function childrenSectionHTML(program: 'little-grapplers' | 'young-athletes'): string {
  const config = {
    'little-grapplers': { title: 'Little Grappler',  ageRange: '5–10'  },
    'young-athletes':   { title: 'Young Athlete',    ageRange: '10–15' },
  }[program]

  return `
    <fieldset data-program-section="${program}" hidden class="flex flex-col gap-5 border-0 p-0 m-0">
      <legend class="sr-only">${config.title} registration</legend>

      <p class="text-sm text-neutral-400">
        Add each child you'd like to register. Ages ${config.ageRange} welcome.
      </p>

      <div data-children-list="${program}" class="flex flex-col gap-4" role="list" aria-label="Children">
        ${childEntryHTML(program, 0, false)}
      </div>

      <button
        type="button"
        data-add-child="${program}"
        class="self-start flex items-center gap-2 text-sm font-semibold
               text-brand-accent hover:text-red-400 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-md
               px-1 py-0.5"
      >
        <span aria-hidden="true" class="text-base leading-none">+</span>
        Add another child
      </button>
    </fieldset>
  `
}

/**
 * Calendar section placeholder.
 *
 * To inject the real calendar embed:
 *   1. Remove the <div data-calendar-placeholder> block below.
 *   2. Paste your calendar widget's embed code in its place.
 *   3. The wrapping <section id="booking-calendar"> can remain as-is.
 *      It provides the heading and accessible landmark.
 */
function calendarHTML(): string {
  return `
    <section id="booking-calendar" aria-labelledby="calendar-heading">
      <h2 id="calendar-heading" class="text-white font-bold text-lg mb-4">
        Pick a Date &amp; Time
      </h2>

      <!--
        ┌─────────────────────────────────────────────────────────┐
        │  CALENDAR EMBED — replace the placeholder div below     │
        │                                                          │
        │  Steps:                                                  │
        │  1. Delete <div data-calendar-placeholder>…</div>       │
        │  2. Paste your embed code in its place                  │
        │  3. Keep <section id="booking-calendar"> wrapper        │
        └─────────────────────────────────────────────────────────┘
      -->
      <div
        data-calendar-placeholder
        class="flex flex-col items-center justify-center gap-4 min-h-64
               rounded-xl border-2 border-dashed border-neutral-700
               bg-neutral-800/30 text-neutral-500 text-sm text-center px-6 py-12"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div>
          <p class="font-semibold text-neutral-400">Calendar coming soon</p>
          <p class="text-xs text-neutral-600 mt-1">
            Replace <code class="bg-neutral-800 px-1 rounded">data-calendar-placeholder</code>
            with your embed code
          </p>
        </div>
      </div>
    </section>
  `
}

// ── Validation ────────────────────────────────────────────────────────────────

function setFieldError(
  input:   HTMLElement | null,
  errorEl: HTMLElement | null,
  invalid: boolean,
): void {
  if (!input || !errorEl) return
  errorEl.classList.toggle('hidden', !invalid)
  if (invalid) {
    input.setAttribute('aria-invalid', 'true')
  } else {
    input.removeAttribute('aria-invalid')
  }
}

function validateAdultSection(section: HTMLElement): boolean {
  let valid = true
  let firstInvalid: HTMLInputElement | null = null

  // hasTrained radio — required
  const checked = section.querySelector<HTMLInputElement>('[name="hasTrained"]:checked')
  const hasTrainedError = section.querySelector<HTMLElement>('[data-error="hasTrained"]')
  const firstRadio = section.querySelector<HTMLInputElement>('[name="hasTrained"]')
  if (!checked) {
    setFieldError(firstRadio, hasTrainedError, true)
    if (!firstInvalid && firstRadio) firstInvalid = firstRadio
    valid = false
  } else {
    setFieldError(firstRadio, hasTrainedError, false)
  }

  // yearsTraining — required only when hasTrained=yes and section is visible
  const trainedDetail = section.querySelector<HTMLElement>('[data-trained-detail]')
  const yearsInput = section.querySelector<HTMLInputElement>('[name="yearsTraining"]')
  const yearsError = section.querySelector<HTMLElement>('[data-error="yearsTraining"]')
  if (trainedDetail && !trainedDetail.hidden && yearsInput) {
    const missing = !yearsInput.value.trim()
    setFieldError(yearsInput, yearsError, missing)
    if (missing) {
      if (!firstInvalid) firstInvalid = yearsInput
      valid = false
    }
  }

  firstInvalid?.focus()
  return valid
}

function validateChildrenSection(section: HTMLElement): boolean {
  let valid = true
  let firstInvalid: HTMLInputElement | null = null

  // for…of lets TypeScript track assignments to firstInvalid (forEach callbacks do not)
  for (const entry of section.querySelectorAll<HTMLElement>('[data-child-entry]')) {
    const nameInput = entry.querySelector<HTMLInputElement>('input[name*="-name-"]')
    const nameError = nameInput
      ? entry.querySelector<HTMLElement>(`[data-error="${nameInput.name}"]`)
      : null
    const nameMissing = !nameInput?.value.trim()
    setFieldError(nameInput, nameError, nameMissing)
    if (nameMissing) {
      if (!firstInvalid && nameInput) firstInvalid = nameInput
      valid = false
    }

    const ageInput = entry.querySelector<HTMLInputElement>('input[name*="-age-"]')
    const ageError = ageInput
      ? entry.querySelector<HTMLElement>(`[data-error="${ageInput.name}"]`)
      : null
    const ageMissing = !ageInput?.value.trim()
    setFieldError(ageInput, ageError, ageMissing)
    if (ageMissing) {
      if (!firstInvalid && ageInput) firstInvalid = ageInput
      valid = false
    }
  }

  firstInvalid?.focus()
  return valid
}

// ── Component ─────────────────────────────────────────────────────────────────

export class OJJBookingForm extends BaseElement {
  private _program: Program = 'adult'

  protected render(): void {
    this.innerHTML = `
      <form
        data-booking-form
        novalidate
        class="flex flex-col gap-8"
        aria-label="Free trial class booking"
      >
        ${programToggleHTML()}

        <div data-sections class="flex flex-col gap-8">
          ${adultSectionHTML()}
          ${childrenSectionHTML('little-grapplers')}
          ${childrenSectionHTML('young-athletes')}
        </div>

        ${calendarHTML()}

        <div class="pt-2">
          <button
            type="submit"
            data-submit-btn
            class="w-full bg-brand-accent text-white font-bold text-base py-4 rounded-md
                   hover:bg-red-700 transition-colors
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-brand-accent focus-visible:ring-offset-2
                   focus-visible:ring-offset-neutral-950
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Next Steps →
          </button>
          <p class="text-xs text-neutral-500 text-center mt-3">
            No contract, no commitment — your first class is free.
          </p>
        </div>
      </form>
    `
  }

  protected override bindEvents(): void {
    const form = this.querySelector<HTMLFormElement>('[data-booking-form]')
    if (!form) return

    // Enable JS-enhanced show/hide behavior via CSS
    form.dataset['enhanced'] = ''

    // Activate default program
    this._activateProgram('adult')

    this._bindProgramToggle(form)
    this._bindTrainedToggle(form)
    this._bindAddChild(form)
    this._bindRemoveChild(form)
    this._bindSubmit(form)
  }

  // ── Private behavior ──────────────────────────────────────────────────────

  /** Shows the active program's section; hides the others. */
  private _activateProgram(program: Program): void {
    this._program = program
    const programs: Program[] = ['adult', 'little-grapplers', 'young-athletes']
    programs.forEach((p) => {
      const section = this.querySelector<HTMLElement>(`[data-program-section="${p}"]`)
      if (section) section.hidden = p !== program
    })
  }

  /** Wires the segmented control radio buttons to _activateProgram. */
  private _bindProgramToggle(form: HTMLFormElement): void {
    form.querySelectorAll<HTMLInputElement>('[name="program"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        this._activateProgram(radio.value as Program)
      })
    })
  }

  /**
   * Reveals / hides the "how long have you trained?" sub-field
   * based on the hasTrained radio selection.
   */
  private _bindTrainedToggle(form: HTMLFormElement): void {
    const detail = form.querySelector<HTMLElement>('[data-trained-detail]')
    if (!detail) return

    const update = (): void => {
      const checked = form.querySelector<HTMLInputElement>('[name="hasTrained"]:checked')
      detail.hidden = checked?.value !== 'yes'
    }

    form.querySelectorAll<HTMLInputElement>('[data-trained-radio]').forEach((r) => {
      r.addEventListener('change', update)
    })
  }

  /** Wires "Add another child" buttons. */
  private _bindAddChild(form: HTMLFormElement): void {
    form.querySelectorAll<HTMLButtonElement>('[data-add-child]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const program = btn.dataset['addChild'] as 'little-grapplers' | 'young-athletes'
        this._addChild(program)
      })
    })
  }

  /** Delegates click handling for all "Remove" child buttons. */
  private _bindRemoveChild(form: HTMLFormElement): void {
    form.addEventListener('click', (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-remove-child]')
      if (btn) this._removeChild(btn)
    })
  }

  /** Appends a new child entry row to the given program's list. */
  private _addChild(program: 'little-grapplers' | 'young-athletes'): void {
    const list = this.querySelector<HTMLElement>(`[data-children-list="${program}"]`)
    if (!list) return

    const index = list.querySelectorAll('[data-child-entry]').length

    const wrapper = document.createElement('div')
    wrapper.innerHTML = childEntryHTML(program, index, true)
    const entry = wrapper.firstElementChild
    if (entry) list.appendChild(entry)

    // Focus the first input of the new row
    const firstInput = entry?.querySelector<HTMLInputElement>('input')
    firstInput?.focus()
  }

  /** Removes a child entry row and re-labels the remaining rows. */
  private _removeChild(btn: HTMLButtonElement): void {
    const entry = btn.closest<HTMLElement>('[data-child-entry]')
    if (!entry) return

    const list = entry.parentElement
    entry.remove()

    // Re-number labels so they stay in sync with position
    list?.querySelectorAll<HTMLElement>('[data-child-label]').forEach((label, i) => {
      label.textContent = `Child ${i + 1}`
    })

    // Re-number aria-labels on remove buttons
    list?.querySelectorAll<HTMLButtonElement>('[data-remove-child]').forEach((b, i) => {
      b.setAttribute('aria-label', `Remove child ${i + 2}`)
    })
  }

  private _bindSubmit(form: HTMLFormElement): void {
    form.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault()
      if (this._validate()) {
        this._submit()
      }
    })
  }

  /** Validates the currently active program's section. */
  private _validate(): boolean {
    const section = this.querySelector<HTMLElement>(
      `[data-program-section="${this._program}"]`
    )
    if (!section) return true

    if (this._program === 'adult') {
      return validateAdultSection(section)
    }
    return validateChildrenSection(section)
  }

  private _submit(): void {
    const btn = this.querySelector<HTMLButtonElement>('[data-submit-btn]')
    if (btn) {
      btn.disabled = true
      btn.textContent = 'Redirecting…'
    }
    window.location.href = REDIRECT_URL
  }
}

customElements.define('ojj-booking-form', OJJBookingForm)
