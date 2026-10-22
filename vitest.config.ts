import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // The in-memory MongoDB can take a while to start the first time.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
