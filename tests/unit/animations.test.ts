/**
 * Unit tests for the animation API.
 * GSAP and ScrollTrigger are mocked — we test call patterns and return shapes,
 * not actual DOM animation.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'

// ── GSAP mock ──────────────────────────────────────────────────────────────

const mockScrollTrigger = { kill: vi.fn() }

const mockTimeline = {
  kill: vi.fn(),
  to: vi.fn().mockReturnThis(),
  scrollTrigger: mockScrollTrigger,
}

const mockTween = {
  kill: vi.fn(),
  vars: { scrollTrigger: {} },
  pause: vi.fn(),
  play: vi.fn(),
  scrollTrigger: mockScrollTrigger,
}

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    config: vi.fn(),
    fromTo: vi.fn(() => mockTween),
    to: vi.fn(() => mockTween),
    set: vi.fn(),
    timeline: vi.fn(() => mockTimeline),
    utils: {
      unitize: vi.fn((fn: (x: number) => number) => fn),
      clamp: vi.fn((min: number, max: number, val: number) => Math.min(max, Math.max(min, val))),
    },
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
    getById: vi.fn(() => null),
  },
}))

// ── Import after mocks ─────────────────────────────────────────────────────

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  initAnimations,
  scrollReveal,
  heroEntrance,
  parallax,
  pinHorizontal,
  pinnedReveal,
  programsReveal,
  marquee,
  counter,
  isMobile,
} from '@/animations/animate'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('initAnimations()', () => {
  it('registers the ScrollTrigger plugin', () => {
    initAnimations()
    expect(gsap.registerPlugin).toHaveBeenCalledWith(ScrollTrigger)
  })

  it('sets reducedMotion config', () => {
    initAnimations()
    expect(gsap.config).toHaveBeenCalled()
  })
})

describe('isMobile()', () => {
  it('returns false when window.matchMedia returns false', () => {
    // happy-dom default matchMedia returns false for all queries
    expect(typeof isMobile()).toBe('boolean')
  })
})

describe('scrollReveal()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns a tween for fadeUp preset', () => {
    const el = makeEl()
    const result = scrollReveal(el, 'fadeUp')
    expect(gsap.fromTo).toHaveBeenCalled()
    expect(result).toBe(mockTween)
  })

  it('returns a tween for fadeIn preset', () => {
    const el = makeEl()
    const result = scrollReveal(el, 'fadeIn')
    expect(result).toBe(mockTween)
  })

  it('returns a tween for stagger preset with array of elements', () => {
    const els = [makeEl(), makeEl()]
    const result = scrollReveal(els, 'stagger')
    expect(gsap.fromTo).toHaveBeenCalled()
    expect(result).toBe(mockTween)
  })

  it('returns null for empty array', () => {
    const result = scrollReveal([], 'fadeUp')
    expect(result).toBeNull()
  })

  it('passes custom duration to GSAP', () => {
    const el = makeEl()
    scrollReveal(el, 'fadeUp', { duration: 1.2 })
    const call = vi.mocked(gsap.fromTo).mock.calls[0]
    expect((call?.[2] as gsap.TweenVars)?.duration).toBe(1.2)
  })
})

describe('heroEntrance()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns a tween', () => {
    const el = makeEl()
    const result = heroEntrance([el])
    expect(gsap.fromTo).toHaveBeenCalled()
    expect(result).toBe(mockTween)
  })

  it('filters out null targets', () => {
    const el = makeEl()
    const result = heroEntrance([null, el, null])
    expect(gsap.fromTo).toHaveBeenCalled()
    expect(result).toBe(mockTween)
  })

  it('returns null when all targets are null', () => {
    const result = heroEntrance([null, null])
    expect(result).toBeNull()
  })
})

describe('parallax()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns null for null target', () => {
    const result = parallax(null)
    expect(result).toBeNull()
  })

  it('returns null on mobile viewports', () => {
    // Override matchMedia to simulate mobile
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const el = makeEl()
    const result = parallax(el)
    expect(result).toBeNull()
    window.matchMedia = original
  })

  it('returns a tween on desktop (> 767px)', () => {
    // Default happy-dom matchMedia returns matches: false → desktop
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const el = makeEl()
    const result = parallax(el)
    expect(result).toBe(mockTween)
  })
})

describe('pinHorizontal()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns null on mobile viewports', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const container = makeEl()
    const track = makeEl()
    const result = pinHorizontal(container, track)
    expect(result).toBeNull()
  })

  it('returns null for null container', () => {
    expect(pinHorizontal(null, makeEl())).toBeNull()
  })

  it('returns null for null track', () => {
    expect(pinHorizontal(makeEl(), null)).toBeNull()
  })

  it('calls gsap.to on desktop', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const container = makeEl()
    const track = makeEl()
    const result = pinHorizontal(container, track)
    expect(gsap.to).toHaveBeenCalled()
    expect(result).toBe(mockTween)
  })
})

describe('marquee()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns null for null track', () => {
    expect(marquee(null)).toBeNull()
  })

  it('returns a tween for a valid track element', () => {
    const el = makeEl()
    // Need a parent for event listeners
    const wrapper = document.createElement('div')
    wrapper.appendChild(el)
    document.body.appendChild(wrapper)
    const result = marquee(el)
    expect(gsap.to).toHaveBeenCalled()
    expect(result).toBe(mockTween)
  })
})

describe('counter()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns null for null target', () => {
    expect(counter(null, 100)).toBeNull()
  })

  it('calls gsap.to with a proxy object', () => {
    const el = makeEl()
    counter(el, 42)
    expect(gsap.to).toHaveBeenCalled()
    const toArgs = vi.mocked(gsap.to).mock.calls[0]
    // First arg is the proxy object {value: 0}
    expect(typeof toArgs?.[0]).toBe('object')
    expect((toArgs?.[0] as { value: number }).value).toBe(0)
    // Second arg includes endValue
    expect((toArgs?.[1] as gsap.TweenVars)?.value).toBe(42)
  })
})

describe('pinnedReveal()', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns null on mobile', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const result = pinnedReveal({ trigger: makeEl(), heading: makeEl(), track: makeEl() })
    expect(result).toBeNull()
  })

  it('returns null when data-reduce-motion is set on <html>', () => {
    document.documentElement.setAttribute('data-reduce-motion', '')
    const result = pinnedReveal({ trigger: makeEl(), heading: makeEl(), track: makeEl() })
    document.documentElement.removeAttribute('data-reduce-motion')
    expect(result).toBeNull()
  })

  it('calls gsap.timeline on desktop', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    pinnedReveal({ trigger: makeEl(), heading: makeEl(), track: makeEl() })
    expect(gsap.timeline).toHaveBeenCalled()
  })

  it('returns the timeline (not the ScrollTrigger)', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const result = pinnedReveal({ trigger: makeEl(), heading: makeEl(), track: makeEl() })
    expect(result).toBe(mockTimeline)
  })

  it('works when sub is null', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const result = pinnedReveal({ trigger: makeEl(), heading: makeEl(), track: makeEl(), sub: null })
    expect(result).toBe(mockTimeline)
  })

  it('calls gsap.set with clearProps on heading and sub when data-reduce-motion is set', () => {
    const heading = makeEl()
    const sub = makeEl()
    document.documentElement.setAttribute('data-reduce-motion', '')
    pinnedReveal({ trigger: makeEl(), heading, sub, track: makeEl() })
    document.documentElement.removeAttribute('data-reduce-motion')
    expect(gsap.set).toHaveBeenCalledWith(heading, { clearProps: 'all' })
    expect(gsap.set).toHaveBeenCalledWith(sub, { clearProps: 'all' })
  })

  it('passes a lazy function for track x translation', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    pinnedReveal({ trigger: makeEl(), heading: makeEl(), track: makeEl(), sub: null })
    const calls = vi.mocked(mockTimeline.to).mock.calls
    const hasLazyX = calls.some((call) => typeof (call[1] as gsap.TweenVars).x === 'function')
    expect(hasLazyX).toBe(true)
  })
})

describe('programsReveal()', () => {
  afterEach(() => { vi.clearAllMocks() })

  function makeConfig() {
    return {
      trigger: makeEl(),
      headingWrap: makeEl(),
      track: makeEl(),
      cards: [makeEl(), makeEl(), makeEl()],
    }
  }

  it('returns null on mobile', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const result = programsReveal(makeConfig())
    expect(result).toBeNull()
  })

  it('returns null when data-reduce-motion is set on <html>', () => {
    document.documentElement.setAttribute('data-reduce-motion', '')
    const result = programsReveal(makeConfig())
    document.documentElement.removeAttribute('data-reduce-motion')
    expect(result).toBeNull()
  })

  it('calls gsap.timeline on desktop', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    programsReveal(makeConfig())
    expect(gsap.timeline).toHaveBeenCalled()
  })

  it('returns the timeline (not null)', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const result = programsReveal(makeConfig())
    expect(result).toBe(mockTimeline)
  })

  it('calls gsap.set with clearProps on headingWrap when data-reduce-motion is set', () => {
    const headingWrap = makeEl()
    document.documentElement.setAttribute('data-reduce-motion', '')
    programsReveal({ trigger: makeEl(), headingWrap, track: makeEl(), cards: [makeEl()] })
    document.documentElement.removeAttribute('data-reduce-motion')
    expect(gsap.set).toHaveBeenCalledWith(headingWrap, { clearProps: 'all' })
  })
})

// ── PRESETS shape test ─────────────────────────────────────────────────────

import { PRESETS, type PresetKey } from '@/animations/presets'

describe('PRESETS', () => {
  const keys: PresetKey[] = ['fadeUp', 'fadeIn', 'stagger', 'parallax', 'counter', 'horizontalPin']

  keys.forEach((key) => {
    it(`${key} has a vars object`, () => {
      expect(PRESETS[key].vars).toBeDefined()
      expect(typeof PRESETS[key].vars).toBe('object')
    })
  })

  it('fadeUp starts at opacity 0 and y 40', () => {
    expect(PRESETS.fadeUp.vars).toMatchObject({ opacity: 0, y: 40 })
  })

  it('fadeIn starts at opacity 0', () => {
    expect(PRESETS.fadeIn.vars).toMatchObject({ opacity: 0 })
  })

  it('stagger has once: true scrollTrigger default', () => {
    expect(PRESETS.stagger.scrollTrigger?.once).toBe(true)
  })

  it('parallax has scrub default', () => {
    expect(PRESETS.parallax.scrollTrigger?.scrub).toBeDefined()
  })

  it('counter has 1.5s duration', () => {
    expect(PRESETS.counter.defaults?.duration).toBe(1.5)
  })
})
