/**
 * ojj-review-card — Google review card with star rating and source badge.
 * Uses Shadow DOM for style encapsulation.
 *
 * Attributes:
 *   author    — reviewer name
 *   rating    — 1–5 (default: 5)
 *   date      — relative date string (e.g. "3 months ago")
 *   text      — review body text
 *   truncated — boolean; shows "Read full review on Google" link when present
 */

import { BaseElement } from '../base/BaseElement'

const GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=oregon+jiu+jitsu+lab'

export class OJJReviewCard extends BaseElement {
  static observedAttributes = ['author', 'rating', 'date', 'text', 'truncated']

  private _shadow: ShadowRoot

  constructor() {
    super()
    this._shadow = this.attachShadow({ mode: 'open' })
  }

  protected render(): void {
    const author = this.getAttribute('author') ?? 'Anonymous'
    const rating = Math.min(5, Math.max(1, parseInt(this.getAttribute('rating') ?? '5', 10)))
    const date = this.getAttribute('date') ?? ''
    const text = this.getAttribute('text') ?? ''
    const truncated = this.hasAttribute('truncated')

    const stars = Array.from({ length: 5 }, (_, i) =>
      `<span class="${i < rating ? 'star filled' : 'star'}" aria-hidden="true">★</span>`
    ).join('')

    this._shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }

        /*
         * height: 100% resolves because the grid layout algorithm establishes
         * a definite block size on :host via align-self: stretch.
         */
        .card {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.75rem;
          background: #1a1a2e;
          border: 1px solid #404040;
          border-radius: 0.75rem;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stars {
          display: flex;
          gap: 2px;
          line-height: 1;
        }

        .star {
          font-size: 1.125rem;
          color: #374151;
        }

        .star.filled {
          color: #f59e0b;
        }

        .google-badge {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #6b7280;
          text-transform: uppercase;
        }

        blockquote {
          flex: 1;
          margin: 0;
        }

        .text {
          font-size: 0.95rem;
          color: #d1d5db;
          line-height: 1.7;
          font-style: italic;
          margin: 0;
        }

        .read-more {
          display: inline-block;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #4285f4;
          text-decoration: none;
          font-style: normal;
        }

        .read-more:hover {
          text-decoration: underline;
        }

        .author {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .author-name {
          font-weight: 700;
          color: #f9fafb;
          font-size: 0.9rem;
        }

        .author-date {
          font-size: 0.8rem;
          color: #6b7280;
        }
      </style>

      <article class="card">
        <div class="header">
          <div class="stars" role="img" aria-label="${rating} out of 5 stars">${stars}</div>
          <span class="google-badge" aria-label="Google Review">Google</span>
        </div>

        ${text ? `
        <blockquote>
          <p class="text">${text}</p>
          ${truncated ? `
          <a
            class="read-more"
            href="${GOOGLE_SEARCH_URL}"
            target="_blank"
            rel="noopener noreferrer"
          >Read full review on Google ↗</a>
          ` : ''}
        </blockquote>
        ` : ''}

        <footer class="author">
          <span class="author-name">— ${author}</span>
          ${date ? `<span class="author-date">${date}</span>` : ''}
        </footer>
      </article>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-review-card', OJJReviewCard)
