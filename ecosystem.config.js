module.exports = {
  apps: [
    {
      name: 'dao-api',
      script: 'dist/main.js',
      wait_ready: true,
      listen_timeout: 3000,
      restart_delay: 3000,
      instances: 2,
      instance_var: 'APP_INSTANCE_SEQ',
      exec_mode: 'cluster',
      cwd: '.',
      env: {},
    },
  ],
};
