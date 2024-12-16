module.exports = {
  apps: [
    {
      name: '2fa-api',
      script: 'build/bin/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      env: {
        ENV_PATH: '/var/www/html/2fa-api',
      },
    },
  ],
}