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
  pinnedReveal as pinnedRevealExecutor,
  scrollReveal,
  type AnimationOptions,
  type PinnedRevealConfig,
} from './animate'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseElementConstructor = abstract new (...args: any[]) => BaseElement

// Utility type used as the declared return type of AnimatableMixin.
// Only lists the protected executor wrappers that subclasses call via `this.x()`.
// trackTween / trackScrollingTween are intentionally omitted — they are protected
// internal helpers and cannot appear in a structural interface type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatableConstructor<TBase extends BaseElementConstructor> = TBase & (abstract new (...args: any[]) => {
  scrollReveal(target: Element | Element[] | NodeListOf<Element>, presetKey: 'fadeUp' | 'fadeIn' | 'stagger', opts?: AnimationOptions): gsap.core.Tween | null
  heroEntrance(targets: (Element | null)[], opts?: AnimationOptions): gsap.core.Tween | null
  parallax(target: Element | null, opts?: AnimationOptions): gsap.core.Tween | null
  pinHorizontal(container: Element | null, track: Element | null, opts?: AnimationOptions): gsap.core.Tween | null
  pinnedReveal(config: PinnedRevealConfig): gsap.core.Timeline | null
  marquee(track: Element | null, opts?: AnimationOptions): gsap.core.Tween | null
  counter(target: Element | null, endValue: number, opts?: AnimationOptions): gsap.core.Tween | null
})

/**
 * Returns a class that extends Base with animation instance methods and
 * automatic cleanup on disconnectedCallback.
 */
export function AnimatableMixin<TBase extends BaseElementConstructor>(Base: TBase): AnimatableConstructor<TBase> {
  abstract class Animatable extends Base {
    private _tweens: gsap.core.Tween[] = []
    /** Snapshot of ScrollTrigger count before an animation call, for tracking new ones. */

    /** Register a tween for cleanup. Null-safe — pass the return value of any executor. */
    protected trackTween(tween: gsap.core.Tween | null): gsap.core.Tween | null {
      if (tween) { this._tweens.push(tween) }
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
      if (!tween) { return null }
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

    protected pinnedReveal(config: PinnedRevealConfig): gsap.core.Timeline | null {
      const tl = pinnedRevealExecutor(config)
      // Track the Timeline (not just the ScrollTrigger) so that kill() on
      // disconnect also kills the timeline's child tweens.
      if (tl) { this.trackTween(tl as unknown as gsap.core.Tween) }
      return tl
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

    // ── Cleanup ────────────────────────────────────────────────────────────

    protected override cleanup(): void {
      // Kill everything registered (tweens + any ScrollTriggers stored as tweens)
      this._tweens.forEach((t) => { void t.kill() })
      this._tweens = []

      super.cleanup()
    }
  }

  return Animatable as unknown as AnimatableConstructor<TBase>
}
