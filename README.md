# EDM Club at Virginia Tech

React + Vite conversion of the supplied HTML. Original HTML files are retained as reference.

## Run locally

Requires Node.js 18+ (Node 22 recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`, or serve that build with `npm run preview`. `npm test` checks station queue parsing/caching and Discord release extraction/access boundaries.

## Edit content

Update `src/data.js` for social links, membership, events, board members, and releases. Styles are in `src/styles.css`; page sections are in `src/components/Sections.jsx`.

## Club Radio

`src/components/ClubRadio.jsx` provides five switchable channels from `radioStations` in `src/data.js`. Ari plays up to 10 recent public liked tracks from `soundcloud.com/ari-364456121/likes`, in the page's order. Sinverze plays up to 10 recent uploads from `soundcloud.com/sinverze/tracks`; every track's uploader is validated against his account. These public pages expose a limited selection, not the entire libraries; no visitor login is needed. The server validates each profile and resolves its public track pages. Sofasux plays the shared ?edm 26.1? playlist in its original order. Beaux and Hovanez retain their actual 50-track recommendation station queues. Station tabs support mouse, touch, and keyboard navigation (arrows, Home, End). The widget plays individual tracks from the selected queue.

`SoundCloudRadioPlayer.jsx` connects Play/Pause, seeking, volume, and current-track display to SoundCloud's official Widget API. Next/Previous and automatic advancement follow the station queue. Switching stations stops the previous player. Queues refresh from SoundCloud with a 10-minute server cache; a saved real queue is used if the station page cannot be fetched. No SoundCloud app credentials are required. The visible embedded player preserves attribution.

The supplied logos and six matching board graphics are copied into `public/assets`, so the site does not depend on files outside this project. The homepage uses the smaller club emblem; the chrome logo is retained as an unused asset.

The Events section contains the four newest public Instagram posts imported from `@edmclubatvt` on October 14, 2026. They are ordered by publication date, excluding an older pinned post: White Lies Rave, Production Workshop Recap, After Dark Rave Recap, and the Beaux reel. The flyer’s event date is distinct from the recap/reel publication dates. Full-color images are stored locally in `public/assets/instagram`; every card opens its original post. This is a one-time import, not an automatic Instagram integration.

Releases now use the confirmed Discord music-self-promo channel. Configure the server-only bot secret using [the setup guide](docs/discord-setup.md). Until access is configured, the feed remains empty. New music links appear automatically, with in-page players where supported.

The existing React/Vite frontend is packaged with an ES-module Worker for `/api/radio/:station` and `/api/releases`. The build embeds frontend assets in the Worker, preserving the supplied images and the original site identity. Backend credentials are never included in the frontend bundle.

The design uses charcoal, white, subtle grain, and chrome branding. Board graphics display their original colors without image filters. The mood reference is not included in the site.

Scroll reveals use React effects with cleanup, including reduced-motion support. The textured background is static CSS. Navigation adapts to mobile screens and supports keyboard dismissal.
