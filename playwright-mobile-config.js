const { devices } = require('@playwright/test');

module.exports = {
  use: {
    ...devices['iPhone 12'],
    headless: false,
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
  },
  browser: {
    launchOptions: {
      headless: false
    }
  }
};
