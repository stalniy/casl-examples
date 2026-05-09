const { defineConfig } = require('@playwright/test');

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 15_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'blog-app',
      testDir: './blog-app',
      use: {
        baseURL,
      },
    },
    {
      name: 'todo-app',
      testDir: './todo-app',
      use: {
        baseURL,
      },
    },
  ],
});
