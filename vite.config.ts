import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

export default defineConfig({
  base: '/birthday-celebration/',
  plugins: [
    react(),
    // Generate legacy bundles for older browsers (WeChat WebView, old Safari, etc.)
    // Modern browsers load type="module", old browsers load SystemJS fallback
    legacy({
      targets: ['> 0.3%', 'not dead', 'iOS >= 10', 'Android >= 5'],
      renderModernChunks: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: ['es2015', 'safari11'],
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
