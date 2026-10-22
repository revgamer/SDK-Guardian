# SDK Guardian

The official Discord bot for **Scotland Deaf Karting (SDK)**, a Deaf-led karting club based at Larkhall Circuit.

**Drive • Communicate • Belong.**

SDK Guardian is built only for SDK's own Discord server. If it is added to any other server, it leaves automatically.

## Technology

Node.js · TypeScript (strict) · Discord.js v14 · MongoDB · Mongoose · pino · zod · Vitest

## Quick start

```powershell
npm install
copy .env.example .env          # then fill in your values
npm run deploy:commands         # register slash commands
npm run dev                     # run the bot (restarts on save)
```

Full Windows instructions: [docs/SETUP.md](docs/SETUP.md)

## Scripts

| Command                        | What it does                                        |
| ------------------------------ | --------------------------------------------------- |
| `npm run dev`                  | Run in development, restarting when a file is saved |
| `npm run build`                | Compile TypeScript into `dist/`                     |
| `npm start`                    | Run the compiled bot (production)                   |
| `npm run deploy:commands`      | Register slash commands with SDK's server           |
| `npm run deploy:commands:prod` | Same, using the compiled build                      |
| `npm test`                     | Run all automated tests                             |
| `npm run check`                | Type-check, lint, format check and tests in one go  |

## Commands (Phase 1)

| Command         | Who      | Purpose                                         |
| --------------- | -------- | ----------------------------------------------- |
| `/ping`         | Everyone | Check the bot and database are working          |
| `/about`        | Everyone | Bot and club information                        |
| `/config check` | Admins   | Check every channel and role ID in `guild.json` |

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — local development on Windows
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — running 24/7
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the code is organised

## Security

- Never commit `.env` or `config/guild.json`. Both are listed in `.gitignore`.
- If a token is ever exposed, reset it immediately in the Discord Developer Portal.
