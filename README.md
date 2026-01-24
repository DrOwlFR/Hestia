# *Hestia*

*Hestia* is a Discord bot project for a writing community. It links members' website accounts with Discord, assigns roles from the site's API, and manages extra roles based on server activity (seniority, message counts, etc.).

The name "*Hestia*" refers to the Greek goddess of hearth and home, symbolizing the bot's role in fostering community and connection.

## Features
- Slash commands powered by Sheweny (Discord.js 14)
- MongoDB persistence for links, roles, and scheduled tasks
- Role sync with external site API, plus seasonal color themes
- Moderation helpers (rules posting, message edit, emit events for debugging)
- Cron-based maintenance (backups, role cleanups)

## Tech stack
- Node.js + TypeScript
- Discord.js 14 with Sheweny framework
- MongoDB via Mongoose
- Utilities: Bottleneck (rate limiting), node-cron, Husky/Commitlint

## Requirements
- Node.js 20+ and npm
- Discord application with a bot token and needed intents (Guilds, Members, Messages, Presences)
- MongoDB instance

## Quick start
1. Clone the repo and install dependencies:
	- `npm install`
2. Configure the bot:
	- Copy [src/structures/config.template.ts](src/structures/config.template.ts) to [src/structures/config.ts](src/structures/config.ts).
	- Fill tokens, API keys, guild IDs, channel/role IDs, and admin/mod IDs. Required fields include `DISCORD_TOKEN`, `MONGO_TOKEN`, `dbName`, `API_KEY`, `APILink`, `botAdminsIds`, `registeredGuildsIds`, and the various channel/role IDs.
3. Build and run:
	- `npm run build`
	- `npm run start`

When the bot starts, Sheweny auto-registers slash commands for the guild IDs listed in `registeredGuildsIds`.

## Scripts
- `npm run build` — compile TypeScript to `dist`.
- `npm run start` — start the compiled bot from `dist/src/index.js`.
- `npm run build-dev` — watch mode for development (run alongside `npm run start` in another terminal).

## Project structure
- [src/index.ts](src/index.ts): bootstraps the Sheweny client, managers, DB connection, and login.
- [src/structures/config.ts](src/structures/config.ts): runtime configuration (copied from the template).
- [src/structures/database](src/structures/database): Mongo connection and models.
- [src/commands](src/commands): slash commands (administration, dev, misc, util).
- [src/events](src/events): Discord event handlers and inhibitors.
- [src/interactions](src/interactions): buttons, select menus, modals.
- [src/structures/tasks](src/structures/tasks): cron-like jobs (backups, cleanups, seasonal roles).
- [src/structures/utils](src/structures/utils): shared helpers and embeds.

## Deployment notes
- For production, build then run with your process manager of choice. Example with PM2:
  - `npm run build`
  - `pm2 start dist/src/index.js --name hestia --watch`
- Ensure the bot has the required gateway intents enabled in the Discord Developer Portal.

## Contributing
- Conventional commits are enforced via Commitlint/Husky (`npm run prepare` installs hooks).
- Keep configuration secrets in `config.ts`; **do not commit them**.

## License
Creative Commons BY-NC-SA (see LICENSE.md).