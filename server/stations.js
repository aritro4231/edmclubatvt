import snapshots from '../src/station-snapshots.json' with { type: 'json' };

const artistIds = { ari: '1420286394', beaux: '1380249472', hovanez: '263550940', sofasux: '1099633732', sinverze: '1067107096' };

// Read only public station data. No client IDs, tokens, or browser sessions are used.
export function parseStationPage(html, expectedArtistId) {
  const marker = html.indexOf('window.__sc_hydration');
  if (marker < 0) throw new Error('Station data unavailable');
  const start = html.indexOf('[', marker);
  let depth = 0, quoted = false, escaped = false, end = -1;
  for (let i = start; i < html.length; i++) {
    const char = html[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '[') depth++;
    else if (char === ']' && --depth === 0) { end = i + 1; break; }
  }
  if (start < 0 || end < 0) throw new Error('Station data incomplete');
  const playlist = JSON.parse(html.slice(start, end)).find(item => item.hydratable === 'systemPlaylist')?.data;
  if (!playlist?.tracks?.length || playlist.urn !== `soundcloud:system-playlists:artist-stations:${expectedArtistId}`) throw new Error('Station does not match');
  const tracks = playlist.tracks.map(track => {
    const id = String(track.id || track.urn?.split(':').at(-1) || '');
    return { id, embedUrl: `https://api.soundcloud.com/tracks/${id}` };
  }).filter(track => /^\d+$/.test(track.id));
  if (!tracks.length) throw new Error('Station contains no playable tracks');
  return { title: playlist.title || 'Artist station', tracks };
}

export function createStationService(fetchImpl = fetch, now = Date.now) {
  const cache = new Map();
  const pending = new Map();
  return async function station(id) {
    if (!artistIds[id]) return null;
    const cached = cache.get(id);
    if (cached && now() - cached.time < 600000) return cached.data;
    if (pending.has(id)) return pending.get(id);
    const request = (async () => {
      const sourceUrl = `https://soundcloud.com/discover/sets/artist-stations:${artistIds[id]}`;
      try {
        const response = await fetchImpl(sourceUrl, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('Station request failed');
        const parsed = parseStationPage(await response.text(), artistIds[id]);
        const data = { id, sourceUrl, ...parsed, fetchedAt: new Date(now()).toISOString(), stale: false };
        cache.set(id, { time: now(), data });
        return data;
      } catch {
        // This is the last real station queue, never an artist-catalog substitute.
        const data = { ...(cached?.data || snapshots[id]), stale: true };
        cache.set(id, { time: now() - 540000, data });
        return data;
      } finally { pending.delete(id); }
    })();
    pending.set(id, request);
    return request;
  };
}
