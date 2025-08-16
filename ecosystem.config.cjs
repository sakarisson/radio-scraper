module.exports = {
  apps: [
    {
      name: "web",
      cwd: ".",
      script: "yarn",
      args: "serve:web",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        DB_PATH: process.env.DB_PATH || "/data/app.db",
      },
      output: "/proc/1/fd/1",
      error: "/proc/1/fd/2",
      time: true,
    },
    {
      name: "scraper",
      cwd: ".",
      script: "node",
      args: ["packages/scraper/dist/scraper.js"],
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        DB_PATH: process.env.DB_PATH || "/data/app.db",
      },
      output: "/proc/1/fd/1",
      error: "/proc/1/fd/2",
      time: true,
      cron_restart: "0 6 * * *",
    },
  ],
};
