# EDM Club at Virginia Tech

React + Vite conversion of the supplied HTML. Original HTML files are retained as reference.

## Run locally

Requires Node.js 18+ (Node 22 recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`, or serve that build with `npm run preview`.

## Edit content

Update `src/data.js` for social links, membership, events, board members, and releases. Styles are in `src/styles.css`; page sections are in `src/components/Sections.jsx`.

## Club Radio

`src/components/ClubRadio.jsx` provides five switchable artist stations from `radioStations` in `src/data.js`. Station tabs support mouse, touch, and keyboard navigation (arrows, Home, End). The supplied generated artist-station URLs are rejected by SoundCloud's embedded player, so their Listen buttons open the matching station on SoundCloud.

To enable playback inside the site, set a station's `embedUrl` to a public SoundCloud track or regular playlist URL verified with Share > Embed. Only the selected station mounts a player, so switching removes the previous player and stops its audio. Playback starts through the SoundCloud player's controls, without autoplay.

The supplied logos and six matching board graphics are copied into `public/assets`, so the site does not depend on files outside this project. The homepage uses the smaller club emblem; the chrome logo is retained as an unused asset.

Event dates and venues are preserved from the HTML. Since the dates have no year, the section presents them as highlights. Original event images were missing local screenshots or temporary Discord URLs; local text posters are used until you set each event's `poster` path. Set an event's `url` to link its card to an event page.

Release titles from the HTML are sample content labeled Preview. Set each release's `url` to its actual listening link and replace sample title/artist information. SoundCloud track URLs automatically render an embedded player. Set `artwork` to a local asset path if available.

The design uses charcoal, white, subtle grain, and chrome branding. Board graphics display their original colors without image filters. The mood reference is not included in the site.

Scroll reveals use React effects with cleanup, including reduced-motion support. The textured background is static CSS. Navigation adapts to mobile screens and supports keyboard dismissal.
