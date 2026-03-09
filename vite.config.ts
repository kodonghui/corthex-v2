import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '.',
  define: {
    __BUILD_NUMBER__: JSON.stringify('dev'),
    __BUILD_HASH__: JSON.stringify(''),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString().slice(0, 16)),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/app/src'),
      '@corthex/ui': path.resolve(__dirname, './packages/app/src/lib/ui/index.ts'),
      '@corthex/shared': path.resolve(__dirname, './packages/app/src/lib/shared/index.ts'),
    },
  },
})
