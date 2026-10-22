/**
 * Finds Discord event handlers in src/events/ and attaches them to the client.
 */
import type { Client } from 'discord.js';
import { pathToFileURL } from 'node:url';
import type { BotContext } from '../types/BotContext.js';
import type { BotEvent } from '../types/Event.js';
import { listLoadableFiles } from './fileScan.js';

function isEvent(value: unknown): value is BotEvent {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<BotEvent>;
  return typeof candidate.name === 'string' && typeof candidate.execute === 'function';
}

export async function loadEvents(eventsDir: string): Promise<BotEvent[]> {
  const events: BotEvent[] = [];
  for (const file of listLoadableFiles(eventsDir)) {
    const imported = (await import(pathToFileURL(file).href)) as { default?: unknown };
    if (!isEvent(imported.default)) {
      throw new Error(`${file} does not default-export a valid event.`);
    }
    events.push(imported.default);
  }
  return events;
}

/**
 * Attach events to the client. Errors inside a handler are logged and never
 * crash the bot.
 */
export function attachEvents(client: Client, events: BotEvent[], ctx: BotContext): void {
  for (const event of events) {
    const run = (...args: unknown[]): void => {
      // Discord.js passes the arguments that match event.name.
      const handler = event as { execute(ctx: BotContext, ...rest: unknown[]): Promise<void> };
      handler.execute(ctx, ...args).catch((error: unknown) => {
        ctx.logger.error({ err: error, event: event.name }, 'Event handler failed');
      });
    };
    if (event.once === true) client.once(event.name, run);
    else client.on(event.name, run);
  }
}
