const { test, expect } = require('@playwright/test');
const { login, openLogin, submitLogin } = require('./actions');

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await openLogin(page);
  });

  for (const email of ['writer@casl.io', 'another.writer@casl.io', 'admin@casl.io']) {
    test(`can login as ${email}`, async ({ page }) => {
      await login(page, email);
      await expect(page.locator('#user-email')).toHaveText(email);
    });
  }

  test('requires email to be non-empty', async ({ page }) => {
    await submitLogin(page, ' ');

    await expect(page.locator('.field-errors, .MuiFormHelperText-root.Mui-error').first()).toBeVisible();
    await expect(page.locator('#user-email')).toHaveCount(0);
  });

  test('requires password to be non-empty', async ({ page }) => {
    await submitLogin(page, 'some.email@example.com', ' ');

    await expect(page.locator('.field-errors, .MuiFormHelperText-root.Mui-error').first()).toBeVisible();
    await expect(page.locator('#user-email')).toHaveCount(0);
  });
});
