# Running SDK Guardian 24/7

> Hosting has not been chosen yet. This is the recommended approach.

## Recommended setup

- A small **Linux VPS** (virtual private server)
- **Node.js 24 LTS**
- **PM2** to keep the bot running and restart it after crashes or reboots
- **MongoDB** (Atlas, or MongoDB installed on the VPS) with a user that can only
  read and write the `sdk-guardian` database

## First-time setup on the server

```bash
git clone https://github.com/revgamer/SDK-Guardian.git
cd SDK-Guardian
npm ci
npm run build

# Create .env with the LIVE bot token and NODE_ENV=production
nano .env
# Copy config/guild.json (the real SDK IDs) to the server, e.g. with scp

npm run deploy:commands:prod
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup          # follow the printed instruction so PM2 starts on boot
```

## Updating

```bash
git pull
npm ci
npm run build
npm run deploy:commands:prod   # only needed if commands changed
pm2 reload sdk-guardian
```

## Useful PM2 commands

| Command                    | Purpose             |
| -------------------------- | ------------------- |
| `pm2 status`               | Is the bot running? |
| `pm2 logs sdk-guardian`    | View the bot's log  |
| `pm2 restart sdk-guardian` | Restart             |

## Security checklist

- [ ] `.env` is only on the server, never in Git
- [ ] The database user is not an admin
- [ ] MongoDB is not open to the internet without a password (Atlas: IP access list)
- [ ] The server's operating system receives automatic security updates
- [ ] Only one copy of the bot runs at a time
