// Playwright configuration for DistrictScroll
// See https://playwright.dev/docs/test-configuration

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // Increase the global test timeout to 90 seconds to allow for slower initial renders.
  timeout: 90000,
  retries: 0,
  webServer: {
    command: 'node server.js',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
});