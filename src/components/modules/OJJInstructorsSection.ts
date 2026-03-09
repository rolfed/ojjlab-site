/**
 * ojj-instructors-section — Instructor spotlight carousel.
 *
 * Architecture: slots are absolutely positioned inside a fixed-height viewport.
 * No flex track — all motion via x/y CSS transforms (GPU only).
 * A single master GSAP timeline drives each transition.
 *
 * Transition phases:
 *   A (t=0.00): Exit prev text — stagger out, opacity→0, y→-8
 *   B (t=0.05): Fade prev card content to 0
 *   C (t=0.15): All slots reposition + prev slot collapses to circle (0.40s)
 *   D (t=0.57): New slot expands from circle to card (0.25s)
 *   E (t=0.65): New card content fades in
 *   F (t=0.77): Text stagger — name → belt → title → bio → learn-more
 *
 * Rapid-click guard: _pendingIndex queues the last-requested target.
 * It fires immediately when the current transition completes (latest-intent wins).
 *
 * Scroll entrance: fires once when section reaches 80% into viewport.
 * Adam Fox (index 0) is always the default active instructor.
 * Reduced-motion: static grid with scrollReveal stagger.
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
  href?: string
}

const INSTRUCTORS: Instructor[] = [
  {
    name:  'Adam Fox',
    belt:  'black',
    title: 'Program Director & Head Coach',
    bio:   '2nd-degree black belt. 24 years of experience. Former head coach of the Kazakhstan National Team. Has produced IBJJF World Champions and UFC-roster fighters.',
    href:  '/instructors/adam/',
  },
  {
    name:  'Danniel Rolfe',
    belt:  'brown',
    title: 'Coach',
    bio:   'Brown belt with 20+ years on the mat. Trains under Adam Fox and Erick Hemphil. Eight years of teaching experience. Believes Jiu Jitsu is for everyone.',
    href:  '/instructors/danniel/',
  },
  {
    name:  'Raymon Herrera',
    belt:  'blue',
    title: 'Gym Manager',
    bio:   'Keeps OJJ Lab running smoothly while staying active on the mats. The welcoming face that makes every new student feel at home from day one.',
  },
  {
    name:  'Jacob Marical',
    belt:  'na',
    title: 'Wrestling Coach',
    bio:   "Experienced wrestler bringing takedown fundamentals to the gym. Jacob's wrestling program adds a critical dimension to every student's grappling game.",
  },
  {
    name:  'Justin Koreis',
    belt:  'na',
    title: 'Kickboxing Instructor',
    bio:   "High-energy striking coach with a background in Muay Thai and boxing. Justin's kickboxing classes build cardio, coordination, and stand-up self-defense skills.",
  },
]

const BELT_ACCENT: Record<Belt, string> = {
  black:  '#6b7280',
  brown:  '#a0522d',
  purple: '#7c3aed',
  blue:   '#3b82f6',
  white:  '#ffffff',
  na:     '#9ca3af',
}

const BELT_GRADIENT: Record<Belt, string> = {
  black:  'linear-gradient(160deg, #111111 0%, #1c1c1c 50%, #0a0a0a 100%)',
  brown:  'linear-gradient(160deg, #1a0e07 0%, #2d1b0f 50%, #110a04 100%)',
  purple: 'linear-gradient(160deg, #120920 0%, #1e1030 50%, #0a0513 100%)',
  blue:   'linear-gradient(160deg, #060d1a 0%, #0c1e3a 50%, #040a14 100%)',
  white:  'linear-gradient(160deg, #ffffff 0%, #0c1e3a 50%, #ffffff 100%)',
  na:     'linear-gradient(160deg, #111111 0%, #1a1a2e 50%, #0a0a0a 100%)',
}

/** Diameter (px) of inactive avatar circles. */
const CIRCLE_SIZE = 88

/** Height (px) of the expanded instructor card. */
const CARD_HEIGHT = 440

/** Gap (px) between adjacent slots. */
const SLOT_GAP = 28

/** Y offset (px) that vertically centers a circle within the card-height stage. */
const CIRCLE_TOP = (CARD_HEIGHT - CIRCLE_SIZE) / 2

// Phase durations (seconds). Phases chain sequentially with no overlap.
const D_SHIFT = 0.30   // Phase 2: strip repositions left/right
const D_MORPH = 0.25   // Phase 3: circle expands to card (center-origin)

/** Width (px) of the expanded card — capped for narrow viewports. */
function cardWidth(): number {
  return Math.min(300, window.innerWidth - 80)
}

/**
 * Computes the CSS `x` (translateX) for slot `i` given the current active index.
 * The active card is always horizontally centered in the viewport.
 * Inactive circles stack outward from the card's edges in index order.
 */
function slotX(i: number, activeIndex: number, viewportWidth: number): number {
  const CW       = cardWidth()
  const cardLeft = (viewportWidth - CW) / 2
  if (i === activeIndex) { return cardLeft }
  if (i < activeIndex) {
    return cardLeft - (activeIndex - i) * (CIRCLE_SIZE + SLOT_GAP)
  }
  return cardLeft + CW + SLOT_GAP + (i - activeIndex - 1) * (CIRCLE_SIZE + SLOT_GAP)
}

export class OJJInstructorsSection extends AnimatableMixin(BaseElement) {
  private _activeIndex   = 0
  private _pendingIndex: number | null            = null
  private _timeline:     gsap.core.Timeline | null = null
  private _hasEntered    = false
  private _st:           ScrollTrigger | null      = null
  private _viewportEl:   HTMLElement | null        = null
  private _slots:        HTMLElement[]             = []
  private _navBtns:      HTMLButtonElement[]       = []
  private _resizeTimer:  ReturnType<typeof setTimeout> | null = null

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
        data-index="${String(i)}"
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

        <div
          data-viewport
          class="spotlight-viewport"
          style="height:${String(CARD_HEIGHT)}px"
        >
          ${slotsHTML}
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
    const isActive  = i === 0
    const beltLabel = inst.belt === 'na'
      ? ''
      : `${inst.belt.charAt(0).toUpperCase()}${inst.belt.slice(1)} Belt`

    const learnMoreHTML = inst.href
      ? `<a
            data-learn-more
            href="${inst.href}"
            class="spotlight-learn-more"
            tabindex="${isActive ? '0' : '-1'}"
          >Learn more about ${String(inst.name.split(' ')[0])} →</a>`
      : ''

    return `
      <div
        class="spotlight-slot"
        data-slot
        data-index="${String(i)}"
        role="button"
        tabindex="${isActive ? '0' : '-1'}"
        aria-label="View ${inst.name} profile"
        aria-expanded="${isActive ? 'true' : 'false'}"
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

          <div data-ring aria-hidden="true" style="
            position:absolute;inset:0;border-radius:inherit;
            border:3px solid ${accent};pointer-events:none;
          "></div>
        </div>

        <!-- ── Card layer (expanded state) ── -->
        <div data-card aria-hidden="${isActive ? 'false' : 'true'}" style="
          position:absolute;inset:0;display:flex;flex-direction:column;
          background:#111;border:1px solid #222;
        ">
          <!-- Portrait area — top 58%. Image expands here first during Phase D. -->
          <div data-portrait style="position:relative;flex:0 0 58%;overflow:hidden;background:${gradient};">
            <div aria-hidden="true" style="
              position:absolute;inset:0;
              display:flex;align-items:center;justify-content:center;
              font-size:9rem;font-weight:900;
              color:rgba(255,255,255,0.04);
              line-height:1;user-select:none;
            ">${initial}</div>

            <div aria-hidden="true" style="
              position:absolute;bottom:0;left:0;right:0;height:70%;
              background:linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.4) 50%,transparent 100%);
            "></div>

            <div aria-hidden="true" style="
              position:absolute;left:0;top:0;bottom:0;width:4px;
              background:${accent};box-shadow:2px 0 14px ${accent}80;
            "></div>

            <!-- Name + rank rise up individually in Phase F -->
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
          <div style="
            flex:1;padding:1rem 1.25rem;
            border-top:1px solid #1e1e1e;
            overflow:hidden;
            display:flex;flex-direction:column;
          ">
            <p data-ititle style="
              font-size:0.7rem;font-weight:700;
              text-transform:uppercase;letter-spacing:0.06em;
              color:${accent};margin:0 0 0.5rem;
            ">${inst.title}</p>
            <p data-bio style="
              font-size:0.8rem;color:#888;
              line-height:1.6;margin:0;flex:1;
            ">${inst.bio}</p>
            ${learnMoreHTML}
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

    this._viewportEl = this.querySelector<HTMLElement>('[data-viewport]')
    this._slots      = Array.from(this.querySelectorAll<HTMLElement>('[data-slot]'))
    this._navBtns    = Array.from(this.querySelectorAll<HTMLButtonElement>('[data-nav-btn]'))

    if (!this._viewportEl || this._slots.length === 0) { return }

    this._initSlotStates()
    this._bindNavClicks()
    this._bindSlotInteraction()
    this._bindHoverEffects()
    this._registerScrollTrigger()

    window.addEventListener('resize', this._onResize)
  }

  protected override cleanup(): void {
    window.removeEventListener('resize', this._onResize)
    if (this._resizeTimer !== null) { clearTimeout(this._resizeTimer) }
    this._timeline?.kill()
    this._timeline = null
    this._st?.kill()
    this._st = null
    super.cleanup()
  }

  // ── Initialization ───────────────────────────────────────────────────────

  /**
   * Sets every slot to its pre-entrance state.
   * Text starts hidden and offset downward (y:14) — rises up on reveal.
   * The active slot (index 0) starts as a card with invisible text.
   * All other slots start as circles.
   */
  private _initSlotStates(): void {
    if (!this._viewportEl) { return }
    const vw = this._viewportEl.offsetWidth
    const CW = cardWidth()

    this._slots.forEach((slot, i) => {
      const isActive  = i === 0
      const avatarEl  = slot.querySelector<HTMLElement>('[data-avatar]')
      const ringEl    = slot.querySelector<HTMLElement>('[data-ring]')
      const cardEl    = slot.querySelector<HTMLElement>('[data-card]')
      const rankEl    = slot.querySelector<HTMLElement>('[data-rank]')
      const nameEl    = slot.querySelector<HTMLElement>('[data-iname]')
      const titleEl   = slot.querySelector<HTMLElement>('[data-ititle]')
      const bioEl     = slot.querySelector<HTMLElement>('[data-bio]')
      const learnEl   = slot.querySelector<HTMLElement>('[data-learn-more]')
      if (!avatarEl || !ringEl || !cardEl || !rankEl || !nameEl || !titleEl || !bioEl) { return }

      gsap.set(slot, {
        position:     'absolute',
        top:          0,
        left:         0,
        x:            slotX(i, 0, vw),
        y:            isActive ? 0 : CIRCLE_TOP,
        width:        isActive ? CW : CIRCLE_SIZE,
        height:       isActive ? CARD_HEIGHT : CIRCLE_SIZE,
        borderRadius: isActive ? '1rem' : '50%',
        opacity:      0,
      })

      gsap.set(avatarEl, { opacity: isActive ? 0 : 1 })
      gsap.set(ringEl,   { opacity: isActive ? 0 : 0.5 })
      gsap.set(cardEl,   { opacity: isActive ? 1 : 0 })

      // All text starts hidden and offset downward — rises into position on reveal
      const textEls: HTMLElement[] = [nameEl, rankEl, titleEl, bioEl]
      if (learnEl) { textEls.push(learnEl) }
      gsap.set(textEls, { opacity: 0, y: 14 })
    })
  }

  // ── Scroll entrance ──────────────────────────────────────────────────────

  private _registerScrollTrigger(): void {
    const section = this.querySelector<HTMLElement>('[data-spotlight-section]')
    if (!section) { return }

    this._st = ScrollTrigger.create({
      trigger: section,
      start:   'top 80%',
      once:    true,
      onEnter: () => { this._playEntrance() },
    })
  }

  private _playEntrance(): void {
    if (this._hasEntered) { return }
    this._hasEntered = true

    const headerEl   = this.querySelector<HTMLElement>('[data-header]')
    const navEl      = this.querySelector<HTMLElement>('[data-nav]')
    const activeSlot = this._slots[0]
    if (!activeSlot) { return }

    const nameEl   = activeSlot.querySelector<HTMLElement>('[data-iname]')
    const rankEl   = activeSlot.querySelector<HTMLElement>('[data-rank]')
    const titleEl  = activeSlot.querySelector<HTMLElement>('[data-ititle]')
    const bioEl    = activeSlot.querySelector<HTMLElement>('[data-bio]')
    const learnEl  = activeSlot.querySelector<HTMLElement>('[data-learn-more]')
    if (!nameEl || !rankEl || !titleEl || !bioEl) { return }

    const entrance = gsap.timeline()

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

    // Active card lifts into view
    entrance.fromTo(activeSlot,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      0.2
    )

    // Inactive circles stagger in
    entrance.to(this._slots.slice(1), {
      opacity:  1,
      duration: 0.38,
      stagger:  0.07,
      ease:     'power2.out',
    }, 0.3)

    // Text rises up: name → rank → title → bio → learn-more
    const textSequence: [HTMLElement, number][] = [
      [nameEl,  0.55],
      [rankEl,  0.67],
      [titleEl, 0.77],
      [bioEl,   0.87],
    ]
    if (learnEl) { textSequence.push([learnEl, 0.97]) }
    textSequence.forEach(([el, t]) => {
      entrance.to(el, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, t)
    })

    // Nav fades up
    if (navEl) {
      entrance.from(Array.from(navEl.children) as HTMLElement[], {
        opacity:  0,
        y:        8,
        duration: 0.3,
        stagger:  0.05,
        ease:     'power2.out',
      }, 0.35)
    }
  }

  // ── Transition ────────────────────────────────────────────────────────────

  /**
   * Entry point for instructor navigation.
   *
   * If a transition is running, the new target is stored as _pendingIndex
   * (replacing any previously queued target). It fires when the current
   * transition completes. If the user clicks the already-active instructor
   * mid-animation, the pending navigation is cancelled.
   */
  private _goTo(targetIndex: number): void {
    if (!this._hasEntered) { return }
    if (targetIndex === this._activeIndex) {
      this._pendingIndex = null  // cancel any queued navigation
      return
    }
    if (this._timeline !== null) {
      this._pendingIndex = targetIndex
      return
    }
    this._runTransition(targetIndex)
  }

  /**
   * Builds and runs the master instructor-switch timeline.
   *
   * Four sub-timelines chain strictly in sequence via '>':
   *   exitTl  → shiftTl → morphTl → contentTl
   *
   * No phase begins before the previous one completes. This eliminates
   * visual ambiguity about which instructor is entering vs exiting.
   */
  private _runTransition(targetIndex: number): void {
    const prevIndex   = this._activeIndex
    this._activeIndex = targetIndex

    // ARIA updates immediately — keyboard users get instant feedback
    this._updateARIA(prevIndex, targetIndex)

    const prevSlot = this._slots[prevIndex]
    const nextSlot = this._slots[targetIndex]
    if (!prevSlot || !nextSlot || !this._viewportEl) { return }

    const CW            = cardWidth()
    const vw            = this._viewportEl.offsetWidth
    const cardLeft      = (vw - CW) / 2
    const circleCenterX = cardLeft + (CW - CIRCLE_SIZE) / 2

    // ── Collect elements ──────────────────────────────────────────────────────
    const prevCard   = prevSlot.querySelector<HTMLElement>('[data-card]')
    const prevAvatar = prevSlot.querySelector<HTMLElement>('[data-avatar]')
    const prevRing   = prevSlot.querySelector<HTMLElement>('[data-ring]')

    const nextCard   = nextSlot.querySelector<HTMLElement>('[data-card]')
    const nextAvatar = nextSlot.querySelector<HTMLElement>('[data-avatar]')
    const nextRing   = nextSlot.querySelector<HTMLElement>('[data-ring]')
    const nextNameEl  = nextSlot.querySelector<HTMLElement>('[data-iname]')
    const nextRankEl  = nextSlot.querySelector<HTMLElement>('[data-rank]')
    const nextTitleEl = nextSlot.querySelector<HTMLElement>('[data-ititle]')
    const nextBioEl   = nextSlot.querySelector<HTMLElement>('[data-bio]')
    const nextLearnEl = nextSlot.querySelector<HTMLElement>('[data-learn-more]')

    if (!prevCard || !prevAvatar || !prevRing || !nextCard || !nextAvatar || !nextRing) { return }
    if (!nextNameEl || !nextRankEl || !nextTitleEl || !nextBioEl) { return }

    // Reset incoming elements to their pre-entrance state
    gsap.set([nextNameEl, nextRankEl, nextTitleEl, nextBioEl], { opacity: 0, y: 14 })
    if (nextLearnEl) { gsap.set(nextLearnEl, { opacity: 0, y: 14 }) }
    gsap.set(nextCard,   { opacity: 0 })
    gsap.set(nextAvatar, { opacity: 1 })
    gsap.set(nextRing,   { opacity: 0.5 })

    // ── Phase 1 — Exit (~0.25s) ───────────────────────────────────────────────
    // Text exits in reverse entrance order: CTA → bio → title → belt → name.
    // Elements slide DOWN (y: 0→14) — mirroring the entrance direction.
    // Card then collapses to a circle at the same center point it occupied as a card.
    const exitTl = this._buildExitTl(prevSlot, prevCard, prevAvatar, prevRing, cardLeft, CW)

    // ── Phase 2 — Strip shift (~0.30s) ────────────────────────────────────────
    // All slots slide to their new x positions. Direction (left/right) is
    // determined by slotX(): going to a higher index shifts left, lower shifts right.
    // Target slot parks its circle at the card center so Phase 3 can expand from there.
    const shiftTl = gsap.timeline({ paused: true })
    this._slots.forEach((slot, i) => {
      shiftTl.to(slot, {
        x:        i === targetIndex ? circleCenterX : slotX(i, targetIndex, vw),
        y:        CIRCLE_TOP,
        duration: D_SHIFT,
        ease:     'power3.inOut',
      }, 0)
    })

    // ── Phase 3 — Morph circle → card (~0.25s) ────────────────────────────────
    // fromTo guarantees correct start values after the shift.
    // x and y animate alongside width/height so the center stays fixed:
    //   center-x = cardLeft + CW/2  (constant)
    //   center-y = CARD_HEIGHT/2    (constant)
    const morphTl = gsap.timeline({ paused: true })
    morphTl.fromTo(nextSlot,
      { x: circleCenterX, y: CIRCLE_TOP, width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: '50%' },
      { x: cardLeft, y: 0, width: CW, height: CARD_HEIGHT, borderRadius: '1rem', duration: D_MORPH, ease: 'power3.out' },
      0
    )
    morphTl.fromTo(nextAvatar, { opacity: 1 }, { opacity: 0, duration: 0.14, ease: 'power2.in' }, 0)
    morphTl.fromTo(nextRing,   { opacity: 0.5 }, { opacity: 0, duration: 0.12 }, 0)
    morphTl.to(nextCard, {
      opacity:  1,
      duration: 0.14,
      ease:     'power2.out',
      onStart:  () => { nextCard.removeAttribute('aria-hidden') },
    }, 0.10)

    // ── Phase 4 — Content reveal (staggered) ─────────────────────────────────
    // Name enters first, then belt, title, bio, optional CTA.
    // Delays per spec: 0.05 / 0.08 / 0.12 / 0.16 / 0.20
    const contentTl = this._buildContentTl(
      nextNameEl, nextRankEl, nextTitleEl, nextBioEl, nextLearnEl
    )

    // ── Master timeline: phases chain strictly in sequence ────────────────────
    const master = gsap.timeline({
      onComplete: () => {
        this._timeline = null
        if (this._pendingIndex !== null) {
          const pending = this._pendingIndex
          this._pendingIndex = null
          this._runTransition(pending)
        }
      },
    })
    this._timeline = master

    master.add(exitTl)
    master.add(shiftTl,   '>')
    master.add(morphTl,   '>')
    master.add(contentTl, '>')
  }

  /** Builds the Phase 1 exit sub-timeline (~0.25s). */
  private _buildExitTl(
    slot:    HTMLElement,
    card:    HTMLElement,
    avatar:  HTMLElement,
    ring:    HTMLElement,
    cardLeft: number,
    CW:       number,
  ): gsap.core.Timeline {
    const circleCenterX = cardLeft + (CW - CIRCLE_SIZE) / 2

    // Exit elements in reverse entrance order: CTA → bio → title → belt → name
    const exitEls = [
      slot.querySelector<HTMLElement>('[data-learn-more]'),
      slot.querySelector<HTMLElement>('[data-bio]'),
      slot.querySelector<HTMLElement>('[data-ititle]'),
      slot.querySelector<HTMLElement>('[data-rank]'),
      slot.querySelector<HTMLElement>('[data-iname]'),
    ].filter((el): el is HTMLElement => el !== null)

    const tl = gsap.timeline({ paused: true })

    // Text slides DOWN (y: 0→14) — reverse of entrance direction
    if (exitEls.length > 0) {
      tl.to(exitEls, {
        opacity:  0,
        y:        14,
        duration: 0.08,
        stagger:  0.02,
        ease:     'power2.in',
      }, 0)
    }

    // Card background fades
    tl.to(card, {
      opacity:    0,
      duration:   0.07,
      ease:       'power1.in',
      onComplete: () => { card.setAttribute('aria-hidden', 'true') },
    }, 0.10)

    // Slot collapses to circle at the same center-point (mirror of morph expand)
    tl.fromTo(slot,
      { x: cardLeft, y: 0, width: CW, height: CARD_HEIGHT, borderRadius: '1rem' },
      { x: circleCenterX, y: CIRCLE_TOP, width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: '50%', duration: 0.12, ease: 'expo.inOut' },
      0.13
    )
    tl.to(avatar, { opacity: 1, duration: 0.09, ease: 'power2.out' }, 0.18)
    tl.to(ring,   { opacity: 0.5, duration: 0.07 }, 0.18)

    return tl
  }

  /** Builds the Phase 4 content reveal sub-timeline. */
  private _buildContentTl(
    nameEl:   HTMLElement,
    rankEl:   HTMLElement,
    titleEl:  HTMLElement,
    bioEl:    HTMLElement,
    learnEl:  HTMLElement | null,
  ): gsap.core.Timeline {
    const tl = gsap.timeline({ paused: true })
    // Delays per spec: name 0.05, belt 0.08, description 0.12, CTA 0.16
    tl.to(nameEl,  { opacity: 1, y: 0, duration: 0.22, ease: 'power3.out' }, 0.05)
    tl.to(rankEl,  { opacity: 1, y: 0, duration: 0.20, ease: 'power3.out' }, 0.08)
    tl.to(titleEl, { opacity: 1, y: 0, duration: 0.18, ease: 'power3.out' }, 0.12)
    tl.to(bioEl,   { opacity: 1, y: 0, duration: 0.18, ease: 'power3.out' }, 0.16)
    if (learnEl) {
      tl.to(learnEl, { opacity: 1, y: 0, duration: 0.16, ease: 'power3.out' }, 0.20)
    }
    return tl
  }

  // ── ARIA / tabindex ───────────────────────────────────────────────────────

  private _updateARIA(prevIndex: number, nextIndex: number): void {
    this._navBtns[prevIndex]?.setAttribute('aria-pressed', 'false')
    this._navBtns[nextIndex]?.setAttribute('aria-pressed', 'true')
    this._slots[prevIndex]?.setAttribute('aria-expanded', 'false')
    this._slots[nextIndex]?.setAttribute('aria-expanded', 'true')
    this._slots[prevIndex]?.setAttribute('tabindex', '-1')
    this._slots[nextIndex]?.setAttribute('tabindex', '0')

    // Keep learn-more link focusable only when its card is active
    const prevLearn = this._slots[prevIndex]?.querySelector<HTMLElement>('[data-learn-more]')
    const nextLearn = this._slots[nextIndex]?.querySelector<HTMLElement>('[data-learn-more]')
    if (prevLearn) { prevLearn.setAttribute('tabindex', '-1') }
    if (nextLearn) { nextLearn.setAttribute('tabindex', '0') }
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
      slot.addEventListener('click', () => { this._goTo(i) })
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
        gsap.to(slot,   { scale: 1.1, duration: 0.2,  ease: 'power2.out' })
        if (ringEl) { gsap.to(ringEl, { opacity: 1,   duration: 0.18 }) }
      })

      slot.addEventListener('pointerleave', () => {
        if (i === this._activeIndex) { return }
        gsap.to(slot,   { scale: 1,   duration: 0.25, ease: 'power2.inOut' })
        if (ringEl) { gsap.to(ringEl, { opacity: 0.5, duration: 0.2 }) }
      })
    })
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  private _onResize = (): void => {
    if (this._resizeTimer !== null) { clearTimeout(this._resizeTimer) }
    this._resizeTimer = setTimeout(() => {
      if (!this._hasEntered || !this._viewportEl) { return }
      const vw = this._viewportEl.offsetWidth
      const CW = cardWidth()
      this._slots.forEach((slot, i) => {
        const isActive = i === this._activeIndex
        gsap.set(slot, {
          x:      slotX(i, this._activeIndex, vw),
          y:      isActive ? 0 : CIRCLE_TOP,
          width:  isActive ? CW : CIRCLE_SIZE,
          height: isActive ? CARD_HEIGHT : CIRCLE_SIZE,
        })
      })
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
