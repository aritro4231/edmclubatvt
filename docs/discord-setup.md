# Connect the release feed

Source: **EDM Club at Virginia Tech → 🎼│music-self-promo**.

- Server ID: `982345162640461927`
- Channel ID: `1099800169656094851`
- Bot permissions: **View Channel** and **Read Message History**.

1. Create an application at https://discord.com/developers/applications and open its **Bot** settings.
2. Enable **Message Content Intent** so posted links and link previews can be read.
3. Under **OAuth2 → URL Generator**, select the `bot` scope and the two permissions above. Open the generated URL and add the bot to the club server. Confirm its role can view music-self-promo.
4. Store the bot token as the Site runtime secret `DISCORD_BOT_TOKEN`. For local setup, copy `.env.example` to the ignored `.env.local` and fill in the token there. Never use a `VITE_` prefix for this server-only token.
5. Deploy after configuring the runtime secret. `/api/releases` returns `ready` once the bot can read the channel.

The website refreshes the feed every minute while open. The server caches results for 45 seconds, reads the latest 100 messages, and shows up to 12 distinct music links in newest-first order. SoundCloud, Spotify, and YouTube links have embedded players; Bandcamp and SoundCloud short links remain links. Discord is the source of record; no separate database is required.

Until the bot secret and channel access are configured, the site shows an empty release feed. It does not claim that Discord has been connected.
