# Local setup on Windows

## 1. Install the tools

1. **Node.js 24 LTS** — https://nodejs.org (choose the LTS version). Check in PowerShell:
   ```powershell
   node -v
   ```
   It must show `v22.12` or newer. v24 is recommended.
2. **Git** — https://git-scm.com
3. **MongoDB** — choose one:
   - **Local:** MongoDB Community Server — https://www.mongodb.com/try/download/community.
     Install it "as a Service". Your connection string is then
     `mongodb://127.0.0.1:27017/sdk-guardian`
   - **Cloud:** MongoDB Atlas. Copy the `mongodb+srv://…` string it gives you.

## 2. Create the TEST bot

Use a separate test bot so development never affects the live SDK server.

1. Go to https://discord.com/developers/applications → **New Application** → name it `SDK Guardian Test`.
2. **Bot** page → **Reset Token** → copy the token (you will only see it once).
3. **General Information** → copy the **Application ID**.
4. Create a private Discord server for testing, and create the same roles as SDK
   (Admins, Trustees, Volunteer, SDK Member, Guest, …).
5. Invite the test bot (replace `APPLICATION_ID`):
   ```
   https://discord.com/oauth2/authorize?client_id=APPLICATION_ID&scope=bot+applications.commands&permissions=117760
   ```

The permission number `117760` gives only: View Channels, Send Messages, Embed Links,
Attach Files, Read Message History. **No Administrator.** Later phases will add
Manage Roles and Manage Nicknames.

## 3. Configure the project

In PowerShell, inside `F:\Discord Bot\SDK Guardian`:

```powershell
npm install
copy .env.example .env
```

Open `.env` in a text editor and fill in:

| Setting             | Value                          |
| ------------------- | ------------------------------ |
| `DISCORD_TOKEN`     | Test bot token                 |
| `DISCORD_CLIENT_ID` | Test bot Application ID        |
| `MONGODB_URI`       | Your MongoDB connection string |
| `GUILD_CONFIG_PATH` | `config/guild.test.json`       |

Then create the test server's ID file:

```powershell
copy config\guild.example.json config\guild.test.json
```

Fill in `config\guild.test.json` with the **test server's** IDs.
(Turn on **Developer Mode** in Discord: User Settings → Advanced. Then right-click
a server, channel or role → **Copy ID**.)

`config\guild.json` already holds the **real SDK server** IDs — use it only with the real bot.

## 4. Run

```powershell
npm run deploy:commands
npm run dev
```

You should see `SDK Guardian is online`. In your test server, try `/ping`, `/about`
and `/config check`.

## 5. Before every commit

```powershell
npm run check
```

This runs the type check, linter, format check and all tests.

## Common problems

| Message                                 | Fix                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `DISCORD_TOKEN is missing`              | Check `.env` exists in the project folder and has the token                                 |
| `Could not read config/guild.test.json` | Copy `guild.example.json` as shown in step 3                                                |
| `connect ECONNREFUSED 127.0.0.1:27017`  | MongoDB is not running — start the "MongoDB" Windows service                                |
| `Used disallowed intents`               | Not expected in Phase 1; from Phase 3, enable Server Members Intent in the Developer Portal |
| Commands don't appear                   | Run `npm run deploy:commands` again, then restart Discord (Ctrl+R)                          |
