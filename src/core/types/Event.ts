import type { ClientEvents } from 'discord.js';
import type { BotContext } from './BotContext.js';

/** The shape every event file must export as its default export. */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  /** Run only the first time the event happens. */
  once?: boolean;
  execute(ctx: BotContext, ...args: ClientEvents[K]): Promise<void>;
}

/** Helper that gives full type checking when writing an event file. */
export function defineEvent<K extends keyof ClientEvents>(event: BotEvent<K>): BotEvent<K> {
  return event;
}
