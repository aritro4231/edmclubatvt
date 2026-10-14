export const discordSource = { guildId: '982345162640461927', channelId: '1099800169656094851', channelName: 'music-self-promo' };

export function musicLink(raw) {
  let url;
  try { url = new URL(raw.replace(/[),.!?;\]>]+$/, '')); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|si$|ref$)/.test(key)) url.searchParams.delete(key);
  if (host === 'soundcloud.com' && url.pathname.split('/').filter(Boolean).length >= 2 && !/^\/(discover|search|you|stations)\//.test(url.pathname)) {
    return { url: url.href, provider: 'SoundCloud', embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url.href)}&auto_play=false&single_active=true` };
  }
  if (host === 'on.soundcloud.com') return { url: url.href, provider: 'SoundCloud', embedUrl: null };
  const spotify = host === 'open.spotify.com' && url.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([a-zA-Z0-9]{22})\/?$/);
  if (spotify) return { url: url.href, provider: 'Spotify', embedUrl: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}` };
  const videoId = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'm.youtube.com'].includes(host) ? (url.searchParams.get('v') || url.pathname.match(/^\/(shorts|embed)\/([^/]+)/)?.[2]) : null;
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) return { url: `https://www.youtube.com/watch?v=${videoId}`, provider: 'YouTube', embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
  if (/^[a-z0-9-]+\.bandcamp\.com$/.test(host) && /^\/(track|album)\//.test(url.pathname)) return { url: url.href, provider: 'Bandcamp', embedUrl: null };
  return null;
}

export function releasesFromMessages(messages) {
  const seen = new Set();
  const releases = [];
  const sorted = [...messages].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  for (const message of sorted) {
    const sources = [message.content || '', ...(message.embeds || []).flatMap(embed => [embed.url || '', embed.description || ''])];
    for (const raw of sources.join(' ').match(/https:\/\/[^\s<>"`]+/g) || []) {
      const link = musicLink(raw);
      if (!link || seen.has(link.url)) continue;
      seen.add(link.url);
      const embed = (message.embeds || []).find(item => musicLink(item.url || '')?.url === link.url);
      const artwork = embed?.thumbnail?.url || embed?.image?.url;
      releases.push({
        id: link.url, ...link,
        title: String(embed?.title || `${link.provider} release`).slice(0, 180),
        artist: String(embed?.author?.name || message.author?.global_name || message.author?.username || 'Club member').slice(0, 100),
        artwork: artwork && /^https:\/\//.test(artwork) ? artwork : null,
        postedAt: message.timestamp,
      });
      if (releases.length >= 12) return releases;
    }
  }
  return releases;
}

export function createReleaseService(fetchImpl = fetch, now = Date.now) {
  let cached, pending;
  return async function releases(env = {}) {
    const token = env.DISCORD_BOT_TOKEN?.trim();
    if (!token) return { status: 'not_configured', releases: [], updatedAt: null };
    if (cached && now() - cached.time < 45000) return cached.data;
    if (pending) return pending;
    pending = (async () => {
      try {
        const options = { headers: { Authorization: `Bot ${token}` }, signal: AbortSignal.timeout(8000) };
        const channel = await fetchImpl(`https://discord.com/api/v10/channels/${discordSource.channelId}`, options);
        if (!channel.ok || (await channel.json()).guild_id !== discordSource.guildId) throw new Error('Channel access unavailable');
        const response = await fetchImpl(`https://discord.com/api/v10/channels/${discordSource.channelId}/messages?limit=100`, { ...options, signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('Messages unavailable');
        const messages = await response.json();
        if (!Array.isArray(messages)) throw new Error('Invalid messages');
        const data = { status: 'ready', releases: releasesFromMessages(messages), updatedAt: new Date(now()).toISOString() };
        cached = { time: now(), data };
        return data;
      } catch {
        return { status: cached ? 'stale' : 'unavailable', releases: cached?.data.releases || [], updatedAt: cached?.data.updatedAt || null };
      } finally { pending = null; }
    })();
    return pending;
  };
}
