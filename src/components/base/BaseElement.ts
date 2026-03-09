/**
 * BaseElement — abstract base class for all OJJ Web Components.
 *
 * Provides:
 * - reducedMotion detection (checked once at construction time)
 * - Lifecycle hooks: render(), bindEvents(), cleanup()
 * - Namespaced custom event emission via emit()
 */
export abstract class BaseElement extends HTMLElement {
  public readonly reducedMotion: boolean

  constructor() {
    super()
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  connectedCallback(): void {
    this.render()
    this.bindEvents()
  }

  disconnectedCallback(): void {
    this.cleanup()
  }

  /**
   * Render the component's DOM. Called on connectedCallback.
   * Subclasses must implement this.
   */
  protected abstract render(): void

  /**
   * Attach event listeners. Called after render().
   * Override in subclasses that need event handling.
   */
  protected bindEvents(): void {}

  /**
   * Remove event listeners and clean up side effects.
   * Called on disconnectedCallback.
   */
  protected cleanup(): void {}

  /**
   * Dispatch a namespaced custom event that bubbles across Shadow DOM boundaries.
   * Event name is automatically prefixed with "ojj:".
   */
  protected emit(eventName: string, detail?: unknown): void {
    this.dispatchEvent(
      new CustomEvent(`ojj:${eventName}`, {
        bubbles: true,
        composed: true,
        detail: detail ?? null,
      })
    )
  }
}
