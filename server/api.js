import { createStationService } from './stations.js';
import { createReleaseService } from './releases.js';

const getStation = createStationService();
const getReleases = createReleaseService();
function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export async function apiResponse(request, env = {}) {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith('/api/')) return null;
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (pathname === '/api/releases') return json(await getReleases(env));
  const match = pathname.match(/^\/api\/radio\/([a-z]+)$/);
  if (match) {
    const station = await getStation(match[1]);
    return station ? json(station) : json({ error: 'Station not found' }, 404);
  }
  return json({ error: 'Not found' }, 404);
}
