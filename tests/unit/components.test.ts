/**
 * Unit tests for Web Components.
 * Tests render output, attribute reflection, event emission, and cleanup.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'

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
import '@/components/modules/OJJTrialForm'

// ── Helpers ────────────────────────────────────────────────────────────────

function mount<T extends HTMLElement>(tag: string, attrs: Record<string, string> = {}): T {
  const el = document.createElement(tag) as T
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  document.body.appendChild(el)
  return el
}

function unmount(el: HTMLElement): void {
  if (el.isConnected) el.parentElement?.removeChild(el)
}

// ── ojj-icon ──────────────────────────────────────────────────────────────

describe('ojj-icon', () => {
  let el: HTMLElement

  afterEach(() => unmount(el))

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

  afterEach(() => unmount(el))

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

  afterEach(() => unmount(el))

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

  afterEach(() => unmount(el))

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

  afterEach(() => unmount(el))

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

  afterEach(() => unmount(el))

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

  afterEach(() => unmount(el))

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

// ── ojj-trial-form ────────────────────────────────────────────────────────

describe('ojj-trial-form', () => {
  let el: HTMLElement

  afterEach(() => unmount(el))

  it('renders a form element', () => {
    el = mount('ojj-trial-form')
    expect(el.querySelector('form')).toBeTruthy()
  })

  it('has name, email, and phone fields', () => {
    el = mount('ojj-trial-form')
    expect(el.querySelector('[name="name"]')).toBeTruthy()
    expect(el.querySelector('[name="email"]')).toBeTruthy()
    expect(el.querySelector('[name="phone"]')).toBeTruthy()
  })

  it('shows name validation error on empty submit', () => {
    el = mount('ojj-trial-form')
    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    const nameError = el.querySelector('[data-error="name"]')
    expect(nameError?.classList.contains('hidden')).toBe(false)
  })

  it('emits ojj:trial-submit with form data on valid submit', async () => {
    el = mount('ojj-trial-form')
    const handler = vi.fn()
    el.addEventListener('ojj:trial-submit', handler)

    const nameInput = el.querySelector<HTMLInputElement>('[name="name"]')!
    const emailInput = el.querySelector<HTMLInputElement>('[name="email"]')!
    nameInput.value = 'Test User'
    emailInput.value = 'test@example.com'

    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(handler).toHaveBeenCalledTimes(1)
    const detail = handler.mock.calls[0]?.[0].detail
    expect(detail.name).toBe('Test User')
    expect(detail.email).toBe('test@example.com')
  })

  it('shows success state after valid submit', async () => {
    vi.useFakeTimers()
    el = mount('ojj-trial-form')

    const nameInput = el.querySelector<HTMLInputElement>('[name="name"]')!
    const emailInput = el.querySelector<HTMLInputElement>('[name="email"]')!
    nameInput.value = 'Test User'
    emailInput.value = 'test@example.com'

    el.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    vi.advanceTimersByTime(1000)

    const success = el.querySelector('[data-success]')
    expect(success?.classList.contains('hidden')).toBe(false)
    vi.useRealTimers()
  })
})
