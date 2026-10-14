import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStationPage, parseLikesPage, parseUploadsPage, parsePublicTrackPage, createStationService } from '../server/stations.js';
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

function likesHtml(paths = ['/first/liked', '/second/liked'], userId = 1420286394) {
  return `<script>window.__sc_hydration = ${JSON.stringify([{ hydratable: 'user', data: { id: userId } }])};</script>
    <a itemprop="url" href="/artist/upload">Not a liked track</a>
    <noscript><article><section><h2>Tracks and playlists liked by ari</h2>
    ${paths.map(path => `<article><h2><a itemprop="url" href="${path}">Track</a></h2></article>`).join('')}
    </section></article></noscript>`;
}

function trackHtml(id, url, artistId) {
  return `<script>window.__sc_hydration = ${JSON.stringify([{ hydratable: 'sound', data: { id, kind: 'track', permalink_url: url, user: { id: artistId } } }])};</script>`;
}

test('public likes parser validates the owner and keeps only unique liked track links in order', () => {
  assert.deepEqual(parseLikesPage(likesHtml(['/second/liked', '/first/liked', '/second/liked', '/artist/sets/playlist', 'https://example.com/evil', 'javascript:alert(1)']), '1420286394'), ['https://soundcloud.com/second/liked', 'https://soundcloud.com/first/liked']);
  assert.throws(() => parseLikesPage(likesHtml([], 123), '1420286394'), /does not match/);
  assert.throws(() => parseLikesPage(likesHtml([]), '1420286394'), /No public liked tracks/);
  const url = 'https://soundcloud.com/artist/liked';
  assert.equal(parsePublicTrackPage(trackHtml(123, url), url).id, '123');
  assert.throws(() => parsePublicTrackPage(trackHtml(123, 'https://soundcloud.com/artist/upload'), url), /does not match/);
});

test('Ari plays and refreshes public likes, preserving likes during fetch failures', async () => {
  let time = 0, calls = 0, failing = false;
  const service = createStationService(async url => {
    calls++;
    if (failing) throw new Error('Offline');
    if (url.endsWith('/likes')) return new Response(likesHtml(['/second/liked', '/missing/liked', '/first/liked']));
    if (url.endsWith('/missing/liked')) return new Response('', { status: 404 });
    return new Response(trackHtml(url.includes('/second/') ? 22 : 11, url));
  }, () => time);
  const first = await service('ari');
  assert.equal(first.kind, 'likes');
  assert.equal(first.stale, false);
  assert.equal(first.sourceUrl, 'https://soundcloud.com/ari-364456121/likes');
  assert.deepEqual(first.tracks.map(t => t.id), ['22', '11']);
  await service('ari');
  assert.equal(calls, 4);
  time = 610000;
  await service('ari');
  assert.equal(calls, 8);
  failing = true;
  time = 1220000;
  const fallback = await service('ari');
  assert.equal(fallback.kind, 'likes');
  assert.equal(fallback.stale, true);
  assert.deepEqual(fallback.tracks, first.tracks);
  const saved = await createStationService(async () => { throw new Error('Offline'); })('ari');
  assert.equal(saved.kind, 'likes');
  assert.equal(saved.sourceUrl, first.sourceUrl);
});

function uploadsHtml(paths = ['/sinverze/first', '/sinverze/second'], userId = 1067107096) {
  return `<script>window.__sc_hydration = ${JSON.stringify([{ hydratable: 'user', data: { id: userId, permalink: 'sinverze' } }])};</script>
    <a itemprop="url" href="/sinverze/outside">Not in the upload section</a>
    <noscript><article><section><h2>SINVERZE’s tracks</h2>
    ${paths.map(path => `<article itemtype="http://schema.org/MusicRecording"><h2><a itemprop="url" href="${path}">Track</a></h2></article>`).join('')}
    </section></article></noscript>`;
}

test('upload parser validates the profile and excludes other artists and playlists', () => {
  assert.deepEqual(parseUploadsPage(uploadsHtml(['/sinverze/second', '/sinverze/first', '/other/track', '/sinverze/sets/playlist', '/sinverze/first']), '1067107096'), ['https://soundcloud.com/sinverze/second', 'https://soundcloud.com/sinverze/first']);
  assert.throws(() => parseUploadsPage(uploadsHtml([], 999), '1067107096'), /does not match/);
  const url = 'https://soundcloud.com/sinverze/first';
  assert.throws(() => parsePublicTrackPage(trackHtml(11, url, 999), url, '1067107096'), /does not match/);
  assert.equal(parsePublicTrackPage(trackHtml(11, url, 1067107096), url, '1067107096').id, '11');
});

test('Sinverze plays only verified uploads and retains uploads during an outage', async () => {
  let time = 0, calls = 0, failing = false;
  const service = createStationService(async url => {
    calls++;
    if (failing) throw new Error('Offline');
    if (url.endsWith('/tracks')) return new Response(uploadsHtml(['/sinverze/second', '/sinverze/wrong-owner', '/sinverze/first']));
    return new Response(trackHtml(url.endsWith('/second') ? 22 : 11, url, url.endsWith('/wrong-owner') ? 999 : 1067107096));
  }, () => time);
  const first = await service('sinverze');
  assert.equal(first.kind, 'uploads');
  assert.equal(first.sourceUrl, 'https://soundcloud.com/sinverze/tracks');
  assert.deepEqual(first.tracks.map(t => t.id), ['22', '11']);
  await service('sinverze');
  assert.equal(calls, 4);
  time = 610000;
  failing = true;
  const fallback = await service('sinverze');
  assert.equal(fallback.kind, 'uploads');
  assert.equal(fallback.stale, true);
  assert.deepEqual(fallback.tracks, first.tracks);
  const saved = await createStationService(async () => { throw new Error('Offline'); })('sinverze');
  assert.equal(saved.kind, 'uploads');
  assert.equal(saved.sourceUrl, first.sourceUrl);
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
