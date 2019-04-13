const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
//  console.log("[PM2] Parsing dotenv config : ", result.parsed);

module.exports = {
  apps: [
    {
      name: `${result.parsed.DEVICE_NAME}-${result.parsed.NODE_ENV}`,
      script: './lib/server.js',
      interpreter: 'node',
      watch: ['lib', 'deploy'],
      ignore_watch: ['node_modules', '*.json'],
      watch_options: {
        followSymlinks: false,
      },
      output: `./log/${result.parsed.DEVICE_NAME}-${
        result.parsed.NODE_ENV
      }.out.log`,
      error: `./log/${result.parsed.DEVICE_NAME}-${
        result.parsed.NODE_ENV
      }.error.log`,
      max_memory_restart: '512M',
      restart_delay: 500,
      wait_ready: true,
      listen_timeout: 3000,
      env: {
        NODE_ENV: 'local',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
