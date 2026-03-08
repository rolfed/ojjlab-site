/**
 * ojj-instructors-section — Instructor spotlight carousel.
 *
 * Layout: one expanded instructor profile card centered in a horizontal track,
 * flanked by circular avatar portraits. A nav row of instructor names sits
 * below. Clicking a name (or an avatar circle):
 *   1. Collapses the active card back to a circle (reverse of its expand TL)
 *   2. Shifts the track so the chosen instructor slides to center
 *   3. Expands the chosen instructor into the full profile card
 *
 * Only one card is expanded at a time. Transitions are locked while animating.
 * All three actions are coordinated on a master GSAP timeline.
 *
 * Scroll entrance: fired once when the section reaches 80% into the viewport
 * via ScrollTrigger. Adam Fox is always the default active instructor.
 *
 * Reduced-motion: static grid of ojj-instructor-card elements with scrollReveal.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

type Belt = 'black' | 'brown' | 'purple' | 'blue' | 'white' | 'na';

interface Instructor {
  name:  string
  belt:  Belt
  title: string
  bio:   string
}

const INSTRUCTORS: Instructor[] = [
  {
    name:  'Adam Fox',
    belt:  'black',
    title: 'Program Director & Head Coach',
    bio:   'Black belt with extensive competition and coaching experience. Adam leads the overall curriculum and fosters a disciplined, welcoming environment for students at every level.',
  },
  {
    name:  'Danniel Rolfe',
    belt:  'brown',
    title: 'Coach',
    bio:   'Dedicated brown belt coach with deep technical knowledge of BJJ fundamentals and advanced guard work. Brings patience and precision to every class.',
  },
  {
    name:  'Raymon Herrera',
    belt:  'blue',
    title: 'Gym Manager',
    bio:   'Keeps OJJ Lab running smoothly while staying active on the mats. Raymon is the welcoming face that makes every new student feel at home from day one.',
  },
  {
    name:  'Jacob Marical',
    belt:  'na',
    title: 'Wrestling Coach',
    bio:   "Experienced wrestler bringing takedown fundamentals to the gym. Justin's wrestling program adds a critical dimension to every student's grappling game.",
  },
  {
    name:  'Justin Koreis',
    belt:  'na',
    title: 'Kickboxing Instructor',
    bio:   "High-energy striking coach with a background in Muay Thai and boxing. Justin's kickboxing classes build cardio, coordination, and real stand-up self-defense skills.",
  },
]

const BELT_ACCENT: Record<Belt, string> = {
  black:  '#6b7280',
  brown:  '#a0522d',
  purple: '#7c3aed',
  blue:   '#3b82f6',
  white:  '#ffffff',
  na:     '#9ca3af'
}

const BELT_GRADIENT: Record<Belt, string> = {
    black: 'linear-gradient(160deg, #111111 0%, #1c1c1c 50%, #0a0a0a 100%)',
    brown: 'linear-gradient(160deg, #1a0e07 0%, #2d1b0f 50%, #110a04 100%)',
    purple: 'linear-gradient(160deg, #120920 0%, #1e1030 50%, #0a0513 100%)',
    blue: 'linear-gradient(160deg, #060d1a 0%, #0c1e3a 50%, #040a14 100%)',
    white: 'linear-gradient(160deg, #ffffff 0%, #0c1e3a 50%, #ffffff 100%)',
    na: 'linear-gradient(160deg, #111111 0%, #1a1a2e 50%, #0a0a0a 100%)',
}

/** Diameter (px) of inactive avatar circles. */
const CIRCLE_SIZE = 88

/** Fixed height (px) of the expanded instructor card. */
const CARD_HEIGHT = 440

/** Gap (px) between slots in the track. */
const SLOT_GAP = 28

/** Width (px) of the expanded card — responsive. */
function cardWidth(): number {
  return Math.min(300, window.innerWidth - 80)
}

export class OJJInstructorsSection extends AnimatableMixin(BaseElement) {
  private _activeIndex  = 0
  private _isAnimating  = false
  private _hasEntered   = false
  private _expandTLs    = new Map<number, gsap.core.Timeline>()
  private _st:          ScrollTrigger | null = null
  private _trackEl:     HTMLElement | null   = null
  private _viewportEl:  HTMLElement | null   = null
  private _slots:       HTMLElement[]        = []
  private _navBtns:     HTMLButtonElement[]  = []
  private _resizeTimer: ReturnType<typeof setTimeout> | null = null

  // ── Render ──────────────────────────────────────────────────────────────

  protected render(): void {
    this.innerHTML = this._buildHTML()
  }

  private _buildHTML(): string {
    const slotsHTML = INSTRUCTORS.map((inst, i) => this._slotHTML(inst, i)).join('')

    const navHTML = INSTRUCTORS.map(({ name }, i) => `
      <button
        class="spotlight-nav-btn"
        data-nav-btn
        data-index="${i}"
        aria-pressed="${i === 0 ? 'true' : 'false'}"
        type="button"
      >${name}</button>
    `).join('')

    return `
      <section
        data-spotlight-section
        aria-labelledby="instructors-heading"
        class="bg-neutral-950 py-20"
      >
        <div data-header class="text-center mb-14 px-4">
          <h2
            id="instructors-heading"
            class="font-heading text-3xl sm:text-4xl font-black text-white mb-4"
          >Meet Your Instructors</h2>
          <p class="text-neutral-400 text-lg max-w-2xl mx-auto">
            World-class coaches dedicated to your growth on and off the mat.
          </p>
        </div>

        <div data-viewport class="spotlight-viewport">
          <div
            data-track
            class="spotlight-track"
            style="gap:${SLOT_GAP}px"
          >
            ${slotsHTML}
          </div>
        </div>

        <nav
          data-nav
          class="mt-10 flex flex-wrap justify-center gap-3 px-4"
          aria-label="Browse instructors"
        >
          ${navHTML}
        </nav>
      </section>
    `
  }

  private _slotHTML(inst: Instructor, i: number): string {
    const accent    = BELT_ACCENT[inst.belt]
    const gradient  = BELT_GRADIENT[inst.belt]
    const initial   = inst.name.charAt(0)
    const beltLabel = inst.belt === 'na' ? '' : `${inst.belt.charAt(0).toUpperCase()}${inst.belt.slice(1)} Belt`

    return `
      <div
        class="spotlight-slot"
        data-slot
        data-index="${i}"
        role="button"
        tabindex="${i === 0 ? '0' : '-1'}"
        aria-label="View ${inst.name} profile"
        aria-expanded="${i === 0 ? 'true' : 'false'}"
      >
        <!-- ── Avatar layer (circle state) ── -->
        <div data-avatar style="
          position:absolute;inset:0;
          display:flex;align-items:center;justify-content:center;
          background:${gradient};
        ">
          <span aria-hidden="true" style="
            font-size:2rem;font-weight:900;
            color:rgba(255,255,255,0.3);
            user-select:none;letter-spacing:-0.02em;
          ">${initial}</span>

          <!-- Belt ring — fades out on expand -->
          <div data-ring aria-hidden="true" style="
            position:absolute;inset:0;border-radius:inherit;
            border:3px solid ${accent};pointer-events:none;
          "></div>
        </div>

        <!-- ── Card layer (expanded state) ── -->
        <div data-card aria-hidden="true" style="
          position:absolute;inset:0;display:flex;flex-direction:column;
          background:#111;border:1px solid #222;
        ">
          <!-- Portrait area — top 58% -->
          <div style="position:relative;flex:0 0 58%;overflow:hidden;background:${gradient};">
            <!-- Large monogram background -->
            <div aria-hidden="true" style="
              position:absolute;inset:0;
              display:flex;align-items:center;justify-content:center;
              font-size:9rem;font-weight:900;
              color:rgba(255,255,255,0.04);
              line-height:1;user-select:none;
            ">${initial}</div>

            <!-- Bottom gradient fade -->
            <div aria-hidden="true" style="
              position:absolute;bottom:0;left:0;right:0;height:70%;
              background:linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.4) 50%,transparent 100%);
            "></div>

            <!-- Belt accent stripe -->
            <div aria-hidden="true" style="
              position:absolute;left:0;top:0;bottom:0;width:4px;
              background:${accent};box-shadow:2px 0 14px ${accent}80;
            "></div>

            <!-- Name + rank overlay -->
            <div style="position:absolute;bottom:0;left:0;right:0;padding:1rem 1.25rem;z-index:1;">
              <p data-rank style="
                font-size:0.65rem;font-weight:700;
                text-transform:uppercase;letter-spacing:0.08em;
                color:${accent};margin:0 0 0.3rem;line-height:1;
              ">${beltLabel}</p>
              <h3 data-iname style="
                font-size:1.15rem;font-weight:800;
                color:#fff;margin:0;line-height:1.15;
                font-family:var(--font-heading);
              ">${inst.name}</h3>
            </div>
          </div>

          <!-- Bio body — bottom 42% -->
          <div style="flex:1;padding:1rem 1.25rem;border-top:1px solid #1e1e1e;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;">
            <p data-ititle style="
              font-size:0.7rem;font-weight:700;
              text-transform:uppercase;letter-spacing:0.06em;
              color:${accent};margin:0 0 0.5rem;
            ">${inst.title}</p>
            <p data-bio style="
              font-size:0.8rem;color:#888;
              line-height:1.6;margin:0;
            ">${inst.bio}</p>
          </div>
        </div>
      </div>
    `
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override bindEvents(): void {
    const reducedMotion = document.documentElement.hasAttribute('data-reduce-motion')
    if (reducedMotion) {
      this._renderReducedMotion()
      return
    }

    this._trackEl   = this.querySelector<HTMLElement>('[data-track]')
    this._viewportEl = this.querySelector<HTMLElement>('[data-viewport]')
    this._slots     = Array.from(this.querySelectorAll<HTMLElement>('[data-slot]'))
    this._navBtns   = Array.from(this.querySelectorAll<HTMLButtonElement>('[data-nav-btn]'))

    if (!this._trackEl || !this._viewportEl || this._slots.length === 0) { return }

    this._initSlotStates()
    this._buildAllExpandTimelines()

    // Position track so slot 0's circle is centered — entrance will shift it
    // to the card-centered position as part of the expand animation.
    gsap.set(this._trackEl, { x: this._circleOffset(0) })

    this._bindNavClicks()
    this._bindSlotInteraction()
    this._bindHoverEffects()
    this._registerScrollTrigger()

    window.addEventListener('resize', this._onResize)
  }

  protected override cleanup(): void {
    window.removeEventListener('resize', this._onResize)
    if (this._resizeTimer !== null) { clearTimeout(this._resizeTimer) }
    this._st?.kill()
    this._st = null
    this._expandTLs.forEach((tl) => tl.kill())
    this._expandTLs.clear()
    super.cleanup()
  }

  // ── Initialization ───────────────────────────────────────────────────────

  /**
   * Set every slot to its pre-entrance circle state (invisible) via gsap.set
   * so there is no flash of unstyled content before the entrance fires.
   */
  private _initSlotStates(): void {
    this._slots.forEach((slot) => {
      const avatarEl = slot.querySelector<HTMLElement>('[data-avatar]')!
      const ringEl   = slot.querySelector<HTMLElement>('[data-ring]')!
      const cardEl   = slot.querySelector<HTMLElement>('[data-card]')!
      const rankEl   = slot.querySelector<HTMLElement>('[data-rank]')!
      const nameEl   = slot.querySelector<HTMLElement>('[data-iname]')!
      const titleEl  = slot.querySelector<HTMLElement>('[data-ititle]')!
      const bioEl    = slot.querySelector<HTMLElement>('[data-bio]')!

      // All slots start as invisible circles
      gsap.set(slot,    { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: '50%', opacity: 0, scale: 0 })
      gsap.set(avatarEl, { opacity: 1, scale: 1 })
      gsap.set(ringEl,   { opacity: 0.5 })
      gsap.set(cardEl,   { opacity: 0 })
      // Text elements start hidden for the expand animation to reveal
      gsap.set([rankEl, nameEl, titleEl, bioEl], { opacity: 0, y: 6 })
    })
  }

  private _buildAllExpandTimelines(): void {
    const CW = cardWidth()
    this._slots.forEach((slot, i) => {
      this._expandTLs.set(i, this._buildExpandTimeline(slot, CW))
    })
  }

  /**
   * Builds a paused GSAP timeline for expanding one slot from circle → card.
   * Reversing it collapses the card back to a circle.
   * Does NOT animate the track — track shifting is handled by the transition coordinator.
   */
  private _buildExpandTimeline(slot: HTMLElement, CW: number): gsap.core.Timeline {
    const avatarEl = slot.querySelector<HTMLElement>('[data-avatar]')!
    const ringEl   = slot.querySelector<HTMLElement>('[data-ring]')!
    const cardEl   = slot.querySelector<HTMLElement>('[data-card]')!
    const rankEl   = slot.querySelector<HTMLElement>('[data-rank]')!
    const nameEl   = slot.querySelector<HTMLElement>('[data-iname]')!
    const titleEl  = slot.querySelector<HTMLElement>('[data-ititle]')!
    const bioEl    = slot.querySelector<HTMLElement>('[data-bio]')!

    return gsap.timeline({ paused: true })

      // ── Phase 1: slot morphs circle → card shape ──────────────── 0s
      .to(slot, {
        width:        CW,
        height:       CARD_HEIGHT,
        borderRadius: '1rem',
        duration:     0.55,
        ease:         'power3.inOut',
      }, 0)

      // ── Phase 1b: avatar fades out ─────────────────────────────── 0s
      .to(avatarEl, {
        opacity:  0,
        scale:    0.75,
        duration: 0.25,
        ease:     'power2.in',
      }, 0)

      // ── Phase 1c: belt ring fades out ──────────────────────────── 0s
      .to(ringEl, {
        opacity:  0,
        duration: 0.2,
      }, 0)

      // ── Phase 2: card layer fades in ───────────────────────────── 0.28s
      .to(cardEl, {
        opacity:  1,
        duration: 0.3,
        ease:     'power2.out',
        onStart() { cardEl.removeAttribute('aria-hidden') },
        onReverseComplete() { cardEl.setAttribute('aria-hidden', 'true') },
      }, 0.28)

      // ── Phase 3: text elements stagger up ─────────────────────── 0.4s
      .to([rankEl, nameEl, titleEl, bioEl], {
        opacity:  1,
        y:        0,
        stagger:  0.06,
        duration: 0.3,
        ease:     'power2.out',
      }, 0.4)
  }

  // ── Offset calculations ──────────────────────────────────────────────────

  /**
   * Track X so a circle-state slot's center aligns with the viewport center.
   * Used for the initial pre-entrance position.
   */
  private _circleOffset(targetIndex: number): number {
    const offsetBefore   = targetIndex * (CIRCLE_SIZE + SLOT_GAP)
    const viewportCenter = (this._viewportEl?.offsetWidth ?? window.innerWidth) / 2
    return viewportCenter - offsetBefore - CIRCLE_SIZE / 2
  }

  /**
   * Track X so the expanded card's center aligns with the viewport center.
   * Assumes all other slots are in circle state (width: CIRCLE_SIZE).
   */
  private _cardOffset(targetIndex: number): number {
    const CW             = cardWidth()
    const offsetBefore   = targetIndex * (CIRCLE_SIZE + SLOT_GAP)
    const viewportCenter = (this._viewportEl?.offsetWidth ?? window.innerWidth) / 2
    return viewportCenter - offsetBefore - CW / 2
  }

  // ── Scroll entrance ───────────────────────────────────────────────────────

  private _registerScrollTrigger(): void {
    const section = this.querySelector<HTMLElement>('[data-spotlight-section]')
    if (!section) { return }

    this._st = ScrollTrigger.create({
      trigger: section,
      start:   'top 80%',
      once:    true,
      onEnter: () => this._playEntrance(),
    })
  }

  private _playEntrance(): void {
    if (this._hasEntered) { return }
    this._hasEntered  = true
    this._isAnimating = true

    const headerEl = this.querySelector<HTMLElement>('[data-header]')
    const navEl    = this.querySelector<HTMLElement>('[data-nav]')

    const entrance = gsap.timeline({
      onComplete: () => { this._isAnimating = false },
    })

    // Header fades up
    if (headerEl) {
      entrance.from(Array.from(headerEl.children) as HTMLElement[], {
        opacity:  0,
        y:        20,
        duration: 0.5,
        stagger:  0.1,
        ease:     'power2.out',
      }, 0)
    }

    // Inactive circles (1–4) pop in, staggered
    const inactiveSlots = this._slots.slice(1)
    if (inactiveSlots.length > 0) {
      entrance.to(inactiveSlots, {
        opacity:  1,
        scale:    1,
        duration: 0.4,
        stagger:  0.08,
        ease:     'back.out(1.5)',
      }, 0.2)
    }

    // Adam (slot 0) pops in as a circle
    entrance.to(this._slots[0]!, {
      opacity:  1,
      scale:    1,
      duration: 0.45,
      ease:     'back.out(1.5)',
    }, 0.15)

    // Shift track to card-centered position + expand Adam simultaneously
    entrance.add((): void => {
      void gsap.to(this._trackEl!, {
        x:        this._cardOffset(0),
        duration: 0.6,
        ease:     'power3.inOut',
      })
      void this._expandTLs.get(0)!.play()
    }, 0.6)

    // Nav fades up
    if (navEl) {
      entrance.from(Array.from(navEl.children) as HTMLElement[], {
        opacity:  0,
        y:        8,
        duration: 0.3,
        stagger:  0.05,
        ease:     'power2.out',
      }, 0.4)
    }
  }

  // ── Interaction ──────────────────────────────────────────────────────────

  private _bindNavClicks(): void {
    this._navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset['index'] ?? '0', 10)
        this._goTo(idx)
      })
    })
  }

  private _bindSlotInteraction(): void {
    this._slots.forEach((slot, i) => {
      slot.addEventListener('click', () => this._goTo(i))
      slot.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent
        if (ke.key === 'Enter' || ke.key === ' ') {
          e.preventDefault()
          this._goTo(i)
        }
      })
    })
  }

  private _bindHoverEffects(): void {
    this._slots.forEach((slot, i) => {
      const ringEl = slot.querySelector<HTMLElement>('[data-ring]')

      slot.addEventListener('pointerenter', () => {
        if (i === this._activeIndex) { return }
        gsap.to(slot, { scale: 1.1, duration: 0.2, ease: 'power2.out' })
        if (ringEl) {
          gsap.to(ringEl, { opacity: 1, duration: 0.18 })
        }
      })

      slot.addEventListener('pointerleave', () => {
        if (i === this._activeIndex) { return }
        gsap.to(slot, { scale: 1, duration: 0.25, ease: 'power2.inOut' })
        if (ringEl) {
          gsap.to(ringEl, { opacity: 0.5, duration: 0.2 })
        }
      })
    })
  }

  /**
   * Main transition coordinator.
   * 1. Collapses the current card (reverse of its expand TL)
   * 2. Shifts the track to center the new instructor
   * 3. Expands the new instructor's card
   */
  private _goTo(targetIndex: number): void {
    if (this._isAnimating)                 { return }
    if (targetIndex === this._activeIndex) { return }
    if (!this._hasEntered)                 { return }

    const prevIndex       = this._activeIndex
    this._activeIndex     = targetIndex
    this._isAnimating     = true

    // Determine stagger direction for text reveal based on navigation direction
    const direction = targetIndex > prevIndex ? 1 : -1

    // Update ARIA + tabindex
    this._navBtns[prevIndex]?.setAttribute('aria-pressed', 'false')
    this._navBtns[targetIndex]?.setAttribute('aria-pressed', 'true')
    this._slots[prevIndex]?.setAttribute('aria-expanded', 'false')
    this._slots[targetIndex]?.setAttribute('aria-expanded', 'true')
    this._slots[prevIndex]?.setAttribute('tabindex', '-1')
    this._slots[targetIndex]?.setAttribute('tabindex', '0')

    const newOffset = this._cardOffset(targetIndex)
    const prevTL    = this._expandTLs.get(prevIndex)!

    // Re-build the expand TL for the incoming instructor with directional stagger
    const updatedNextTL = this._buildExpandTimelineDirectional(
      this._slots[targetIndex]!,
      cardWidth(),
      direction
    )
    this._expandTLs.set(targetIndex, updatedNextTL)

    const transition = gsap.timeline({
      onComplete: () => { this._isAnimating = false },
    })

    // 1. Collapse current card → circle
    transition.add(prevTL.reverse(), 0)

    // 2. Shift track (slight overlap — collapse leads by 80ms)
    transition.add(
      gsap.to(this._trackEl!, {
        x:        newOffset,
        duration: 0.55,
        ease:     'power2.inOut',
      }),
      0.08
    )

    // 3. Expand the new card (begins as track nears its destination)
    transition.add((): void => { void updatedNextTL.play() }, 0.38)
  }

  /**
   * Variant of _buildExpandTimeline that reverses the text stagger direction
   * based on which way the user is navigating through the carousel.
   */
  private _buildExpandTimelineDirectional(
    slot:      HTMLElement,
    CW:        number,
    direction: 1 | -1
  ): gsap.core.Timeline {
    const avatarEl = slot.querySelector<HTMLElement>('[data-avatar]')!
    const ringEl   = slot.querySelector<HTMLElement>('[data-ring]')!
    const cardEl   = slot.querySelector<HTMLElement>('[data-card]')!
    const rankEl   = slot.querySelector<HTMLElement>('[data-rank]')!
    const nameEl   = slot.querySelector<HTMLElement>('[data-iname]')!
    const titleEl  = slot.querySelector<HTMLElement>('[data-ititle]')!
    const bioEl    = slot.querySelector<HTMLElement>('[data-bio]')!

    // Ensure text starts in hidden state before expand
    gsap.set([rankEl, nameEl, titleEl, bioEl], {
      opacity: 0,
      y:       direction * 8,
    })
    gsap.set(cardEl,   { opacity: 0 })
    gsap.set(avatarEl, { opacity: 1, scale: 1 })
    gsap.set(ringEl,   { opacity: 0.5 })

    return gsap.timeline({ paused: true })
      .to(slot, {
        width:        CW,
        height:       CARD_HEIGHT,
        borderRadius: '1rem',
        duration:     0.55,
        ease:         'power3.inOut',
      }, 0)
      .to(avatarEl, {
        opacity:  0,
        scale:    0.75,
        duration: 0.25,
        ease:     'power2.in',
      }, 0)
      .to(ringEl, {
        opacity:  0,
        duration: 0.2,
      }, 0)
      .to(cardEl, {
        opacity:  1,
        duration: 0.3,
        ease:     'power2.out',
        onStart() { cardEl.removeAttribute('aria-hidden') },
        onReverseComplete() { cardEl.setAttribute('aria-hidden', 'true') },
      }, 0.28)
      .to([rankEl, nameEl, titleEl, bioEl], {
        opacity:  1,
        y:        0,
        stagger:  direction > 0 ? 0.06 : -0.06,
        duration: 0.3,
        ease:     'power2.out',
      }, 0.4)
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  private _onResize = (): void => {
    if (this._resizeTimer !== null) { clearTimeout(this._resizeTimer) }
    this._resizeTimer = setTimeout(() => {
      if (!this._hasEntered || !this._trackEl) { return }
      // Snap track to correct position for current active slot
      gsap.set(this._trackEl, { x: this._cardOffset(this._activeIndex) })
      ScrollTrigger.refresh()
    }, 150)
  }

  // ── Reduced-motion fallback ───────────────────────────────────────────────

  private _renderReducedMotion(): void {
    const cards = INSTRUCTORS.map(
      ({ name, belt, title, bio }) =>
        `<ojj-instructor-card name="${name}" belt="${belt}" title="${title}" bio="${bio}"></ojj-instructor-card>`
    ).join('')

    this.innerHTML = `
      <section
        aria-labelledby="instructors-heading-static"
        class="bg-neutral-950 py-16 px-4"
      >
        <div class="text-center mb-10">
          <h2
            id="instructors-heading-static"
            class="font-heading text-3xl sm:text-4xl font-black text-white mb-4"
          >Meet Your Instructors</h2>
          <p class="text-neutral-400 text-lg max-w-2xl mx-auto">
            World-class coaches dedicated to your growth on and off the mat.
          </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
          ${cards}
        </div>
      </section>
    `

    const els = Array.from(this.querySelectorAll<HTMLElement>('ojj-instructor-card'))
    this.scrollReveal(els, 'stagger')
  }
}

customElements.define('ojj-instructors-section', OJJInstructorsSection)
