/**
 * ojj-programs-section — Infinite carousel of program cards.
 *
 * Motion-enabled (all viewports): GSAP-driven infinite carousel with pill navigation,
 * swipe support, and scale/opacity depth effect.
 *
 * Reduced-motion (data-reduce-motion on <html>): static vertical grid with
 * staggered scroll-reveal via AnimatableMixin.
 *
 * Infinite loop uses CLONES_PER_SIDE clones prepended and appended so that
 * there are always partial cards fading out at both edges. On wrap, GSAP
 * onComplete silently jumps the track to the real card position.
 *
 * Auto-rotate: starts when the section scrolls into view (IntersectionObserver),
 * pauses on mouseenter, resumes on mouseleave. Stops permanently once the user
 * manually navigates (swipe or pill click) so it never fights intentional input.
 *
 * Track layout with CLONES_PER_SIDE=2 (N=6 programs):
 *   [clone4, clone5 | card0 … card5 | clone0, clone1]
 *   DOM:  0       1      2      7       8       9
 *   Logical: -2    -1     0      5       6       7
 *
 * Depth effect by DOM distance from active DOM index (active + CLONES_PER_SIDE):
 *   dist 0 → scale 1.0, opacity 1.0   (center)
 *   dist 1 → scale 0.85, opacity 0.6  (adjacent — fully visible)
 *   dist 2 → scale 0.70, opacity 0.3  (far — sliver at viewport edge)
 *   dist ≥3 → scale 0.60, opacity 0   (off-screen, invisible)
 */

import gsap from 'gsap'
import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

const PROGRAMS = [
  {
    title: 'Little Grapplers',
    badge: 'Ages 5–10',
    description:
      'Playful, structured BJJ for younger kids. We focus on motor skills, listening, and core grappling concepts through games and age-appropriate drilling in a safe, encouraging environment.',
    ctaHref: '/programs/#youth-little',
    accentColor: '#0f3460',
  },
  {
    title: 'Youth BJJ',
    badge: 'Ages 10–15',
    description:
      'Serious BJJ fundamentals for tweens and teens. Students learn takedowns, guard work, and submissions while building confidence, discipline, and self-defense skills.',
    ctaHref: '/programs/#youth-juniors',
    accentColor: '#0a2444',
  },
  {
    title: 'Jiu Jitsu 101',
    badge: 'Beginners',
    description:
      'New to BJJ? Start here. Jiu Jitsu 101 covers the fundamental positions, movements, and submissions in a welcoming, no-pressure environment. No experience required.',
    ctaHref: '/programs/#101',
    accentColor: '#1a1a2e',
  },
  {
    title: 'Adult Jiu Jitsu',
    badge: 'Adults',
    description:
      'Comprehensive BJJ curriculum for adults of all experience levels. Learn takedowns, guard passing, submissions, and live rolling in a structured, supportive environment.',
    ctaHref: '/programs/#adult',
    accentColor: '#2d1b4e',
  },
  {
    title: 'Competition Team',
    badge: 'Competition',
    description:
      'Intensive training for athletes who want to compete. Covers tournament strategy, advanced techniques, and match preparation under experienced coaching.',
    ctaHref: '/programs/#competition',
    accentColor: '#4a0e0e',
  },
  {
    title: 'Kickboxing',
    badge: 'Striking',
    description:
      'Stand-up striking program covering punches, kicks, knees, and elbows. Build cardio, coordination, and real self-defense skills in a high-energy class for all levels.',
    ctaHref: '/programs/#kickboxing',
    accentColor: '#1a2e0e',
  },
]

/** Number of clones prepended AND appended. Must be ≥ 1. */
const CLONES_PER_SIDE = 2

const ACTIVE_PILL = 'px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white transition-colors'
const INACTIVE_PILL = 'px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-neutral-300 hover:bg-white/20 transition-colors'

/** Interval between auto-advance steps (ms). */
const AUTO_ROTATE_INTERVAL = 4000

export class OJJProgramsSection extends AnimatableMixin(BaseElement) {
  private _currentIndex = 0
  private _cardWrappers: HTMLElement[] = []
  private _pillButtons: HTMLButtonElement[] = []
  private _trackEl: HTMLElement | null = null
  private _autoRotateTimer: ReturnType<typeof setInterval> | null = null
  private _autoRotateObserver: IntersectionObserver | null = null
  private _userInteracted = false
  private _hasEntered = false

  protected render(): void {
    this.innerHTML = `
      <section aria-label="Programs for Every Level" class="py-16">
        <div class="text-center mb-10 px-4">
          <h2 class="font-heading text-3xl sm:text-4xl font-black text-white mb-4">Programs for Every Level</h2>
          <p class="text-neutral-400 text-lg max-w-2xl mx-auto">From your first class to your first gold medal — we have a program designed for you.</p>
        </div>
        <div data-carousel-viewport class="relative h-[70vh] overflow-hidden">
          <div data-track class="absolute inset-y-0 flex items-center gap-6 will-change-transform"></div>
        </div>
        <div data-pills role="tablist" aria-label="Select program"
             class="mt-8 flex flex-wrap justify-center gap-2 px-4"></div>
      </section>
    `
  }

  protected override bindEvents(): void {
    const reducedMotion = document.documentElement.hasAttribute('data-reduce-motion')
    if (reducedMotion) {
      this.renderReducedMotion()
      return
    }

    this._trackEl = this.querySelector<HTMLElement>('[data-track]')
    const viewport = this.querySelector<HTMLElement>('[data-carousel-viewport]')
    const pillsContainer = this.querySelector<HTMLElement>('[data-pills]')

    if (!this._trackEl || !viewport || !pillsContainer) { return }

    this.buildTrack()
    this.buildPills(pillsContainer)
    gsap.set(this._trackEl, { x: this.trackX(0) })
    // Cards start hidden — entrance animation reveals them on first scroll-into-view
    Array.from(this._trackEl.children).forEach((child) => {
      gsap.set(child as HTMLElement, { scale: 0, opacity: 0 })
    })
    this.updatePills(0)
    this.bindSwipe(viewport)
    this.initAutoRotate(viewport)
  }

  private renderReducedMotion(): void {
    const gridCards = PROGRAMS.map(
      ({ title, badge, description, ctaHref, accentColor }) => `
        <div data-grid-card class="w-full">
          <ojj-program-card
            title="${title}"
            badge="${badge}"
            description="${description}"
            cta-href="${ctaHref}"
            accent-color="${accentColor}"
          ></ojj-program-card>
        </div>
      `
    ).join('')

    this.innerHTML = `
      <section aria-label="Programs for Every Level" class="py-16 px-4">
        <div class="text-center mb-10">
          <h2 class="font-heading text-3xl sm:text-4xl font-black text-white mb-4">Programs for Every Level</h2>
          <p class="text-neutral-400 text-lg max-w-2xl mx-auto">From your first class to your first gold medal — we have a program designed for you.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          ${gridCards}
        </div>
      </section>
    `
    const cards = this.querySelectorAll<HTMLElement>('[data-grid-card]')
    this.scrollReveal(cards, 'stagger')
  }

  private buildTrack(): void {
    const track = this._trackEl
    if (!track) { return }

    const realCards: HTMLElement[] = []
    PROGRAMS.forEach(({ title, badge, description, ctaHref, accentColor }) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'flex-shrink-0 w-80 md:w-96'
      wrapper.innerHTML = `<ojj-program-card
        title="${title}"
        badge="${badge}"
        description="${description}"
        cta-href="${ctaHref}"
        accent-color="${accentColor}"
      ></ojj-program-card>`
      realCards.push(wrapper)
      track.appendChild(wrapper)
    })

    // Prepend last CLONES_PER_SIDE real cards as clones (logical indices -2, -1).
    // Insert from i=1 upward so that each new insert pushes previous to the right:
    //   i=1: card[N-1]=Kickboxing  → DOM [KB]
    //   i=2: card[N-2]=CompTeam    → DOM [CT, KB]  (CT=logical -2, KB=logical -1) ✓
    for (let i = 1; i <= CLONES_PER_SIDE; i++) {
      const src = realCards[realCards.length - i]
      if (src) {
        const clone = src.cloneNode(true) as HTMLElement
        clone.setAttribute('aria-hidden', 'true')
        track.insertBefore(clone, track.firstChild)
      }
    }

    // Append first CLONES_PER_SIDE real cards as clones (logical indices N, N+1)
    for (let i = 0; i < CLONES_PER_SIDE; i++) {
      const src = realCards[i]
      if (src) {
        const clone = src.cloneNode(true) as HTMLElement
        clone.setAttribute('aria-hidden', 'true')
        track.appendChild(clone)
      }
    }

    this._cardWrappers = realCards
  }

  private buildPills(container: HTMLElement): void {
    this._pillButtons = []
    PROGRAMS.forEach(({ title }, i) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.setAttribute('role', 'tab')
      btn.setAttribute('aria-selected', 'false')
      btn.textContent = title
      btn.className = INACTIVE_PILL
      btn.addEventListener('click', () => { this.onUserNavigate(); this.goTo(i) })
      this._pillButtons.push(btn)
      container.appendChild(btn)
    })
  }

  private cardWidth(): number {
    return this._cardWrappers[0]?.offsetWidth ?? 320
  }

  private gap(): number {
    return this._trackEl
      ? parseFloat(getComputedStyle(this._trackEl).gap) || 24
      : 24
  }

  /**
   * X position for the track so that the card at logical `index` is centered.
   * +CLONES_PER_SIDE offset accounts for the prepended clone slots.
   */
  private trackX(index: number): number {
    const vw = document.documentElement.clientWidth
    const cw = this.cardWidth()
    const g = this.gap()
    return vw / 2 - cw / 2 - (index + CLONES_PER_SIDE) * (cw + g)
  }

  private goTo(rawIndex: number): void {
    const track = this._trackEl
    if (!track) { return }

    const targetX = this.trackX(rawIndex)
    const lastIndex = PROGRAMS.length - 1

    const handleWrap = (): void => {
      let resolvedIndex: number
      if (rawIndex === -1) {
        gsap.set(track, { x: this.trackX(lastIndex) })
        resolvedIndex = lastIndex
      } else if (rawIndex === PROGRAMS.length) {
        gsap.set(track, { x: this.trackX(0) })
        resolvedIndex = 0
      } else {
        resolvedIndex = rawIndex
      }
      this._currentIndex = resolvedIndex
      this.updateAllCardStyles(resolvedIndex)
      this.updatePills(resolvedIndex)
    }

    gsap.to(track, {
      x: targetX,
      duration: 0.45,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: handleWrap,
    })
  }

  /**
   * Apply scale/opacity depth effect to every card in the track (real + clones)
   * based on DOM distance from the active card's DOM slot.
   */
  private updateAllCardStyles(active: number): void {
    const track = this._trackEl
    if (!track) { return }
    // Active card's DOM index = active (real index) + CLONES_PER_SIDE prepended clones
    const activeDOMIndex = active + CLONES_PER_SIDE
    Array.from(track.children).forEach((child, domIndex) => {
      const dist = Math.abs(domIndex - activeDOMIndex)
      const scale   = dist === 0 ? 1.0 : dist === 1 ? 0.85 : dist === 2 ? 0.70 : 0.60
      const opacity = dist === 0 ? 1.0 : dist === 1 ? 0.60 : dist === 2 ? 0.30 : 0.00
      gsap.to(child, { scale, opacity, duration: 0.35, ease: 'power2.out' })
    })
  }

  private updatePills(active: number): void {
    this._pillButtons.forEach((btn, i) => {
      const isActive = i === active
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false')
      btn.className = isActive ? ACTIVE_PILL : INACTIVE_PILL
    })
  }

  private bindSwipe(viewport: HTMLElement): void {
    let startX = 0
    viewport.addEventListener('pointerdown', (e) => { startX = e.clientX })
    viewport.addEventListener('pointerup', (e) => {
      const delta = e.clientX - startX
      if (Math.abs(delta) < 10) { return }
      if (delta < -50) { this.onUserNavigate(); this.goTo(this._currentIndex + 1) }
      else if (delta > 50) { this.onUserNavigate(); this.goTo(this._currentIndex - 1) }
    })
  }

  /** Called on any manual navigation — stops auto-rotate permanently. */
  private onUserNavigate(): void {
    this._userInteracted = true
    this.stopAutoRotate()
  }

  private startAutoRotate(): void {
    if (this._userInteracted || this._autoRotateTimer !== null) { return }
    this._autoRotateTimer = setInterval(() => {
      this.goTo(this._currentIndex + 1)
    }, AUTO_ROTATE_INTERVAL)
  }

  private stopAutoRotate(): void {
    if (this._autoRotateTimer !== null) {
      clearInterval(this._autoRotateTimer)
      this._autoRotateTimer = null
    }
  }

  /**
   * Bubble-gum pop entrance: center card springs up first, then adjacent, then far.
   * Off-screen cards (dist ≥ 3) are set to their depth state immediately (opacity 0 — no flash).
   * Calls onComplete when the last group finishes.
   */
  private playEntranceAnimation(onComplete: () => void): void {
    const track = this._trackEl
    if (!track) { onComplete(); return }

    const activeDOMIndex = this._currentIndex + CLONES_PER_SIDE
    const children = Array.from(track.children)

    // Off-screen cards go straight to depth state (invisible, so no visual impact)
    children.forEach((child, domIndex) => {
      if (Math.abs(domIndex - activeDOMIndex) >= 3) {
        gsap.set(child, { scale: 0.60, opacity: 0 })
      }
    })

    const tl = gsap.timeline({ onComplete, defaults: { ease: 'elastic.out(1.4, 0.35)', duration: 1.4 } })

    const center = children[activeDOMIndex]
    if (center) { tl.to(center, { scale: 1.0, opacity: 1.0 }) }

    const adjacent = children.filter((_, i) => Math.abs(i - activeDOMIndex) === 1)
    if (adjacent.length) { tl.to(adjacent, { scale: 0.85, opacity: 0.60 }, 0.2) }

    const far = children.filter((_, i) => Math.abs(i - activeDOMIndex) === 2)
    if (far.length) { tl.to(far, { scale: 0.70, opacity: 0.30 }, 0.4) }
  }

  private initAutoRotate(viewport: HTMLElement): void {
    viewport.addEventListener('mouseenter', () => { this.stopAutoRotate() })
    viewport.addEventListener('mouseleave', () => {
      if (!this._userInteracted) { this.startAutoRotate() }
    })

    this._autoRotateObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          if (!this._hasEntered) {
            this._hasEntered = true
            this.playEntranceAnimation(() => { this.startAutoRotate() })
          } else {
            this.startAutoRotate()
          }
        } else {
          this.stopAutoRotate()
        }
      },
      { threshold: 0.5 }
    )
    this._autoRotateObserver.observe(viewport)
  }

  protected override cleanup(): void {
    this.stopAutoRotate()
    this._autoRotateObserver?.disconnect()
    this._autoRotateObserver = null
    super.cleanup()
  }
}

customElements.define('ojj-programs-section', OJJProgramsSection)
