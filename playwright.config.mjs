import { defineConfig } from '@playwright/test';
const live = process.env.VERIFY_LIVE_SITE === 'true';
export default defineConfig({
  testDir: './browser-tests',
  timeout: 20000,
  globalTimeout: 180000,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: 'list',
  use: { baseURL: live ? 'https://tapeshelf-reference.pages.dev' : 'http://127.0.0.1:4173', browserName: 'chromium' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'small-mobile', use: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } }
  ],
  webServer: live ? undefined : { command: 'node scripts/build.mjs && node scripts/serve.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 15000 }
});
