import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the build works on Vercel, Netlify, and GitHub Pages sub-paths alike.
  base: './',
})
