/**
 * Structured logger (pino).
 *
 * - Development: readable, coloured output in the terminal.
 * - Production: one JSON object per line, easy to search and store.
 * - Secrets are hidden automatically, even if passed in by mistake.
 */
import { pino, type Logger, type LoggerOptions } from 'pino';
import type { Env } from '../../config/env.js';

export type { Logger } from 'pino';

/** Field names that must never appear in logs. */
export const REDACTED_PATHS = [
  'token',
  '*.token',
  'DISCORD_TOKEN',
  '*.DISCORD_TOKEN',
  'MONGODB_URI',
  '*.MONGODB_URI',
  'uri',
  '*.uri',
  'password',
  '*.password',
  'authorization',
  '*.authorization',
];

export function createLogger(env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>): Logger {
  const options: LoggerOptions = {
    name: 'sdk-guardian',
    level: env.LOG_LEVEL,
    redact: { paths: REDACTED_PATHS, censor: '[hidden]' },
  };

  if (env.NODE_ENV === 'development') {
    options.transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname,name' },
    };
  }

  return pino(options);
}
