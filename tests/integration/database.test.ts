import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { pino } from 'pino';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
} from '../../src/core/database/connection.js';

const logger = pino({ level: 'silent' });
let server: MongoMemoryServer | undefined;

function requireServer(): MongoMemoryServer {
  if (server === undefined) throw new Error('In-memory MongoDB did not start');
  return server;
}

beforeAll(async () => {
  server = await MongoMemoryServer.create();
});

afterAll(async () => {
  await disconnectDatabase(logger);
  await server?.stop();
});

describe('database connection', () => {
  it('connects, reports status and disconnects', async () => {
    expect(getDatabaseStatus()).toBe('disconnected');
    await connectDatabase(requireServer().getUri('sdk-guardian-test'), logger, { autoIndex: true });
    expect(getDatabaseStatus()).toBe('connected');

    // A simple write and read proves the connection works.
    const Probe = mongoose.model('Probe', new mongoose.Schema({ value: String }));
    await Probe.create({ value: 'ok' });
    expect((await Probe.findOne().lean())?.value).toBe('ok');

    await disconnectDatabase(logger);
    expect(getDatabaseStatus()).toBe('disconnected');
  });

  it('fails clearly when the database cannot be reached', async () => {
    await expect(
      connectDatabase('mongodb://127.0.0.1:1/unreachable', logger, {
        autoIndex: false,
        serverSelectionTimeoutMS: 500,
      }),
    ).rejects.toThrow();
  });
});
