import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    visualizer({
      filename: './dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 60001,
    proxy: {
      '/api': {
        target: 'http://localhost:60000',
        changeOrigin: true,
      },
      '/journal-api': {
        target: 'http://localhost:60002/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/journal-api/, ''),
      },
    },
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@ant-design/icons')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) {
              return 'vendor-antd';
            }
            if (id.includes('axios') || id.includes('dayjs') || id.includes('zustand') || id.includes('lunar-javascript')) {
              return 'vendor-utils';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'recharts'],
    exclude: [],
  },
})