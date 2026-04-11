module.exports = {
  apps: [
    {
      name: "personblog",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || "1218594966",
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "3919799439",
        SESSION_SECRET: process.env.SESSION_SECRET || "change-this-session-secret"
      }
    }
  ]
};
