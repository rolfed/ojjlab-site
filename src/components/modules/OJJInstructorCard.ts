/**
 * ojj-instructor-card — instructor profile card with photo, name, belt, and bio.
 * Uses Shadow DOM for style encapsulation.
 *
 * Attributes:
 *   name    — instructor full name
 *   belt    — belt color: 'black' | 'brown' | 'purple' | 'blue'
 *   title   — role/title (e.g. "Head Instructor")
 *   bio     — short biography
 *   photo   — image src URL (uses placeholder if omitted)
 */

import { BaseElement } from '../base/BaseElement'

type Belt = 'black' | 'brown' | 'purple' | 'blue'

const BELT_COLORS: Record<Belt, string> = {
  black: '#0a0a0a',
  brown: '#7c3d1a',
  purple: '#5b21b6',
  blue: '#1d4ed8',
}

export class OJJInstructorCard extends BaseElement {
  static observedAttributes = ['name', 'belt', 'title', 'bio', 'photo']

  private _shadow: ShadowRoot

  constructor() {
    super()
    this._shadow = this.attachShadow({ mode: 'open' })
  }

  protected render(): void {
    const name = this.getAttribute('name') ?? 'Instructor'
    const belt = (this.getAttribute('belt') ?? 'black') as Belt
    const role = this.getAttribute('title') ?? 'Instructor'
    const bio = this.getAttribute('bio') ?? ''
    const photo = this.getAttribute('photo')
    const beltColor = BELT_COLORS[belt] ?? BELT_COLORS.black

    const photoEl = photo
      ? `<img src="${photo}" alt="${name}" class="photo" />`
      : `<div class="photo-placeholder" aria-hidden="true">${name.charAt(0)}</div>`

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: #1a1a2e;
          border: 1px solid #404040;
          border-radius: 1rem;
          overflow: hidden;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .photo, .photo-placeholder {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photo-placeholder {
          background: linear-gradient(135deg, #1a1a2e, #2d2d4e);
          font-size: 5rem;
          font-weight: 900;
          color: rgba(255,255,255,0.2);
        }
        .body { padding: 1.5rem; }
        .belt-bar {
          height: 6px;
          width: 100%;
          background: var(--belt-color);
          margin-bottom: 1rem;
          border-radius: 3px;
        }
        .name {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.25rem;
        }
        .role {
          font-size: 0.85rem;
          color: #e63946;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1rem;
        }
        .bio {
          font-size: 0.9rem;
          color: #a3a3a3;
          line-height: 1.6;
          margin: 0;
        }
      </style>
      <article class="card">
        ${photoEl}
        <div class="body">
          <div class="belt-bar" style="--belt-color: ${beltColor}"></div>
          <h3 class="name">${name}</h3>
          <p class="role">${belt.charAt(0).toUpperCase() + belt.slice(1)} Belt · ${role}</p>
          ${bio ? `<p class="bio">${bio}</p>` : ''}
        </div>
      </article>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-instructor-card', OJJInstructorCard)
