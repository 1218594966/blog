module.exports = {
  apps: [
    {
      name: "personblog",
      script: "site/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      time: true,
      restart_delay: 5000,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000
      }
    }
  ]
};
