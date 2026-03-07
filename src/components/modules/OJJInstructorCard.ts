/**
 * ojj-instructor-card — Cinematic portrait card.
 *
 * Design: tall portrait (4:5) with full-bleed gradient background, faint large
 * monogram, and name/role overlaid on a bottom gradient fade. Belt color as a
 * glowing left-edge stripe. Bio in the card body below.
 *
 * Attributes:
 *   name    — instructor full name
 *   belt    — belt color: 'black' | 'brown' | 'purple' | 'blue'
 *   title   — role/title (e.g. "Head Instructor")
 *   bio     — short biography
 *   photo   — image src URL (uses gradient placeholder if omitted)
 */

import { BaseElement } from '../base/BaseElement'

type Belt = 'black' | 'brown' | 'purple' | 'blue'

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

export class OJJInstructorCard extends BaseElement {
  static observedAttributes = ['name', 'belt', 'title', 'bio', 'photo']

  private _shadow: ShadowRoot

  constructor() {
    super()
    this._shadow = this.attachShadow({ mode: 'open' })
  }

  protected render(): void {
    const name      = this.getAttribute('name') ?? 'Instructor'
    const belt      = (this.getAttribute('belt') ?? 'black') as Belt
    const role      = this.getAttribute('title') ?? 'Instructor'
    const bio       = this.getAttribute('bio') ?? ''
    const photo     = this.getAttribute('photo')
    const accent    = BELT_ACCENT[belt] ?? BELT_ACCENT.black
    const gradient  = BELT_GRADIENT[belt] ?? BELT_GRADIENT.black
    const initial   = name.charAt(0).toUpperCase()
    const beltLabel = belt.charAt(0).toUpperCase() + belt.slice(1)

    const portraitMedia = photo
      ? `<img src="${photo}" alt="" class="portrait-img" />`
      : `<span class="monogram" aria-hidden="true">${initial}</span>`

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }

        .card {
          position: relative;
          background: #111;
          border: 1px solid #222;
          border-radius: 1rem;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 28px 56px rgba(0,0,0,0.6),
                      inset 0 0 0 1px rgba(255,255,255,0.06);
        }

        /* Left accent stripe */
        .belt-stripe {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: ${accent};
          box-shadow: 2px 0 16px ${accent}80;
          z-index: 2;
        }

        /* Portrait area */
        .portrait {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
        }
        .portrait-bg {
          position: absolute;
          inset: 0;
          background: ${gradient};
        }
        .portrait-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .monogram {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13rem;
          font-weight: 900;
          color: rgba(255,255,255,0.035);
          line-height: 1;
          user-select: none;
          letter-spacing: -0.05em;
        }

        /* Gradient fade from bottom of portrait */
        .portrait-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 65%;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.97) 0%,
            rgba(0,0,0,0.6) 40%,
            transparent 100%
          );
        }

        /* Name + role overlaid on portrait */
        .portrait-text {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 1.25rem 1.5rem;
          z-index: 1;
        }
        .name {
          font-family: inherit;
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 0.25rem;
          line-height: 1.2;
        }
        .role {
          font-size: 0.75rem;
          color: ${accent};
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin: 0;
        }

        /* Bio section */
        .body {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #1e1e1e;
        }
        .bio {
          font-size: 0.875rem;
          color: #888;
          line-height: 1.65;
          margin: 0;
        }
      </style>

      <article class="card">
        <div class="belt-stripe" aria-hidden="true"></div>
        <div class="portrait">
          <div class="portrait-bg" aria-hidden="true">
            ${portraitMedia}
          </div>
          <div class="portrait-fade" aria-hidden="true"></div>
          <div class="portrait-text">
            <h3 class="name">${name}</h3>
            <p class="role">${beltLabel} Belt · ${role}</p>
          </div>
        </div>
        ${bio ? `<div class="body"><p class="bio">${bio}</p></div>` : ''}
      </article>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-instructor-card', OJJInstructorCard)
