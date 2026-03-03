import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const root = import.meta.dirname

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': `${root}/src`,
    },
  },
  build: {
    rollupOptions: {
      input: {
        home: `${root}/index.html`,
        about: `${root}/about/index.html`,
        schedule: `${root}/schedule/index.html`,
        programs: `${root}/programs/index.html`,
        shop: `${root}/shop/index.html`,
        login: `${root}/login/index.html`,
        '404': `${root}/404.html`,
      },
    },
  },
})
