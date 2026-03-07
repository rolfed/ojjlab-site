/**
 * ojj-instructors-section — Meet the Team grid with circle → card entrance.
 *
 * Motion-enabled: 5 instructor portraits in a responsive grid. On scroll-into-view,
 * each card plays a staggered 5-phase animation:
 *   1. Circle pops in (scale from 0, back.out ease)
 *   2. Circle expands to portrait card (borderRadius 50% → 1rem, height grows)
 *   3. Name reveals (fade + slide up)
 *   4. Belt · role reveals (fade + slide up)
 *   5. Bio body expands (height 0 → auto)
 *
 * Reduced-motion (data-reduce-motion on <html>): static 5-col grid using
 * ojj-instructor-card elements with AnimatableMixin scrollReveal stagger.
 */

import gsap from 'gsap'
import { AnimatableMixin } from '../../animations/mixin'
import { BaseElement } from '../base/BaseElement'

type Belt = 'black' | 'brown' | 'purple' | 'blue'

const INSTRUCTORS: Array<{ name: string; belt: Belt; title: string; bio: string }> = [
  {
    name: 'Adam Fox',
    belt: 'black',
    title: 'Program Director & Head Coach',
    bio: 'Black belt with extensive competition and coaching experience. Adam leads the overall curriculum and fosters a disciplined, welcoming environment for students at every level.',
  },
  {
    name: 'Danniel Rolfe',
    belt: 'black',
    title: 'Coach',
    bio: 'Dedicated black belt coach with deep technical knowledge of BJJ fundamentals and advanced guard work. Brings patience and precision to every class.',
  },
  {
    name: 'Raymon Herrera',
    belt: 'brown',
    title: 'Gym Manager',
    bio: "Keeps OJJ Lab running smoothly while staying active on the mats. Raymon is the welcoming face that makes every new student feel at home from day one.",
  },
  {
    name: 'Justin Miciel',
    belt: 'blue',
    title: 'Wrestling Coach',
    bio: "Experienced wrestler bringing elite takedown fundamentals to the gym. Justin's wrestling program adds a critical dimension to every student's grappling game.",
  },
  {
    name: 'Justin Koreis',
    belt: 'blue',
    title: 'Kickboxing Instructor',
    bio: "High-energy striking coach with a background in Muay Thai and boxing. Justin's kickboxing classes build cardio, coordination, and real stand-up self-defense skills.",
  },
]

const BELT_ACCENT: Record<Belt, string> = {
  black: '#4a4a4a',
  brown: '#a0522d',
  purple: '#7c3aed',
  blue: '#2563eb',
}

const BELT_GRADIENT: Record<Belt, string> = {
  black: 'linear-gradient(160deg, #111111 0%, #1c1c1c 50%, #0a0a0a 100%)',
  brown: 'linear-gradient(160deg, #1a0e07 0%, #2d1b0f 50%, #110a04 100%)',
  purple: 'linear-gradient(160deg, #120920 0%, #1e1030 50%, #0a0513 100%)',
  blue: 'linear-gradient(160deg, #060d1a 0%, #0c1e3a 50%, #040a14 100%)',
}

/** Diameter (px) of circle stage before card expand. */
const CIRCLE_SIZE = 88

export class OJJInstructorsSection extends AnimatableMixin(BaseElement) {
  private _cardEls: HTMLElement[] = []
  private _hasEntered = false
  private _entranceObserver: IntersectionObserver | null = null

  protected render(): void {
    this.innerHTML = `
      <section aria-label="Meet Your Instructors" class="bg-neutral-950 py-16">
        <div class="text-center mb-12 px-4">
          <h2 class="font-heading text-3xl sm:text-4xl font-black text-white mb-4">Meet Your Instructors</h2>
          <p class="text-neutral-400 text-lg max-w-2xl mx-auto">World-class coaches dedicated to your growth on and off the mat.</p>
        </div>
        <div data-cards-grid
             class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 max-w-7xl mx-auto">
        </div>
      </section>
    `
  }

  protected override bindEvents(): void {
    const reducedMotion = document.documentElement.hasAttribute('data-reduce-motion')
    if (reducedMotion) {
      this.renderReducedMotion()
      return
    }

    const grid = this.querySelector<HTMLElement>('[data-cards-grid]')
    if (!grid) { return }

    this.buildCards(grid)
    this.initEntranceObserver(grid)
  }

  private buildCards(container: HTMLElement): void {
    this._cardEls = []

    INSTRUCTORS.forEach(({ name, belt, title, bio }) => {
      const accent    = BELT_ACCENT[belt]
      const gradient  = BELT_GRADIENT[belt]
      const initial   = name.charAt(0).toUpperCase()
      const beltLabel = belt.charAt(0).toUpperCase() + belt.slice(1)

      // Grid cell — flex-centered so the circle sits in the middle while expanding
      const cell = document.createElement('div')
      cell.style.cssText = 'display:flex;justify-content:center;align-items:flex-start;'

      const card = document.createElement('div')
      card.setAttribute('data-card', '')
      card.style.cssText = [
        'position:relative',
        'overflow:hidden',
        'border-radius:1rem',
        'background:#111',
        'border:1px solid #222',
        'width:100%',
      ].join(';')

      card.innerHTML = `
        <div data-belt-stripe style="
          position:absolute;left:0;top:0;bottom:0;width:4px;z-index:2;opacity:0;
          background:${accent};box-shadow:2px 0 16px ${accent}80;
        "></div>

        <div data-portrait style="
          position:relative;overflow:hidden;aspect-ratio:4/5;
          background:${gradient};
        ">
          <div aria-hidden="true" style="
            position:absolute;inset:0;
            display:flex;align-items:center;justify-content:center;
            font-size:13rem;font-weight:900;
            color:rgba(255,255,255,0.035);
            line-height:1;user-select:none;
          ">${initial}</div>

          <div data-portrait-fade style="
            position:absolute;bottom:0;left:0;right:0;height:65%;opacity:0;
            background:linear-gradient(to top,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.6) 40%,transparent 100%);
          "></div>

          <div style="position:absolute;bottom:0;left:0;right:0;padding:1.25rem 1.5rem;z-index:1;">
            <h3 data-iname style="
              font-size:1.1rem;font-weight:800;color:#fff;
              margin:0 0 0.2rem;line-height:1.2;
              opacity:0;transform:translateY(8px);
            ">${name}</h3>
            <p data-irole style="
              font-size:0.7rem;font-weight:700;
              text-transform:uppercase;letter-spacing:0.07em;
              margin:0;color:${accent};
              opacity:0;transform:translateY(8px);
            ">${beltLabel} Belt · ${title}</p>
          </div>
        </div>

        <div data-ibio style="border-top:1px solid #1e1e1e;overflow:hidden;height:0;opacity:0;">
          <p style="padding:1.25rem 1.5rem;font-size:0.875rem;color:#888;line-height:1.65;margin:0;">${bio}</p>
        </div>
      `

      cell.appendChild(card)
      this._cardEls.push(card)
      container.appendChild(cell)
    })
  }

  /**
   * 5-phase staggered entrance: circle pop → card expand → name → role → bio.
   * Cards are staggered by STAGGER_DELAY so they cascade left to right.
   */
  private playEntranceAnimation(): void {
    const STAGGER_DELAY = 0.14

    this._cardEls.forEach((card, i) => {
      const beltStripe   = card.querySelector<HTMLElement>('[data-belt-stripe]')!
      const portraitFade = card.querySelector<HTMLElement>('[data-portrait-fade]')!
      const iname        = card.querySelector<HTMLElement>('[data-iname]')!
      const irole        = card.querySelector<HTMLElement>('[data-irole]')!
      const ibio         = card.querySelector<HTMLElement>('[data-ibio]')!

      // Measure natural (CSS-determined) width before we override with circle size
      const naturalWidth = card.getBoundingClientRect().width || 200

      // Phase 0: set circle state
      gsap.set(card, {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: '50%',
        scale: 0,
        opacity: 0,
      })

      const tl = gsap.timeline({ delay: i * STAGGER_DELAY })

      // Phase 1: circle pops in
      tl.to(card, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(2)',
      })

      // Phase 2: expand from circle → portrait card
      tl.to(card, {
        width: naturalWidth,
        height: naturalWidth * 1.25, // 4:5 portrait ratio
        borderRadius: '1rem',
        duration: 0.65,
        ease: 'power3.inOut',
      }, '+=0.08')

      tl.to([portraitFade, beltStripe], {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.3')

      // Phase 3: name reveals
      tl.to(iname, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.15')

      // Phase 4: role reveals
      tl.to(irole, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.15')

      // Phase 5: bio expands — clear fixed height first so card grows naturally
      tl.set(card, { clearProps: 'height' })
      tl.to(ibio, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      })
    })
  }

  private initEntranceObserver(grid: HTMLElement): void {
    this._entranceObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !this._hasEntered) {
          this._hasEntered = true
          this._entranceObserver?.disconnect()
          this._entranceObserver = null
          this.playEntranceAnimation()
        }
      },
      { threshold: 0.15 }
    )
    this._entranceObserver.observe(grid)
  }

  private renderReducedMotion(): void {
    const cards = INSTRUCTORS.map(({ name, belt, title, bio }) => `
      <ojj-instructor-card
        name="${name}"
        belt="${belt}"
        title="${title}"
        bio="${bio}"
      ></ojj-instructor-card>
    `).join('')

    this.innerHTML = `
      <section aria-label="Meet Your Instructors" class="bg-neutral-950 py-16 px-4">
        <div class="text-center mb-10">
          <h2 class="font-heading text-3xl sm:text-4xl font-black text-white mb-4">Meet Your Instructors</h2>
          <p class="text-neutral-400 text-lg max-w-2xl mx-auto">World-class coaches dedicated to your growth on and off the mat.</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
          ${cards}
        </div>
      </section>
    `
    const els = this.querySelectorAll<HTMLElement>('ojj-instructor-card')
    this.scrollReveal(Array.from(els), 'stagger')
  }

  protected override cleanup(): void {
    this._entranceObserver?.disconnect()
    this._entranceObserver = null
    super.cleanup()
  }
}

customElements.define('ojj-instructors-section', OJJInstructorsSection)
