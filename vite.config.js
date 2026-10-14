import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiResponse } from './server/api.js';

function localApi() {
  function configure(server) {
    const env = loadEnv('development', process.cwd(), '');
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/')) return next();
      try {
        const response = await apiResponse(new Request(`http://127.0.0.1${req.url}`, { method: req.method }), env);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      } catch { res.statusCode = 503; res.end('{"error":"Service unavailable"}'); }
    });
  }
  return { name: 'club-local-api', configureServer: configure, configurePreviewServer: configure };
}
export default defineConfig({ plugins: [react(), localApi()], build: { outDir: '.sites-runtime/frontend-build' } });
