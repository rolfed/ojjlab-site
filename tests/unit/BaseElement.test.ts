import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BaseElement } from '@/components/base/BaseElement'

// Concrete subclass for testing — BaseElement is abstract
class TestElement extends BaseElement {
  public renderCalled = false
  public bindEventsCalled = false
  public cleanupCalled = false

  protected render(): void {
    this.renderCalled = true
  }

  protected override bindEvents(): void {
    this.bindEventsCalled = true
  }

  protected override cleanup(): void {
    this.cleanupCalled = true
  }

  // Expose emit for testing
  public testEmit(eventName: string, detail?: unknown): void {
    this.emit(eventName, detail)
  }
}

customElements.define('test-base-element', TestElement)

describe('BaseElement', () => {
  let el: TestElement

  beforeEach(() => {
    el = document.createElement('test-base-element') as TestElement
  })

  afterEach(() => {
    if (el.isConnected) {
      document.body.removeChild(el)
    }
  })

  describe('lifecycle', () => {
    it('calls render() when connected to the DOM', () => {
      document.body.appendChild(el)
      expect(el.renderCalled).toBe(true)
    })

    it('calls bindEvents() when connected to the DOM', () => {
      document.body.appendChild(el)
      expect(el.bindEventsCalled).toBe(true)
    })

    it('calls cleanup() when disconnected from the DOM', () => {
      document.body.appendChild(el)
      document.body.removeChild(el)
      expect(el.cleanupCalled).toBe(true)
    })

    it('does not call render() before connecting', () => {
      expect(el.renderCalled).toBe(false)
    })
  })

  describe('reducedMotion', () => {
    it('is a boolean', () => {
      expect(typeof el.reducedMotion).toBe('boolean')
    })

    it('reflects the prefers-reduced-motion media query', () => {
      // happy-dom returns false by default for prefers-reduced-motion
      expect(el.reducedMotion).toBe(false)
    })
  })

  describe('emit()', () => {
    it('dispatches a custom event with the ojj: namespace prefix', () => {
      document.body.appendChild(el)
      const handler = vi.fn()
      document.addEventListener('ojj:test-event', handler)

      el.testEmit('test-event')

      expect(handler).toHaveBeenCalledTimes(1)
      document.removeEventListener('ojj:test-event', handler)
    })

    it('passes detail to the event', () => {
      document.body.appendChild(el)
      const handler = vi.fn()
      document.addEventListener('ojj:detail-event', handler)

      el.testEmit('detail-event', { value: 42, label: 'test' })

      expect((handler.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ value: 42, label: 'test' })
      document.removeEventListener('ojj:detail-event', handler)
    })

    it('emits events that bubble', () => {
      document.body.appendChild(el)
      const parentHandler = vi.fn()
      document.body.addEventListener('ojj:bubble-event', parentHandler)

      el.testEmit('bubble-event')

      expect(parentHandler).toHaveBeenCalledTimes(1)
      document.body.removeEventListener('ojj:bubble-event', parentHandler)
    })

    it('sets detail to null when no detail is provided', () => {
      document.body.appendChild(el)
      const handler = vi.fn()
      document.addEventListener('ojj:no-detail', handler)

      el.testEmit('no-detail')

      expect((handler.mock.calls[0]?.[0] as CustomEvent).detail).toBeNull()
      document.removeEventListener('ojj:no-detail', handler)
    })
  })
})
