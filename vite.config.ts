import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin, ViteDevServer } from 'vite'
import { mkdirSync, renameSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = import.meta.dirname

/**
 * Dev server URL rewriter: serves src/pages/*.html at their production URLs.
 * e.g. GET /about/ → serves /src/pages/about.html
 */
function mpaDevRewrite(): Plugin {
  const rewrites: Record<string, string> = {
    '/':          '/src/pages/home.html',
    '/about/':    '/src/pages/about.html',
    '/schedule/': '/src/pages/schedule.html',
    '/programs/': '/src/pages/programs.html',
    '/shop/':     '/src/pages/shop.html',
    '/login/':    '/src/pages/login.html',
    '/reviews/':                  '/src/pages/reviews.html',
    '/contact/':                  '/src/pages/contact.html',
    '/book-trial/':               '/src/pages/book-trial.html',
    '/trial-class-next-steps/':   '/src/pages/trial-class-next-steps.html',
    '/instructors/adam/':         '/src/pages/instructors/adam.html',
    '/instructors/danniel/':      '/src/pages/instructors/danniel.html',
  }
  return {
    name: 'mpa-dev-rewrite',
    apply: 'serve',
    configureServer(server: ViteDevServer): void {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '/'
        const clean = url.endsWith('/') ? url : `${url}/`
        const rewrite = rewrites[clean]
        if (rewrite) { req.url = rewrite }
        next()
      })
    },
  }
}

/**
 * Build output rewriter: Vite preserves source paths (src/pages/about.html →
 * dist/src/pages/about.html). This plugin moves each file to its correct
 * deployment location (dist/about/index.html) after the build finishes.
 */
function mpaBuildRewrite(): Plugin {
  const outDir = join(root, 'dist')
  const moves: [string, string][] = [
    ['src/pages/home.html',     'index.html'],
    ['src/pages/about.html',    'about/index.html'],
    ['src/pages/schedule.html', 'schedule/index.html'],
    ['src/pages/programs.html', 'programs/index.html'],
    ['src/pages/shop.html',     'shop/index.html'],
    ['src/pages/login.html',    'login/index.html'],
    ['src/pages/reviews.html',  'reviews/index.html'],
    ['src/pages/contact.html',               'contact/index.html'],
    ['src/pages/book-trial.html',            'book-trial/index.html'],
    ['src/pages/trial-class-next-steps.html',       'trial-class-next-steps/index.html'],
    ['src/pages/instructors/adam.html',             'instructors/adam/index.html'],
    ['src/pages/instructors/danniel.html',          'instructors/danniel/index.html'],
    ['src/pages/404.html',                          '404.html'],
  ]
  return {
    name: 'mpa-build-rewrite',
    apply: 'build',
    closeBundle(): void {
      for (const [from, to] of moves) {
        const src = join(outDir, from)
        const dest = join(outDir, to)
        mkdirSync(dirname(dest), { recursive: true })
        renameSync(src, dest)
      }
      // Remove the now-empty src/ subtree from dist/
      rmSync(join(outDir, 'src'), { recursive: true, force: true })
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), mpaDevRewrite(), mpaBuildRewrite()],
  resolve: {
    alias: {
      '@': `${root}/src`,
    },
  },
  build: {
    rollupOptions: {
      input: {
        home:             `${root}/src/pages/home.html`,
        'about/index':    `${root}/src/pages/about.html`,
        'schedule/index': `${root}/src/pages/schedule.html`,
        'programs/index': `${root}/src/pages/programs.html`,
        'shop/index':     `${root}/src/pages/shop.html`,
        'login/index':    `${root}/src/pages/login.html`,
        'reviews/index':  `${root}/src/pages/reviews.html`,
        'contact/index':                `${root}/src/pages/contact.html`,
        'book-trial/index':             `${root}/src/pages/book-trial.html`,
        'trial-class-next-steps/index':  `${root}/src/pages/trial-class-next-steps.html`,
        'instructors/adam/index':        `${root}/src/pages/instructors/adam.html`,
        'instructors/danniel/index':     `${root}/src/pages/instructors/danniel.html`,
        '404':                           `${root}/src/pages/404.html`,
      },
    },
  },
})
