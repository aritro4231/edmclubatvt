// Edit club content here. Put new images in public/assets and use /assets/filename.
export const club = {
  name: 'EDM Club at Virginia Tech',
  logo: '/assets/edm-club-logo.png',
  joinUrl: 'https://gobblerconnect.vt.edu/organization/edmclubatvt',
  discordUrl: 'https://discord.gg/Cy5ee7pwjp',
  equipmentRentalUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdykJ1PW17KWFdTtW7CEIudTgqyMguITBD3AZaND_2KoEDOoA/viewform?usp=publish-editor',
  instagramUrl: 'https://www.instagram.com/edmclubatvt/',
};

// Ari plays public likes, Sinverze plays uploads, and the other DJs play stations.
export const radioStations = [
  { id: 'ari', name: 'Ari', image: '/assets/ari-updated.png', kind: 'likes', url: 'https://soundcloud.com/ari-364456121/likes' },
  { id: 'beaux', name: 'Beaux', image: '/assets/levi.png', url: 'https://soundcloud.com/discover/sets/artist-stations:1380249472' },
  { id: 'hovanez', name: 'Hovanez', image: '/assets/john-bedeian.png', url: 'https://soundcloud.com/discover/sets/artist-stations:263550940' },
  { id: 'sofasux', name: 'Sofasux', image: '/assets/sophia.png', kind: 'playlist', url: 'https://on.soundcloud.com/OXj5Ga7r5mEDKKhv3w' },
  { id: 'sinverze', name: 'Sinverze', image: '/assets/maxim.png', kind: 'uploads', url: 'https://soundcloud.com/sinverze/tracks' },
];

export const socials = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/edmclubatvt/?hl=en', description: 'Photo dumps, event promo, and stories from the club.', label: '@edmclubatvt', color: 'var(--magenta)' },
  { name: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@edmclubatvt', description: 'Show clips, mini mixes, and member whereabouts.', label: '@edmclubatvt', color: 'var(--cyan)' },
  { name: 'SoundCloud', icon: 'soundcloud', url: 'https://soundcloud.com/edmcvt', description: 'Listen to mixes and music from EDM Club.', label: 'edmcvt' },
  { name: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/@EDMatVirginiaTech', description: 'Watch sets and videos from the club.', label: '@EDMatVirginiaTech' },
  { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/company/edmclubatvirginiatech/', description: 'Our official LinkedIn page.', label: 'EDM Club at Virginia Tech', color: 'var(--violet)' },
  { name: 'Discord', icon: 'discord', url: club.discordUrl, description: 'Chat with members, get event pings, and share tracks.', label: 'Join our server', color: '#5865F2' },
];

// Four newest Instagram posts imported on October 14, 2026, by publication date.
// An older pinned post is excluded. Images are local so CDN URLs cannot expire.
// This is a one-time import; automatic Instagram syncing is not configured.
export const events = [
  { id: 'white-lies-rave', name: 'White Lies Rave', date: 'Oct 16, 2026', time: '8PM–1AM', location: 'DM @edmclubatvt for address', type: 'Club show', description: 'Members free · Non-members $5. Free white tees while supplies last.', poster: '/assets/instagram/instagram-Dec1NlWkQDh.jpg', imageAlt: 'White Lies Rave flyer with the October 16 lineup, hours, and admission details', isFlyer: true, postedAt: '2026-10-13T22:29:46.000Z', url: 'https://www.instagram.com/edmclubatvt/p/Dec1NlWkQDh/' },
  { id: 'production-workshop-recap', name: 'Production Workshop Recap', date: 'Posted Oct 7, 2026', type: 'Workshop recap', description: 'Sharing tracks, getting feedback, and learning new production techniques.', poster: '/assets/instagram/instagram-DeNEhtxFFOM.jpg', imageAlt: 'EDM Club production workshop with a presentation about spatial mixing', postedAt: '2026-10-07T19:06:14.000Z', url: 'https://www.instagram.com/edmclubatvt/p/DeNEhtxFFOM/' },
  { id: 'after-dark-recap', name: 'After Dark Rave Recap', date: 'Posted Oct 1, 2026', type: 'Show recap', description: 'A look back at the DJs, lights, and energy of After Dark.', poster: '/assets/instagram/instagram-Dd98FSkkY0b.jpg', imageAlt: 'DJs and the crowd at the After Dark rave under colorful lights', postedAt: '2026-10-01T22:04:59.000Z', url: 'https://www.instagram.com/edmclubatvt/p/Dd98FSkkY0b/' },
  { id: 'beaux-cant-take-us-down', name: 'Can’t Take Us Down', date: 'Posted Sep 29, 2026', type: 'Reel · Beaux', description: 'Catch Beaux behind the decks. Watch the full reel on Instagram.', poster: '/assets/instagram/instagram-Dd2LoSUMMix.jpg', imageAlt: 'Crowd dancing in the EDM Club reel featuring Beaux', mediaType: 'reel', postedAt: '2026-09-29T20:30:06.000Z', url: 'https://www.instagram.com/edmclubatvt/reel/Dd2LoSUMMix/' },
];

export const board = [
  { name: 'Maxim Dierickx', alias: 'Sinverze', role: 'President', image: '/assets/maxim.png' },
  { name: 'John Bedeian', alias: 'Hovanez', role: 'Vice President', image: '/assets/john-bedeian.png' },
  { name: 'John Williamson', alias: 'Jakid', role: 'Treasurer', image: '/assets/john-williamson.png' },
  { name: 'Aritro Sengupta', alias: 'Ari', role: 'Social Chair', image: '/assets/ari-updated.png' },
  { name: 'Sophia Fulton', alias: 'Sofasux', role: 'Event Coordinator', image: '/assets/sophia.png' },
  { name: 'Levi Bowman', alias: 'Beaux', role: 'Equipment Manager', image: '/assets/levi.png' },
];

// These sample titles came from the HTML. Replace them with real releases and
// set url to a SoundCloud track URL; its player will appear automatically.
export const releases = [
  { id: 'midnight-frequency', title: 'Midnight Frequency', artist: 'DJ Kairos', artwork: null, url: null, color: 'var(--magenta)' },
  { id: 'afterglow', title: 'Afterglow (Club Edit)', artist: 'Nova Rae', artwork: null, url: null, color: 'var(--cyan)' },
  { id: 'static-bloom', title: 'Static Bloom', artist: 'rrhythm', artwork: null, url: null, color: 'var(--violet)' },
];

