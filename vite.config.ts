import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/geo-api': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geo-api/, ''),
        headers: {
          'User-Agent': 'CoPilot-District-Gov-v1.0'
        }
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            if (id.includes('recharts') || id.includes('d3')) return 'chart-vendor';
            if (id.includes('lucide')) return 'ui-icons';
            if (id.includes('framer-motion')) return 'animation';
            if (id.includes('sonner')) return 'toast';
            if (id.includes('leaflet')) return 'map-vendor';
            if (id.includes('html2canvas') || id.includes('jspdf')) return 'pdf-vendor';
            if (id.includes('tesseract')) return 'ocr-vendor';
            if (id.includes('pdfjs')) return 'pdfjs-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
