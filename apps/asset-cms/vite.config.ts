import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// External asset directories to serve
const PSX_MODELS_PATH = '/Users/kevin/Documents/PSX Mega Pack/Models/GLB';

// Plugin to serve external asset directories
function serveExternalAssets(): Plugin {
  return {
    name: 'serve-external-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /psx-models/* requests
        if (req.url?.startsWith('/psx-models/')) {
          // Strip query string if present
          const urlPath = req.url.split('?')[0];
          const relativePath = decodeURIComponent(urlPath.replace('/psx-models/', ''));
          const filePath = path.join(PSX_MODELS_PATH, relativePath);

          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.glb': 'model/gltf-binary',
              '.gltf': 'model/gltf+json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
            };

            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveExternalAssets()],
  server: {
    port: 5174,
    fs: {
      // Allow serving files from external directories
      allow: ['.', PSX_MODELS_PATH],
    },
  },
});
