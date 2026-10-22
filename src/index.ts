/**
 * SDK Guardian — entry point.
 *
 * Start-up order:
 *   1. Load and check .env settings
 *   2. Load and check config/guild.json
 *   3. Connect to MongoDB
 *   4. Load commands and events
 *   5. Log in to Discord
 */
import { createClient } from './client.js';
import { loadEnv } from './config/env.js';
import { loadGuildConfig } from './config/guild.js';
import { EVENTS_DIR, MODULES_DIR } from './config/paths.js';
import { connectDatabase, disconnectDatabase } from './core/database/connection.js';
import { loadCommands } from './core/loaders/commandLoader.js';
import { attachEvents, loadEvents } from './core/loaders/eventLoader.js';
import { createLogger, type Logger } from './core/logging/logger.js';
import type { BotContext } from './core/types/BotContext.js';
import { readVersion } from './core/utils/version.js';

async function main(): Promise<void> {
  // 1. Settings. If invalid, explain clearly and stop.
  let env;
  try {
    env = loadEnv();
  } catch (error) {
    process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n\n`);
    process.exit(1);
  }

  const logger = createLogger(env);
  registerProcessHandlers(logger);

  // 2. Server IDs
  const guild = loadGuildConfig(env.GUILD_CONFIG_PATH);
  logger.info({ guildId: guild.guildId, file: env.GUILD_CONFIG_PATH }, 'Guild config loaded');

  // 3. Database first — never accept commands without it.
  await connectDatabase(env.MONGODB_URI, logger, { autoIndex: env.NODE_ENV !== 'production' });

  // 4. Commands and events
  const commands = await loadCommands(MODULES_DIR);
  const events = await loadEvents(EVENTS_DIR);
  logger.info(
    { commands: [...commands.keys()], events: events.length },
    'Commands and events loaded',
  );

  // 5. Discord
  const client = createClient();
  const ctx: BotContext = {
    // The client is only used by handlers after it is ready.
    client: client as BotContext['client'],
    env,
    guild,
    logger,
    commands,
    startedAt: new Date(),
    version: readVersion(),
  };
  attachEvents(client, events, ctx);

  client.on('error', (error) => {
    logger.error({ err: error }, 'Discord client error');
  });
  client.on('warn', (message) => {
    logger.warn(message);
  });

  registerShutdown(logger, async () => {
    await client.destroy();
    await disconnectDatabase(logger);
  });

  await client.login(env.DISCORD_TOKEN);
}

function registerProcessHandlers(logger: Logger): void {
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception — shutting down');
    // Exit so PM2 (or another process manager) can restart cleanly.
    process.exit(1);
  });
}

function registerShutdown(logger: Logger, cleanup: () => Promise<void>): void {
  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down...');

    // Force exit if cleanup hangs.
    const timer = setTimeout(() => process.exit(1), 10_000);
    timer.unref();

    cleanup()
      .then(() => {
        logger.info('Shutdown complete');
        process.exit(0);
      })
      .catch((error: unknown) => {
        logger.error({ err: error }, 'Error during shutdown');
        process.exit(1);
      });
  };
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
}

main().catch((error: unknown) => {
  process.stderr.write(
    `\nSDK Guardian failed to start:\n${error instanceof Error ? error.message : String(error)}\n\n`,
  );
  process.exit(1);
});
