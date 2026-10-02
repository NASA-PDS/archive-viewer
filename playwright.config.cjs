const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
    testDir: './tests/browser',
    testMatch: '*.spec.cjs',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 2,
    timeout: 30000,
    expect: { timeout: 10000 },
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://127.0.0.1:3100',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    ],
    webServer: {
        command: 'node tests/browser/start-server.cjs',
        url: 'http://127.0.0.1:3100',
        reuseExistingServer: false,
        timeout: 180000,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    },
})
