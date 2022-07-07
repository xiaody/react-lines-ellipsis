import { defineConfig } from 'vite'

export default defineConfig({
  root: './docs-src',
  server: {
    port: 2001
  },
  build: {
    outDir: '../docs'
  }
})
