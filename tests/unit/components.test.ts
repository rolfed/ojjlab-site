/**
 * Unit tests for Web Components.
 * Tests render output, attribute reflection, event emission, and cleanup.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

vi.mock('@/service/forms', () => ({
  submitFreeTrial: vi.fn().mockResolvedValue(undefined),
}))

import { submitFreeTrial } from '@/service/forms'

// Mock GSAP before component imports
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    config: vi.fn(),
    fromTo: vi.fn(() => ({ kill: vi.fn(), vars: {} })),
    to: vi.fn(() => ({ kill: vi.fn(), vars: {} })),
    utils: { unitize: vi.fn((fn: (x: number) => number) => fn) },
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
    getById: vi.fn(() => null),
  },
}))

// ── Register components ────────────────────────────────────────────────────
// Import each component module to trigger customElements.define()

import '@/components/primitives/OJJIcon'
import '@/components/primitives/OJJButton'
import '@/components/primitives/OJJBadge'
import '@/components/layout/OJJSiteFooter'
import '@/components/modules/OJJMarquee'
import '@/components/modules/OJJStatsBar'
import '@/components/modules/OJJTestimonial'
import '@/components/modules/OJJReviewCard'
import '@/components/modules/OJJTrialForm'

// ── Helpers ────────────────────────────────────────────────────────────────

function mount(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement(tag)
  Object.entries(attrs).forEach(([k, v]) => { el.setAttribute(k, v); })
  document.body.appendChild(el)
  return el
}

function unmount(el: HTMLElement): void {
  if (el.isConnected) el.parentElement?.removeChild(el)
}

// ── ojj-icon ──────────────────────────────────────────────────────────────

describe('ojj-icon', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('renders an SVG element', () => {
    el = mount('ojj-icon', { name: 'menu' })
    expect(el.querySelector('svg')).toBeTruthy()
  })

  it('sets aria-hidden when no label attribute', () => {
    el = mount('ojj-icon', { name: 'menu' })
    const svg = el.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('sets aria-label and role="img" when label is present', () => {
    el = mount('ojj-icon', { name: 'menu', label: 'Open menu' })
    const svg = el.querySelector('svg')
    expect(svg?.getAttribute('aria-label')).toBe('Open menu')
    expect(svg?.getAttribute('role')).toBe('img')
  })

  it('uses provided size attribute', () => {
    el = mount('ojj-icon', { name: 'close', size: '32' })
    const svg = el.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
  })

  it('defaults to size 24', () => {
    el = mount('ojj-icon', { name: 'close' })
    const svg = el.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
  })

  it('re-renders when name attribute changes', () => {
    el = mount('ojj-icon', { name: 'menu' })
    el.setAttribute('name', 'close')
    const svg = el.querySelector('svg')
    expect(svg).toBeTruthy()
  })
})

// ── ojj-badge ─────────────────────────────────────────────────────────────

describe('ojj-badge', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('renders a span with badge content', () => {
    el = mount('ojj-badge')
    el.textContent = 'Blue Belt'
    document.body.appendChild(el)
    expect(el.querySelector('span')).toBeTruthy()
  })

  it('applies accent class by default', () => {
    el = mount('ojj-badge')
    const span = el.querySelector('span')
    expect(span?.className).toContain('bg-brand-accent')
  })

  it('applies gold class for gold color', () => {
    el = mount('ojj-badge', { color: 'gold' })
    const span = el.querySelector('span')
    expect(span?.className).toContain('bg-brand-gold')
  })
})

// ── ojj-button ────────────────────────────────────────────────────────────

describe('ojj-button', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('renders a <button> when no href', () => {
    el = mount('ojj-button')
    expect(el.querySelector('button')).toBeTruthy()
    expect(el.querySelector('a')).toBeFalsy()
  })

  it('renders an <a> when href is set', () => {
    el = mount('ojj-button', { href: '/schedule/' })
    expect(el.querySelector('a')).toBeTruthy()
    expect(el.querySelector('button')).toBeFalsy()
  })

  it('sets disabled attribute on button when disabled', () => {
    el = mount('ojj-button')
    el.setAttribute('disabled', '')
    const btn = el.querySelector('button')
    expect(btn?.disabled).toBe(true)
  })

  it('emits ojj:button-click on click', () => {
    el = mount('ojj-button')
    const handler = vi.fn()
    el.addEventListener('ojj:button-click', handler)
    el.querySelector('button')?.click()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not emit click when disabled', () => {
    el = mount('ojj-button')
    el.setAttribute('disabled', '')
    const handler = vi.fn()
    el.addEventListener('ojj:button-click', handler)
    el.querySelector('button')?.click()
    expect(handler).not.toHaveBeenCalled()
  })

  it('applies secondary variant class', () => {
    el = mount('ojj-button', { variant: 'secondary' })
    const btn = el.querySelector('button')
    expect(btn?.className).toContain('border-brand-accent')
  })
})

// ── ojj-site-footer ───────────────────────────────────────────────────────

describe('ojj-site-footer', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('renders a footer element', () => {
    el = mount('ojj-site-footer')
    expect(el.querySelector('footer')).toBeTruthy()
  })

  it('has role="contentinfo"', () => {
    el = mount('ojj-site-footer')
    const footer = el.querySelector('footer')
    expect(footer?.getAttribute('role')).toBe('contentinfo')
  })

  it('renders the current year', () => {
    el = mount('ojj-site-footer')
    const year = new Date().getFullYear().toString()
    expect(el.textContent).toContain(year)
  })
})

// ── ojj-marquee ───────────────────────────────────────────────────────────

describe('ojj-marquee', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('renders a track element', () => {
    el = mount('ojj-marquee')
    expect(el.querySelector('[data-track]')).toBeTruthy()
  })

  it('duplicates content for seamless loop', () => {
    el = mount('ojj-marquee')
    const spans = el.querySelectorAll('[data-track] span')
    expect(spans.length).toBe(2)
  })

  it('second span is aria-hidden', () => {
    el = mount('ojj-marquee')
    const spans = el.querySelectorAll('[data-track] span')
    expect(spans[1]?.getAttribute('aria-hidden')).toBe('true')
  })
})

// ── ojj-stats-bar ─────────────────────────────────────────────────────────

describe('ojj-stats-bar', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('renders 3 stat items by default', () => {
    el = mount('ojj-stats-bar')
    const stats = el.querySelectorAll('[data-stat]')
    expect(stats.length).toBe(3)
  })

  it('renders counter elements', () => {
    el = mount('ojj-stats-bar')
    const counters = el.querySelectorAll('[data-counter]')
    expect(counters.length).toBe(3)
  })

  it('renders custom stats from JSON attribute', () => {
    const stats = JSON.stringify([{ value: 99, label: 'Test Stat' }])
    el = mount('ojj-stats-bar', { stats })
    const items = el.querySelectorAll('[data-stat]')
    expect(items.length).toBe(1)
    expect(el.textContent).toContain('Test Stat')
  })
})

// ── ojj-testimonial ───────────────────────────────────────────────────────

describe('ojj-testimonial', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('uses Shadow DOM', () => {
    el = mount('ojj-testimonial', {
      quote: 'Great gym!',
      author: 'John',
      belt: 'Blue Belt',
    })
    expect(el.shadowRoot).toBeTruthy()
  })

  it('renders the quote in the shadow root', () => {
    el = mount('ojj-testimonial', { quote: 'Amazing experience!', author: 'Jane' })
    expect(el.shadowRoot?.textContent).toContain('Amazing experience!')
  })

  it('renders the author name', () => {
    el = mount('ojj-testimonial', { quote: 'Test', author: 'Sam Lee' })
    expect(el.shadowRoot?.textContent).toContain('Sam Lee')
  })
})

// ── ojj-review-card ───────────────────────────────────────────────────────

describe('ojj-review-card', () => {
  let el: HTMLElement

  afterEach(() => { unmount(el); })

  it('uses Shadow DOM', () => {
    el = mount('ojj-review-card', { author: 'Jane Doe', rating: '5', text: 'Great gym!' })
    expect(el.shadowRoot).toBeTruthy()
  })

  it('renders 5 filled stars for rating="5"', () => {
    el = mount('ojj-review-card', { author: 'Jane Doe', rating: '5', text: 'Great!' })
    const stars = el.shadowRoot?.querySelectorAll('.star.filled')
    expect(stars?.length).toBe(5)
  })

  it('renders correct filled star count for rating="3"', () => {
    el = mount('ojj-review-card', { author: 'Jane Doe', rating: '3', text: 'Okay.' })
    const filled = el.shadowRoot?.querySelectorAll('.star.filled')
    const empty = el.shadowRoot?.querySelectorAll('.star:not(.filled)')
    expect(filled?.length).toBe(3)
    expect(empty?.length).toBe(2)
  })

  it('renders the review text', () => {
    el = mount('ojj-review-card', { author: 'Jane Doe', text: 'Absolutely fantastic!' })
    expect(el.shadowRoot?.textContent).toContain('Absolutely fantastic!')
  })

  it('renders the author name', () => {
    el = mount('ojj-review-card', { author: 'John Smith', text: 'Great.' })
    expect(el.shadowRoot?.textContent).toContain('John Smith')
  })

  it('renders the date', () => {
    el = mount('ojj-review-card', { author: 'Jane', text: 'Good.', date: '3 months ago' })
    expect(el.shadowRoot?.textContent).toContain('3 months ago')
  })

  it('shows Google badge', () => {
    el = mount('ojj-review-card', { author: 'Jane', text: 'Good.' })
    expect(el.shadowRoot?.textContent).toContain('Google')
  })

  it('shows read-more link when truncated attribute is present', () => {
    el = mount('ojj-review-card', { author: 'Jane', text: 'Good.' })
    el.setAttribute('truncated', '')
    const link = el.shadowRoot?.querySelector('.read-more')
    expect(link).toBeTruthy()
  })

  it('hides read-more link when truncated attribute is absent', () => {
    el = mount('ojj-review-card', { author: 'Jane', text: 'Good.' })
    const link = el.shadowRoot?.querySelector('.read-more')
    expect(link).toBeFalsy()
  })

  it('renders nothing in blockquote when text is empty', () => {
    el = mount('ojj-review-card', { author: 'Jane' })
    const blockquote = el.shadowRoot?.querySelector('blockquote')
    expect(blockquote).toBeFalsy()
  })

  it('star rating aria-label reflects the rating value', () => {
    el = mount('ojj-review-card', { author: 'Jane', rating: '4', text: 'Good.' })
    const starsEl = el.shadowRoot?.querySelector('.stars')
    expect(starsEl?.getAttribute('aria-label')).toBe('4 out of 5 stars')
  })
})

// ── ojj-trial-form ────────────────────────────────────────────────────────

describe('ojj-trial-form', () => {
  let el: HTMLElement

  beforeEach(() => vi.clearAllMocks())
  afterEach(() => { unmount(el); })

  it('renders a form element', () => {
    el = mount('ojj-trial-form')
    expect(el.querySelector('form')).toBeTruthy()
  })

  it('has firstName, lastName, email, and phone fields', () => {
    el = mount('ojj-trial-form')
    expect(el.querySelector('[name="firstName"]')).toBeTruthy()
    expect(el.querySelector('[name="lastName"]')).toBeTruthy()
    expect(el.querySelector('[name="email"]')).toBeTruthy()
    expect(el.querySelector('[name="phone"]')).toBeTruthy()
  })

  it('shows firstName validation error on empty submit', () => {
    el = mount('ojj-trial-form')
    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    const firstError = el.querySelector('[data-error="firstName"]')
    expect(firstError?.classList.contains('hidden')).toBe(false)
  })

  it('shows lastName validation error when only firstName is filled', () => {
    el = mount('ojj-trial-form')
    const firstNameInput = el.querySelector<HTMLInputElement>('[name="firstName"]')
    expect(firstNameInput).toBeDefined()
    if (!firstNameInput) return
    firstNameInput.value = 'Jane'
    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    const lastError = el.querySelector('[data-error="lastName"]')
    expect(lastError?.classList.contains('hidden')).toBe(false)
  })

  it('emits ojj:trial-submit with firstName, lastName, email on valid submit', () => {
    el = mount('ojj-trial-form')
    const handler = vi.fn()
    el.addEventListener('ojj:trial-submit', handler)

    const firstNameInput = el.querySelector<HTMLInputElement>('[name="firstName"]')
    const lastNameInput = el.querySelector<HTMLInputElement>('[name="lastName"]')
    const emailInput = el.querySelector<HTMLInputElement>('[name="email"]')
    expect(firstNameInput).toBeDefined()
    expect(lastNameInput).toBeDefined()
    expect(emailInput).toBeDefined()
    if (!firstNameInput || !lastNameInput || !emailInput) return
    firstNameInput.value = 'Jane'
    lastNameInput.value = 'Smith'
    emailInput.value = 'jane@example.com'

    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(handler).toHaveBeenCalledTimes(1)
    const detail = (handler.mock.calls[0]?.[0] as CustomEvent).detail as Record<string, string>
    expect(detail['firstName']).toBe('Jane')
    expect(detail['lastName']).toBe('Smith')
    expect(detail['email']).toBe('jane@example.com')
  })

  it('calls submitFreeTrial with FormData on valid submit', () => {
    el = mount('ojj-trial-form')

    const firstNameInput = el.querySelector<HTMLInputElement>('[name="firstName"]')
    const lastNameInput = el.querySelector<HTMLInputElement>('[name="lastName"]')
    const emailInput = el.querySelector<HTMLInputElement>('[name="email"]')
    expect(firstNameInput).toBeDefined()
    expect(lastNameInput).toBeDefined()
    expect(emailInput).toBeDefined()
    if (!firstNameInput || !lastNameInput || !emailInput) return
    firstNameInput.value = 'Jane'
    lastNameInput.value = 'Smith'
    emailInput.value = 'jane@example.com'

    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(submitFreeTrial).toHaveBeenCalledTimes(1)
    expect(submitFreeTrial).toHaveBeenCalledWith(expect.any(FormData))
  })

  it('disables submit button while submitting', () => {
    el = mount('ojj-trial-form')

    const firstNameInput = el.querySelector<HTMLInputElement>('[name="firstName"]')
    const lastNameInput = el.querySelector<HTMLInputElement>('[name="lastName"]')
    const emailInput = el.querySelector<HTMLInputElement>('[name="email"]')
    expect(firstNameInput).toBeDefined()
    expect(lastNameInput).toBeDefined()
    expect(emailInput).toBeDefined()
    if (!firstNameInput || !lastNameInput || !emailInput) return
    firstNameInput.value = 'Jane'
    lastNameInput.value = 'Smith'
    emailInput.value = 'jane@example.com'

    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    const btn = el.querySelector<HTMLButtonElement>('[data-submit-btn]')
    expect(btn?.disabled).toBe(true)
    expect(btn?.textContent).toBe('Submitting…')
  })
})
