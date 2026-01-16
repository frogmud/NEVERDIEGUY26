import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor splits (node_modules)
          if (id.includes('node_modules')) {
            // Core React
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            if (id.includes('/react/')) {
              return 'vendor';
            }
            // MUI
            if (id.includes('@mui/material')) {
              return 'mui-core';
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }
            // Styling
            if (id.includes('@emotion')) {
              return 'emotion';
            }
            // Game engine
            if (id.includes('phaser')) {
              return 'phaser';
            }
            // Dice roller
            if (id.includes('dice-roller')) {
              return 'dice-roller';
            }
            // 3D rendering
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three';
            }
          }

          // Route-based splitting (source code)
          if (id.includes('/screens/play/') || id.includes('/games/')) {
            return 'route-play';
          }
          if (id.includes('/screens/wiki/')) {
            return 'route-wiki';
          }
          if (id.includes('/screens/shop/')) {
            return 'route-shop';
          }

          // AI engine gets its own chunk
          if (id.includes('ai-engine')) {
            return 'ai-engine';
          }

          return undefined;
        },
      },
    },
  },
});
