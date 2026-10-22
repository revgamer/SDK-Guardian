# SDK Guardian architecture

## Three layers

| Layer        | Folder                                  | Job                                              |
| ------------ | --------------------------------------- | ------------------------------------------------ |
| 1. Interface | `src/events/`, `src/modules/*/commands` | Receive Discord input, check permission, reply   |
| 2. Services  | `src/modules/*/services` (Phase 2+)     | Club rules and business logic                    |
| 3. Data      | `src/modules/*/models` (Phase 2+)       | Mongoose models — the only code touching MongoDB |

Each layer only calls the layer below. The website dashboard (Phase 8) will reuse
the service layer.

## Start-up order (`src/index.ts`)

1. Validate `.env` (`src/config/env.ts`) — stops with a clear message if wrong
2. Validate `config/guild.json` (`src/config/guild.ts`)
3. Connect to MongoDB — the bot never runs without its database
4. Load commands from `src/modules/<module>/commands/` for modules switched on in
   `src/config/features.ts`, and events from `src/events/`
5. Log in to Discord

## How a command runs

`interactionCreate` → `commandRouter` → SDK server check → permission guard →
cooldown → `command.execute()` → log. Any error goes to `errorHandler`:
expected errors (`AppError`) show their message; unexpected errors show a
reference code and are logged in full.

## Permission levels (`src/core/permissions/levels.ts`)

| Level | Name      | Discord roles                               |
| ----- | --------- | ------------------------------------------- |
| 0     | Everyone  | —                                           |
| 1     | Guest     | Guest (given after agreeing to the rules)   |
| 2     | Member    | SDK Member, SDK Junior Member               |
| 3     | Volunteer | Volunteer (moderators)                      |
| 4     | Trustee   | Trustees, Chairperson, Secretary, Treasurer |
| 5     | Admin     | Admins, SDK Founder, server owner           |

Junior Members are Members with extra safeguards, checked with `isJuniorMember()`.

## Configuration

| File                        | Contains                        | In Git? |
| --------------------------- | ------------------------------- | ------- |
| `.env`                      | Token, client ID, database URI  | No      |
| `config/guild.json`         | Real SDK channel/role/emoji IDs | No      |
| `config/guild.example.json` | Same structure, blank           | Yes     |

## Adding a command

1. Create `src/modules/<module>/commands/<name>.ts`
2. `export default defineCommand({ data, permission, execute })`
3. Make sure the module is switched on in `src/config/features.ts`
4. `npm run deploy:commands`

## Agreed designs for later phases

- **Welcome (Phase 3):** embed in #welcome with Set your name / Rules / Choose Roles buttons.
- **Rules (Phase 3):** in #sdk-rules, step 1 Set your name (First name + Surname form),
  step 2 "I have read and agree". Gives Guest. Logged to #sdk-rules-log. Rules have
  versions; a new version requires everyone to agree again. Junior name format: to be decided.
- **Membership (Phase 3):** approval removes Guest and gives SDK Member / Junior Member.
  When a membership ends, Guest is given back.
- **Notification roles:** Club News and Social Events → #sdk-announcement (everyone);
  Practice Alerts and Event Alerts → #member-announcements (members only).
- **RaceFacer (Phase 5):** a "results source" interface, with a manual import source as fallback.
