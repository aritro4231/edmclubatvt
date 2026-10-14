import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStationPage, createStationService } from '../server/stations.js';
import { musicLink, releasesFromMessages, createReleaseService, discordSource } from '../server/releases.js';

function stationHtml(ids = [11, 22, 33], artistId = '1380249472') {
  return `<script>window.__sc_hydration = ${JSON.stringify([{ hydratable: 'systemPlaylist', data: { urn: `soundcloud:system-playlists:artist-stations:${artistId}`, title: 'Station with ] and " punctuation', tracks: ids.map(id => ({ id })) } }])};</script>`;
}

test('station parser keeps recommendation order and rejects another station', () => {
  assert.deepEqual(parseStationPage(stationHtml(), '1380249472').tracks.map(t => t.id), ['11', '22', '33']);
  assert.throws(() => parseStationPage(stationHtml(), '1420286394'), /does not match/);
});

test('station cache refreshes and falls back to a real station queue', async () => {
  let time = 0, calls = 0, failing = false;
  const service = createStationService(async () => { calls++; if (failing) throw new Error('Network unavailable'); return new Response(stationHtml()); }, () => time);
  const first = await service('beaux');
  assert.equal(first.stale, false);
  assert.equal((await service('beaux')).tracks[1].id, '22');
  assert.equal(calls, 1);
  time = 610000;
  failing = true;
  const fallback = await service('beaux');
  assert.equal(fallback.stale, true);
  assert.deepEqual(fallback.tracks, first.tracks);
  assert.equal(await service('arbitrary'), null);
});

test('release parser finds music links and deduplicates newest posts', () => {
  const messages = [
    { timestamp: '2026-10-13T12:00:00Z', content: 'https://soundcloud.com/artist/release?utm_source=discord', author: { username: 'Old member' } },
    { timestamp: '2026-10-14T12:00:00Z', content: '[New release](https://soundcloud.com/artist/release). https://example.com/ignore', author: { username: 'Member' }, embeds: [{ url: 'https://soundcloud.com/artist/release', title: 'Real title', author: { name: 'Real artist' } }] },
  ];
  const releases = releasesFromMessages(messages);
  assert.equal(releases.length, 1);
  assert.equal(releases[0].title, 'Real title');
  assert.equal(releases[0].artist, 'Real artist');
  assert.equal(releases[0].url, 'https://soundcloud.com/artist/release');
  assert.equal(musicLink('javascript:alert(1)'), null);
  assert.equal(musicLink('https://open.spotify.com/track/1234567890123456789012').provider, 'Spotify');
  assert.equal(musicLink('https://youtu.be/abcdefghijk?si=remove').embedUrl, 'https://www.youtube-nocookie.com/embed/abcdefghijk');
});

test('Discord feed requires a token and checks the specified server/channel', async () => {
  let calls = 0;
  const service = createReleaseService(async url => {
    calls++;
    if (url.includes('/messages?')) return Response.json([{ timestamp: '2026-10-14T12:00:00Z', content: 'https://soundcloud.com/artist/release', author: { username: 'Member' } }]);
    assert.ok(url.endsWith(discordSource.channelId));
    return Response.json({ guild_id: discordSource.guildId });
  });
  assert.equal((await service({})).status, 'not_configured');
  assert.equal(calls, 0);
  const data = await service({ DISCORD_BOT_TOKEN: 'test-fixture-not-a-real-token' });
  assert.equal(data.status, 'ready');
  assert.equal(data.releases.length, 1);
  const wrongServer = createReleaseService(async () => Response.json({ guild_id: 'not-the-requested-server' }));
  assert.equal((await wrongServer({ DISCORD_BOT_TOKEN: 'test-fixture-not-a-real-token' })).status, 'unavailable');
});
