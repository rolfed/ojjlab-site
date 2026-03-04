/**
 * ojj-site-footer — site-wide footer with nav links, social icons, and copyright.
 */

import { BaseElement } from '../base/BaseElement'

export class OJJSiteFooter extends BaseElement {
  protected render(): void {
    const year = new Date().getFullYear()

    this.innerHTML = `
      <footer
        role="contentinfo"
        class="bg-neutral-950 text-neutral-400 border-t border-neutral-800"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

            <!-- Brand -->
            <div>
              <a
                href="/"
                class="inline-flex items-center gap-1 text-white font-bold text-xl mb-3 hover:text-brand-gold transition-colors"
              >
                <span class="text-brand-accent font-black">OJJ</span> Lab
              </a>
              <p class="text-sm leading-relaxed">
                Brazilian Jiu Jitsu training for adults and youth in Oregon.
                All levels welcome.
              </p>
            </div>

            <!-- Quick links -->
            <div>
              <h3 class="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h3>
              <ul class="space-y-2 text-sm">
                <li><a href="/about/" class="hover:text-white transition-colors">About</a></li>
                <li><a href="/schedule/" class="hover:text-white transition-colors">Schedule</a></li>
                <li><a href="/programs/" class="hover:text-white transition-colors">Programs</a></li>
                <li><a href="/shop/" class="hover:text-white transition-colors">Shop</a></li>
                <li><a href="/login/" class="hover:text-white transition-colors">Member Login</a></li>
              </ul>
            </div>

            <!-- CTA -->
            <div>
              <h3 class="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Get Started</h3>
              <p class="text-sm mb-4">Book your free trial class today.</p>
              <a
                href="/schedule/"
                class="inline-flex items-center gap-2 bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Book Free Trial
                <ojj-icon name="arrow-right" size="16" aria-hidden="true"></ojj-icon>
              </a>
            </div>
          </div>

          <div class="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; ${year} Oregon Jiu Jitsu Lab. All rights reserved.</p>
            <p>
              <a href="/privacy/" class="hover:text-white transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </footer>
    `
  }
}

customElements.define('ojj-site-footer', OJJSiteFooter)
