import { Writable } from 'node:stream';
import { pino } from 'pino';
import { describe, expect, it } from 'vitest';
import { REDACTED_PATHS } from '../../src/core/logging/logger.js';

describe('logger redaction', () => {
  it('hides tokens and connection strings', () => {
    let output = '';
    const stream = new Writable({
      write(chunk: Buffer, _encoding, done) {
        output += chunk.toString();
        done();
      },
    });
    const logger = pino({ redact: { paths: REDACTED_PATHS, censor: '[hidden]' } }, stream);
    logger.info({ token: 'abc.def.ghi', env: { MONGODB_URI: 'mongodb://u:pw@h' } }, 'test');
    expect(output).not.toContain('abc.def.ghi');
    expect(output).not.toContain('pw@h');
    expect(output).toContain('[hidden]');
  });
});
