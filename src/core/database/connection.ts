/**
 * MongoDB connection management (Mongoose).
 *
 * The bot connects to the database BEFORE logging into Discord, so it never
 * accepts commands without a working database.
 */
import mongoose from 'mongoose';
import type { Logger } from '../logging/logger.js';

export type DatabaseStatus = 'disconnected' | 'connected' | 'connecting' | 'disconnecting';

const STATUS_BY_STATE: Record<number, DatabaseStatus> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let listenersAttached = false;

export interface ConnectOptions {
  /** Build indexes automatically. On in development, off in production. */
  autoIndex: boolean;
  /** How long to wait for the database before giving up (milliseconds). */
  serverSelectionTimeoutMS?: number;
}

export async function connectDatabase(
  uri: string,
  logger: Logger,
  options: ConnectOptions,
): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  if (!listenersAttached) {
    const connection = mongoose.connection;
    connection.on('disconnected', () => {
      logger.warn('Database disconnected — Mongoose will try to reconnect');
    });
    connection.on('reconnected', () => {
      logger.info('Database reconnected');
    });
    connection.on('error', (error: unknown) => {
      logger.error({ err: error }, 'Database error');
    });
    listenersAttached = true;
  }

  logger.info('Connecting to database...');
  const instance = await mongoose.connect(uri, {
    autoIndex: options.autoIndex,
    serverSelectionTimeoutMS: options.serverSelectionTimeoutMS ?? 10_000,
    maxPoolSize: 10,
    appName: 'sdk-guardian',
  });
  logger.info({ database: instance.connection.name }, 'Database connected');
  return instance;
}

export async function disconnectDatabase(logger: Logger): Promise<void> {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.disconnected) return;
  await mongoose.disconnect();
  logger.info('Database connection closed');
}

export function getDatabaseStatus(): DatabaseStatus {
  return STATUS_BY_STATE[mongoose.connection.readyState] ?? 'disconnected';
}
