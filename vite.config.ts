import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  base: '/',
  envDir: '../',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  }
})
