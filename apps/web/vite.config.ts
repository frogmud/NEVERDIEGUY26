import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 4006 },
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
            // Core React + MUI + Emotion (must be together to avoid initialization order issues)
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('@mui/material') ||
              id.includes('@mui/system') ||
              id.includes('@emotion')
            ) {
              return 'vendor';
            }
            // MUI icons can be separate (no circular deps)
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }
            // Game engine
            if (id.includes('phaser')) {
              return 'phaser';
            }
            // Dice roller
            if (id.includes('dice-roller')) {
              return 'dice-roller';
            }
            // 3D rendering - split drei helpers from core three
            if (id.includes('@react-three/drei')) {
              return 'three-drei';
            }
            if (id.includes('three') || id.includes('@react-three/fiber')) {
              return 'three';
            }
          }

          // Route-based splitting (source code) - split games from play screens
          if (id.includes('/games/')) {
            return 'route-games';
          }
          if (id.includes('/screens/play/')) {
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
