/**
 * ojj-instructors-section — Instructor spotlight carousel.
 *
 * Architecture: slots are absolutely positioned inside a fixed-height viewport.
 * No flex track, no translateX — all motion via x/y CSS transforms (GPU only).
 * A single master GSAP timeline drives each transition so _isAnimating unlocks
 * at the correct moment (no detached child timelines).
 *
 * Transition choreography (per user spec):
 *   1. Circle → rectangle morph (all slots reposition simultaneously)
 *   2. Name slides in from the left with a fade
 *   3. Rank (belt label) slides in
 *   4. Title (role) slides in
 *   5. Bio / description slides in
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
    bio:   "Experienced wrestler bringing takedown fundamentals to the gym. Jacob's wrestling program adds a critical dimension to every student's grappling game.",
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

/** Width (px) of the expanded card — capped for narrow viewports. */
function cardWidth(): number {
  return Math.min(300, window.innerWidth - 80)
}

/**
 * Computes the CSS `x` (translateX) for slot `i` given the current active index.
 * The active card is always horizontally centered in the viewport.
 * Inactive circles stack outward from the card's edges.
 */
function slotX(i: number, activeIndex: number, viewportWidth: number): number {
  const CW       = cardWidth()
  const cardLeft = (viewportWidth - CW) / 2
  if (i === activeIndex) return cardLeft
  if (i < activeIndex) {
    return cardLeft - (activeIndex - i) * (CIRCLE_SIZE + SLOT_GAP)
  }
  return cardLeft + CW + SLOT_GAP + (i - activeIndex - 1) * (CIRCLE_SIZE + SLOT_GAP)
}

export class OJJInstructorsSection extends AnimatableMixin(BaseElement) {
  private _activeIndex  = 0
  private _isAnimating  = false
  private _hasEntered   = false
  private _st:          ScrollTrigger | null = null
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
    const beltLabel = inst.belt === 'na'
      ? ''
      : `${inst.belt.charAt(0).toUpperCase()}${inst.belt.slice(1)} Belt`

    return `
      <div
        class="spotlight-slot"
        data-slot
        data-index="${String(i)}"
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

            <!-- Name + rank overlay — staggered in individually -->
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
    this._st?.kill()
    this._st = null
    super.cleanup()
  }

  // ── Initialization ───────────────────────────────────────────────────────

  /**
   * Set every slot to its pre-entrance state using absolute positioning.
   * Slots use x/y transforms for motion (GPU only — no layout reflow).
   * Width/height animate for the circle↔card morph.
   */
  private _initSlotStates(): void {
    if (!this._viewportEl) { return }
    const vw = this._viewportEl.offsetWidth
    const CW = cardWidth()

    this._slots.forEach((slot, i) => {
      const isActive = i === 0
      const avatarEl = slot.querySelector<HTMLElement>('[data-avatar]')
      const ringEl   = slot.querySelector<HTMLElement>('[data-ring]')
      const cardEl   = slot.querySelector<HTMLElement>('[data-card]')
      const rankEl   = slot.querySelector<HTMLElement>('[data-rank]')
      const nameEl   = slot.querySelector<HTMLElement>('[data-iname]')
      const titleEl  = slot.querySelector<HTMLElement>('[data-ititle]')
      const bioEl    = slot.querySelector<HTMLElement>('[data-bio]')
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
      gsap.set([nameEl, rankEl, titleEl, bioEl], { opacity: 0, x: -20 })

      // Expose card content for screen readers on the default active slot
      if (isActive) {
        cardEl.removeAttribute('aria-hidden')
      }
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
      onEnter: () => { this._playEntrance(); },
    })
  }

  private _playEntrance(): void {
    if (this._hasEntered) { return }
    this._hasEntered  = true
    this._isAnimating = true

    const headerEl   = this.querySelector<HTMLElement>('[data-header]')
    const navEl      = this.querySelector<HTMLElement>('[data-nav]')
    const activeSlot = this._slots[0]
    if (!activeSlot) { this._isAnimating = false; return }
    const nameEl     = activeSlot.querySelector<HTMLElement>('[data-iname]')
    const rankEl     = activeSlot.querySelector<HTMLElement>('[data-rank]')
    const titleEl    = activeSlot.querySelector<HTMLElement>('[data-ititle]')
    const bioEl      = activeSlot.querySelector<HTMLElement>('[data-bio]')
    if (!nameEl || !rankEl || !titleEl || !bioEl) { this._isAnimating = false; return }

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

    // Active card (Adam) lifts into view
    entrance.fromTo(activeSlot,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      0.2
    )

    // Inactive circles stagger in from the right (outward from card)
    const inactiveSlots = this._slots.slice(1)
    entrance.to(inactiveSlots, {
      opacity:  1,
      duration: 0.38,
      stagger:  0.07,
      ease:     'power2.out',
    }, 0.3)

    // ── Text stagger: name → rank → title → bio ──────────────────────────
    entrance.to(nameEl,  { opacity: 1, x: 0, duration: 0.4,  ease: 'power3.out' }, 0.55)
    entrance.to(rankEl,  { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' }, 0.67)
    entrance.to(titleEl, { opacity: 1, x: 0, duration: 0.3,  ease: 'power3.out' }, 0.77)
    entrance.to(bioEl,   { opacity: 1, x: 0, duration: 0.3,  ease: 'power3.out' }, 0.87)

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
   * Drives the full instructor switch on a single master timeline.
   * All motion is coordinated so _isAnimating releases exactly when
   * the last tween completes — no detached child timelines.
   *
   * Phase 0 (t=0.00):  All slots slide to their new x/y positions.
   * Phase 0b (t=0.00): Previous card collapses to circle.
   * Phase 1 (t=0.05):  New circle expands to card.
   * Phase 2 (t=0.50+): Text staggers in: name → rank → title → bio.
   */
  private _goTo(targetIndex: number): void {
    if (this._isAnimating)                 { return }
    if (targetIndex === this._activeIndex) { return }
    if (!this._hasEntered)                 { return }

    const prevIndex   = this._activeIndex
    this._activeIndex = targetIndex
    this._isAnimating = true

    // ARIA + tabindex
    this._navBtns[prevIndex]?.setAttribute('aria-pressed', 'false')
    this._navBtns[targetIndex]?.setAttribute('aria-pressed', 'true')
    this._slots[prevIndex]?.setAttribute('aria-expanded', 'false')
    this._slots[targetIndex]?.setAttribute('aria-expanded', 'true')
    this._slots[prevIndex]?.setAttribute('tabindex', '-1')
    this._slots[targetIndex]?.setAttribute('tabindex', '0')

    const prevSlot  = this._slots[prevIndex]
    const nextSlot  = this._slots[targetIndex]
    if (!prevSlot || !nextSlot || !this._viewportEl) { this._isAnimating = false; return }
    const CW        = cardWidth()
    const vw        = this._viewportEl.offsetWidth

    const prevAvatar = prevSlot.querySelector<HTMLElement>('[data-avatar]')
    const prevRing   = prevSlot.querySelector<HTMLElement>('[data-ring]')
    const prevCard   = prevSlot.querySelector<HTMLElement>('[data-card]')
    const nextAvatar = nextSlot.querySelector<HTMLElement>('[data-avatar]')
    const nextRing   = nextSlot.querySelector<HTMLElement>('[data-ring]')
    const nextCard   = nextSlot.querySelector<HTMLElement>('[data-card]')
    const nextName   = nextSlot.querySelector<HTMLElement>('[data-iname]')
    const nextRank   = nextSlot.querySelector<HTMLElement>('[data-rank]')
    const nextTitle  = nextSlot.querySelector<HTMLElement>('[data-ititle]')
    const nextBio    = nextSlot.querySelector<HTMLElement>('[data-bio]')
    if (!prevAvatar || !prevRing || !prevCard || !nextAvatar || !nextRing || !nextCard ||
        !nextName || !nextRank || !nextTitle || !nextBio) { this._isAnimating = false; return }

    // Reset incoming text + card layer to their starting state
    gsap.set([nextName, nextRank, nextTitle, nextBio], { opacity: 0, x: -20 })
    gsap.set(nextCard,   { opacity: 0 })
    gsap.set(nextAvatar, { opacity: 1 })
    gsap.set(nextRing,   { opacity: 0.5 })

    const tl = gsap.timeline({
      onComplete: () => { this._isAnimating = false },
    })

    // ── Phase 0: All slots reposition simultaneously ───────────────── t=0.00
    this._slots.forEach((slot, i) => {
      tl.to(slot, {
        x:        slotX(i, targetIndex, vw),
        y:        i === targetIndex ? 0 : CIRCLE_TOP,
        duration: 0.55,
        ease:     'expo.inOut',
      }, 0)
    })

    // ── Phase 0b: Collapse previous card → circle ──────────────────── t=0.00
    tl.to(prevSlot, {
      width:        CIRCLE_SIZE,
      height:       CIRCLE_SIZE,
      borderRadius: '50%',
      duration:     0.55,
      ease:         'expo.inOut',
    }, 0)
    tl.to(prevCard, {
      opacity:    0,
      duration:   0.15,
      ease:       'power2.in',
      onComplete: () => { prevCard.setAttribute('aria-hidden', 'true') },
    }, 0)
    tl.to(prevAvatar, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.15)
    tl.to(prevRing,   { opacity: 0.5, duration: 0.2 }, 0.15)

    // ── Phase 1: Expand new circle → card ─────────────────────────── t=0.05
    tl.to(nextSlot, {
      width:        CW,
      height:       CARD_HEIGHT,
      borderRadius: '1rem',
      duration:     0.55,
      ease:         'expo.inOut',
    }, 0.05)
    tl.to(nextAvatar, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.05)
    tl.to(nextRing,   { opacity: 0, duration: 0.15 }, 0.05)
    // Card background visible once shape is ~50% formed
    tl.to(nextCard, {
      opacity:  1,
      duration: 0.25,
      ease:     'power2.out',
      onStart:  () => { nextCard.removeAttribute('aria-hidden') },
    }, 0.28)

    // ── Phase 2: Stagger text once shape is ~90% formed ───────────── t=0.50+
    tl.to(nextName,  { opacity: 1, x: 0, duration: 0.4,  ease: 'power3.out' }, 0.50)
    tl.to(nextRank,  { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' }, 0.62)
    tl.to(nextTitle, { opacity: 1, x: 0, duration: 0.3,  ease: 'power3.out' }, 0.72)
    tl.to(nextBio,   { opacity: 1, x: 0, duration: 0.3,  ease: 'power3.out' }, 0.82)
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
      slot.addEventListener('click', () => { this._goTo(i); })
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
        if (ringEl) { gsap.to(ringEl, { opacity: 1, duration: 0.18 }) }
      })

      slot.addEventListener('pointerleave', () => {
        if (i === this._activeIndex) { return }
        gsap.to(slot, { scale: 1, duration: 0.25, ease: 'power2.inOut' })
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
