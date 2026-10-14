import snapshots from '../src/station-snapshots.json' with { type: 'json' };

const artistIds = { ari: '1420286394', beaux: '1380249472', hovanez: '263550940', sofasux: '1099633732', sinverze: '1067107096' };
const ariLikesUrl = 'https://soundcloud.com/ari-364456121/likes';

// Read only public page data. No client IDs, tokens, or browser sessions are used.
function hydrationFromPage(html) {
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
  return JSON.parse(html.slice(start, end));
}

export function parseStationPage(html, expectedArtistId) {
  const playlist = hydrationFromPage(html).find(item => item.hydratable === 'systemPlaylist')?.data;
  if (!playlist?.tracks?.length || playlist.urn !== `soundcloud:system-playlists:artist-stations:${expectedArtistId}`) throw new Error('Station does not match');
  const tracks = playlist.tracks.map(track => {
    const id = String(track.id || track.urn?.split(':').at(-1) || '');
    return { id, embedUrl: `https://api.soundcloud.com/tracks/${id}` };
  }).filter(track => /^\d+$/.test(track.id));
  if (!tracks.length) throw new Error('Station contains no playable tracks');
  return { title: playlist.title || 'Artist station', tracks };
}

export function parseLikesPage(html, expectedArtistId) {
  const user = hydrationFromPage(html).find(item => item.hydratable === 'user')?.data;
  if (String(user?.id) !== expectedArtistId) throw new Error('Likes profile does not match');
  const content = [...html.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi)]
    .map(match => match[1]).find(part => /<h2>Tracks and playlists liked by [\s\S]*?<\/h2>/i.test(part));
  const section = content?.match(/<section\b[^>]*>([\s\S]*?)<\/section>/i)?.[1];
  if (!section) throw new Error('Public likes unavailable');
  const urls = [...section.matchAll(/<a\b(?=[^>]*\bitemprop=["']url["'])[^>]*\bhref=["']([^"']+)["']/gi)]
    .flatMap(match => {
      try {
        const url = new URL(match[1].replace(/&amp;/g, '&'), 'https://soundcloud.com');
        // Individual public tracks only; a liked playlist is not an uploaded track.
        return url.origin === 'https://soundcloud.com' && /^\/[^/]+\/[^/]+\/?$/.test(url.pathname)
          && !/^\/(you|discover|search)\//.test(url.pathname) ? [url.origin + url.pathname.replace(/\/$/, '')] : [];
      } catch { return []; }
    });
  const tracks = [...new Set(urls)].slice(0, 10);
  if (!tracks.length) throw new Error('No public liked tracks available');
  return tracks;
}

export function parsePublicTrackPage(html, expectedUrl) {
  const sound = hydrationFromPage(html).find(item => item.hydratable === 'sound')?.data;
  const id = String(sound?.id || '');
  if (sound?.kind !== 'track' || !/^\d+$/.test(id) || sound.permalink_url !== expectedUrl) throw new Error('Liked track does not match');
  return { id, embedUrl: `https://api.soundcloud.com/tracks/${id}` };
}

async function fetchAriLikes(fetchImpl) {
  const response = await fetchImpl(ariLikesUrl, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error('Likes request failed');
  const urls = parseLikesPage(await response.text(), artistIds.ari);
  const results = await Promise.allSettled(urls.map(async url => {
    const track = await fetchImpl(url, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(6000) });
    if (!track.ok) throw new Error('Liked track unavailable');
    return parsePublicTrackPage(await track.text(), url);
  }));
  const tracks = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  if (!tracks.length) throw new Error('No playable public likes available');
  return { title: 'Ari’s likes', kind: 'likes', tracks };
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
      const sourceUrl = id === 'ari' ? ariLikesUrl : `https://soundcloud.com/discover/sets/artist-stations:${artistIds[id]}`;
      try {
        let parsed;
        if (id === 'ari') parsed = await fetchAriLikes(fetchImpl);
        else {
          const response = await fetchImpl(sourceUrl, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error('Station request failed');
          parsed = parseStationPage(await response.text(), artistIds[id]);
        }
        const data = { id, sourceUrl, ...parsed, fetchedAt: new Date(now()).toISOString(), stale: false };
        cache.set(id, { time: now(), data });
        return data;
      } catch {
        // Preserve the actual source: Ari's likes or the other DJs' station queues.
        const data = { ...(cached?.data || snapshots[id]), stale: true };
        cache.set(id, { time: now() - 540000, data });
        return data;
      } finally { pending.delete(id); }
    })();
    pending.set(id, request);
    return request;
  };
}
