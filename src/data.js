// Edit club content here. Put new images in public/assets and use /assets/filename.
export const club = {
  name: 'EDM Club at Virginia Tech',
  logo: '/assets/edm-club-logo.png',
  joinUrl: 'https://gobblerconnect.vt.edu/organization/edmclubatvt',
  equipmentRentalUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdykJ1PW17KWFdTtW7CEIudTgqyMguITBD3AZaND_2KoEDOoA/viewform?usp=publish-editor',
  instagramUrl: 'https://www.instagram.com/edmclubatvt/',
};

// Ari plays public likes; the other DJs play their recommendation stations.
export const radioStations = [
  { id: 'ari', name: 'Ari', image: '/assets/ari-updated.png', kind: 'likes', url: 'https://soundcloud.com/ari-364456121/likes' },
  { id: 'beaux', name: 'Beaux', image: '/assets/levi.png', url: 'https://soundcloud.com/discover/sets/artist-stations:1380249472' },
  { id: 'hovanez', name: 'Hovanez', image: '/assets/john-bedeian.png', url: 'https://soundcloud.com/discover/sets/artist-stations:263550940' },
  { id: 'sofasux', name: 'Sofasux', image: '/assets/sophia.png', url: 'https://soundcloud.com/discover/sets/artist-stations:1099633732' },
  { id: 'sinverze', name: 'Sinverze', image: '/assets/maxim.png', url: 'https://soundcloud.com/discover/sets/artist-stations:1067107096' },
];

export const socials = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/edmclubatvt/?hl=en', description: 'Photo dumps, event promo, and stories from the club.', label: '@edmclubatvt', color: 'var(--magenta)' },
  { name: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@edmclubatvt', description: 'Show clips, mini mixes, and member whereabouts.', label: '@edmclubatvt', color: 'var(--cyan)' },
  { name: 'SoundCloud', icon: 'soundcloud', url: 'https://soundcloud.com/edmcvt', description: 'Listen to mixes and music from EDM Club.', label: 'edmcvt' },
  { name: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/@EDMatVirginiaTech', description: 'Watch sets and videos from the club.', label: '@EDMatVirginiaTech' },
  { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/company/edmclubatvirginiatech/', description: 'Our official LinkedIn page.', label: 'EDM Club at Virginia Tech', color: 'var(--violet)' },
  { name: 'Discord', icon: 'discord', url: 'https://discord.gg/Cy5ee7pwjp', description: 'Chat with members, get event pings, and share tracks.', label: 'Join our server', color: '#5865F2' },
];

// Dates are preserved from the HTML. No year was provided, so these are
// displayed as club highlights rather than claimed to be upcoming events.
// Set poster to a local asset and url to an event page when available.
export const events = [
  { id: 'paradigm-shift', name: 'Paradigm Shift', date: 'May 2', time: '8PM–1AM', location: 'Jedass Cafe', type: 'Club show', color: 'var(--magenta)', poster: null, url: null },
  { id: 'production-workshop', name: 'Music Production Workshop', date: 'Apr 28', time: '6–7PM', location: 'Pamplin 1010', type: 'Workshop', color: 'var(--cyan)', poster: null, url: null },
  { id: 'election-meeting', name: 'Election Meeting', date: 'Apr 1', time: '6–7PM', location: 'McBryde 321', type: 'Club meeting', color: 'var(--violet)', poster: null, url: null },
  { id: 'treble-in-paradise', name: 'Treble in Paradise', date: 'Mar 20', time: '8PM–1AM', location: 'The Boardwalk', type: 'Club show', color: 'var(--acid)', poster: null, url: null },
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

