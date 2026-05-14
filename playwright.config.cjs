const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    viewport: { width: 1365, height: 900 },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5174',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
