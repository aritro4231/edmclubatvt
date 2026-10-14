import resources from '../.sites-runtime/site-resources.js';
import { apiResponse } from '../server/api.js';

export default {
  async fetch(request, env) {
    const api = await apiResponse(request, env);
    if (api) return api;
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    let pathname = new URL(request.url).pathname;
    if (pathname === '/') pathname = '/index.html';
    const resource = resources[pathname];
    if (!resource) return new Response('Not found', { status: 404 });
    const bytes = request.method === 'HEAD' ? null : Uint8Array.from(atob(resource.content), char => char.charCodeAt(0));
    return new Response(bytes, { headers: { 'Content-Type': resource.type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': pathname === '/index.html' ? 'no-cache' : /^\/assets\/index-[\w-]+\./.test(pathname) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600' } });
  },
};
