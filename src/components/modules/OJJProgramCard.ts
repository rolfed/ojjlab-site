/**
 * ojj-program-card — individual program card with photo, title, description, and CTA.
 * Uses Shadow DOM to encapsulate styles.
 *
 * Attributes:
 *   title        — program name
 *   description  — short program description
 *   badge        — badge label (e.g. "Adults", "Youth")
 *   badge-color  — ojj-badge color attribute
 *   cta-href     — link destination (default: /programs/)
 *   cta-label    — CTA link text (default: "Learn More")
 *   accent-color — Tailwind bg class for placeholder image (default: bg-brand-primary)
 */

import { BaseElement } from '../base/BaseElement'

export class OJJProgramCard extends BaseElement {
  static observedAttributes = ['title', 'description', 'badge', 'cta-href', 'cta-label', 'accent-color']

  // Shadow DOM encapsulation for card styles
  private _shadow: ShadowRoot

  constructor() {
    super()
    this._shadow = this.attachShadow({ mode: 'open' })
  }

  protected render(): void {
    const title = this.getAttribute('title') ?? 'Program'
    const description = this.getAttribute('description') ?? ''
    const badge = this.getAttribute('badge') ?? ''
    const ctaHref = this.getAttribute('cta-href') ?? '/programs/'
    const ctaLabel = this.getAttribute('cta-label') ?? 'Learn More'
    const accentColor = this.getAttribute('accent-color') ?? '#1a1a2e'

    this._shadow.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        .card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1a1a2e;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #404040;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .card-image {
          aspect-ratio: 4/3;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 900;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          background: var(--card-accent, #1a1a2e);
        }
        .card-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .card-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #e63946;
          color: white;
          width: fit-content;
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
          line-height: 1.3;
        }
        .card-desc {
          font-size: 0.9rem;
          color: #a3a3a3;
          line-height: 1.6;
          flex: 1;
          margin: 0;
        }
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #e63946;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        .card-cta:hover { gap: 0.75rem; }
        .card-cta:focus-visible {
          outline: 3px solid #e63946;
          outline-offset: 3px;
          border-radius: 3px;
        }
      </style>
      <article class="card">
        <div class="card-image" style="--card-accent: ${accentColor}" aria-hidden="true">
          BJJ
        </div>
        <div class="card-body">
          ${badge ? `<span class="card-badge">${badge}</span>` : ''}
          <h3 class="card-title">${title}</h3>
          <p class="card-desc">${description}</p>
          <a href="${ctaHref}" class="card-cta">
            ${ctaLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </article>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-program-card', OJJProgramCard)
