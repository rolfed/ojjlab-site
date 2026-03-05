/**
 * AnimatableMixin — factory mixin that adds GSAP animation methods and
 * automatic cleanup to any BaseElement subclass.
 *
 * Usage:
 *   class OJJHero extends AnimatableMixin(BaseElement) { ... }
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type BaseElement } from '../components/base/BaseElement'
import {
  counter,
  heroEntrance,
  marquee,
  parallax,
  pinHorizontal,
  pinnedCardCarousel,
  scrollReveal,
  type AnimationOptions,
} from './animate'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseElementConstructor = abstract new (...args: any[]) => BaseElement

/**
 * Returns a class that extends Base with animation instance methods and
 * automatic cleanup on disconnectedCallback.
 */
export function AnimatableMixin<TBase extends BaseElementConstructor>(Base: TBase) {
  abstract class Animatable extends Base {
    private _tweens: gsap.core.Tween[] = []
    private _killables: Array<{ kill(): void }> = []

    /** Register any killable (e.g. a ScrollTrigger instance) for cleanup. Null-safe. */
    protected trackKillable(k: { kill(): void } | null): void {
      if (k) this._killables.push(k)
    }

    /** Register a tween for cleanup. Null-safe — pass the return value of any executor. */
    protected trackTween(tween: gsap.core.Tween | null): gsap.core.Tween | null {
      if (tween) this._tweens.push(tween)
      return tween
    }

    /**
     * Capture all ScrollTriggers created since `beforeCount` and store them
     * for cleanup. Call with `ScrollTrigger.getAll().length` before the tween,
     * then pass the result here along with the returned tween.
     */
    protected trackScrollingTween(
      tween: gsap.core.Tween | null,
      beforeCount: number
    ): gsap.core.Tween | null {
      if (!tween) return null
      this._tweens.push(tween)
      // Any ScrollTriggers created after beforeCount belong to this tween
      const all = ScrollTrigger.getAll()
      all.slice(beforeCount).forEach((st) => this._tweens.push(st as unknown as gsap.core.Tween))
      return tween
    }

    // ── Executor wrappers ──────────────────────────────────────────────────

    protected scrollReveal(
      target: Element | Element[] | NodeListOf<Element>,
      presetKey: 'fadeUp' | 'fadeIn' | 'stagger',
      opts?: AnimationOptions
    ): gsap.core.Tween | null {
      return this.trackTween(scrollReveal(target, presetKey, opts))
    }

    protected heroEntrance(
      targets: (Element | null)[],
      opts?: AnimationOptions
    ): gsap.core.Tween | null {
      return this.trackTween(heroEntrance(targets, opts))
    }

    protected parallax(
      target: Element | null,
      opts?: AnimationOptions
    ): gsap.core.Tween | null {
      const before = ScrollTrigger.getAll().length
      return this.trackScrollingTween(parallax(target, opts), before)
    }

    protected pinHorizontal(
      container: Element | null,
      track: Element | null,
      opts?: AnimationOptions
    ): gsap.core.Tween | null {
      const before = ScrollTrigger.getAll().length
      return this.trackScrollingTween(pinHorizontal(container, track, opts), before)
    }

    protected marquee(track: Element | null, opts?: AnimationOptions): gsap.core.Tween | null {
      return this.trackTween(marquee(track, opts))
    }

    protected counter(
      target: Element | null,
      endValue: number,
      opts?: AnimationOptions
    ): gsap.core.Tween | null {
      return this.trackTween(counter(target, endValue, opts))
    }

    protected pinnedCardCarousel(
      container: Element | null,
      track: Element | null,
      heading: Element | null,
      sub: Element | null,
      cards: Element[]
    ): void {
      this.trackKillable(pinnedCardCarousel(container, track, heading, sub, cards))
    }

    // ── Cleanup ────────────────────────────────────────────────────────────

    protected override cleanup(): void {
      // Kill ScrollTriggers and other killables first
      this._killables.forEach((k) => k.kill())
      this._killables = []

      // Kill tweens (and any ScrollTriggers stored as tweens via trackScrollingTween)
      this._tweens.forEach((t) => {
        if (t && typeof t.kill === 'function') t.kill()
      })
      this._tweens = []

      super.cleanup()
    }
  }

  return Animatable
}
