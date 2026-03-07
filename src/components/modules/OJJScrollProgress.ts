import { ScrollSmoother } from 'gsap/dist/ScrollSmoother'
import { BaseElement } from '../base/BaseElement'

export class OJJScrollProgress extends BaseElement {
  private _bar: HTMLElement | null = null
  private _rafId = 0

  private readonly _onScroll = (): void => {
    cancelAnimationFrame(this._rafId)
    this._rafId = requestAnimationFrame(() => {
      const smoother = ScrollSmoother.get()
      const pos = smoother ? smoother.scrollTop() : window.scrollY
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(1, pos / scrollable) : 0
      if (this._bar) { this._bar.style.transform = `scaleX(${progress})` }
    })
  }

  protected render(): void {
    this.innerHTML = `<div data-bar style="height:100%;background:var(--color-brand-accent);transform-origin:left center;transform:scaleX(0);will-change:transform"></div>`
    this._bar = this.querySelector<HTMLElement>('[data-bar]')
  }

  protected override bindEvents(): void {
    window.addEventListener('scroll', this._onScroll, { passive: true })
    this._onScroll()
  }

  protected override cleanup(): void {
    window.removeEventListener('scroll', this._onScroll)
    cancelAnimationFrame(this._rafId)
    super.cleanup()
  }
}

customElements.define('ojj-scroll-progress', OJJScrollProgress)
