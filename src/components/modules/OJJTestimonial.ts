/**
 * ojj-testimonial — student quote card with name, belt, and quote.
 * Uses Shadow DOM for style encapsulation.
 *
 * Attributes:
 *   quote  — testimonial text
 *   author — student name
 *   belt   — belt color label (e.g. "Blue Belt")
 */

import { BaseElement } from '../base/BaseElement'

export class OJJTestimonial extends BaseElement {
  static observedAttributes = ['quote', 'author', 'belt']

  private _shadow: ShadowRoot

  constructor() {
    super()
    this._shadow = this.attachShadow({ mode: 'open' })
  }

  protected render(): void {
    const quote = this.getAttribute('quote') ?? ''
    const author = this.getAttribute('author') ?? 'Anonymous'
    const belt = this.getAttribute('belt') ?? ''

    this._shadow.innerHTML = `
      <style>
        /*
         * :host is a grid item — CSS Grid stretches it to the row height via
         * align-self: stretch (default). No explicit height needed here; the
         * grid algorithm owns the block size.
         */
        :host {
          display: block;
        }

        /*
         * height: 100% resolves correctly because :host has a definite block
         * size established by the grid layout algorithm. flex-direction: column
         * lets the quote grow to fill available space, pinning the author to
         * the bottom of every card regardless of quote length.
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

        .quote-mark {
          font-size: 4rem;
          color: #e63946;
          font-weight: 900;
          line-height: 0.7;
          user-select: none;
        }

        blockquote {
          flex: 1;
          margin: 0;
        }

        .quote {
          font-size: 0.95rem;
          color: #d4d4d4;
          line-height: 1.7;
          font-style: italic;
          margin: 0;
        }

        .author {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .author-name {
          font-weight: 700;
          color: white;
          font-size: 0.9rem;
        }

        .author-belt {
          font-size: 0.8rem;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      </style>

      <figure class="card">
        <div class="quote-mark" aria-hidden="true">"</div>
        <blockquote>
          <p class="quote">${quote}</p>
        </blockquote>
        <figcaption class="author">
          <span class="author-name">— ${author}</span>
          ${belt ? `<span class="author-belt">${belt}</span>` : ''}
        </figcaption>
      </figure>
    `
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render()
  }
}

customElements.define('ojj-testimonial', OJJTestimonial)
