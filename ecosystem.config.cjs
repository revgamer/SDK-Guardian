// PM2 configuration for running SDK Guardian 24/7.
// Usage (after `npm run build`):  pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'sdk-guardian',
      script: 'dist/index.js',
      cwd: __dirname,
      instances: 1, // A Discord bot must run as ONE instance only.
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 5000,
      kill_timeout: 12000, // Allows the bot's 10-second graceful shutdown to finish.
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
