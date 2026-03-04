/**
 * src/main.ts — shared entry point for all pages.
 *
 * Initialises GSAP plugins and reducedMotion config BEFORE
 * component scripts execute their connectedCallback logic.
 * Import this module first in every HTML page's <script type="module">.
 */

import { initAnimations } from '@/animations/animate'
import '@/components/index'

initAnimations()
