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
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // MUI split into parts
          'mui-core': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          // Styling engine
          emotion: ['@emotion/react', '@emotion/styled'],
          // Heavy animation library (lazy loaded with dice)
          lottie: ['@lottiefiles/dotlottie-react', '@lottiefiles/dotlottie-web'],
          // Game engine (lazy loaded only when /play is accessed)
          phaser: ['phaser'],
          // Dice roller library (used by DiceBuilder)
          'dice-roller': ['@dice-roller/rpg-dice-roller'],
        },
      },
    },
  },
});
