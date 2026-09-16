import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '.',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/panel/index.tsx'),
      name: 'PrismPanel',
      formats: ['iife'],
      fileName: () => 'panel.js'
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true
      }
    },
    minify: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
