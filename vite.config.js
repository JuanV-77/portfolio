import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // Relative asset paths — works on GitHub Pages subpaths and custom domains alike
  base: './',
})
