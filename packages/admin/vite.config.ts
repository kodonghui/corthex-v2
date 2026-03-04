import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_NUMBER__: JSON.stringify(process.env.BUILD_NUMBER || 'dev'),
    __BUILD_HASH__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) || ''),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString().slice(0, 16)),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
