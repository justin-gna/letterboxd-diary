import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'letterboxd-diary': path.resolve(__dirname, '../src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['letterboxd-diary'],
  },
})
