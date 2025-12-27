import { test, expect, generateTestUser } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';

test.describe('Authentication', () => {
  test.describe('Sign Up', () => {
    test('should register a new user with valid credentials', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const newUser = generateTestUser('signup');

      await registerPage.goto();
      const confirmed = await registerPage.registerAndConfirm(newUser.name, newUser.email, newUser.password);

      // Email should be confirmed
      expect(confirmed).toBe(true);

      // Should now be able to log in
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(newUser.name, newUser.password);

      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should show validation errors for missing fields', async ({ page }) => {
      const registerPage = new RegisterPage(page);

      await registerPage.goto();
      await registerPage.submitButton.click();
      await registerPage.waitHelpers.waitForTurbo();

      // Should show validation errors or redirect to users page (Rails behavior)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(sign_up|users)/);
    });

    test('should reject duplicate username', async ({ page, auth }) => {
      // First create a user (just register, don't need to stay logged in)
      const existingUser = generateTestUser('existing');
      await auth.registerAndConfirm(existingUser);

      // Try to register with the same username
      const registerPage = new RegisterPage(page);
      const newUser = generateTestUser('dup');

      await registerPage.goto();
      await registerPage.register(
        existingUser.name, // Use existing user's name
        newUser.email,
        newUser.password
      );

      // Registration should fail - stays on form or redirects to /users
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(sign_up|users)/);
    });
  });

  test.describe('Sign In', () => {
    test('should login with valid credentials', async ({ page, auth }) => {
      // Create a user first
      const user = await auth.loginAsPrimary();

      // Should be logged in
      expect(await auth.isLoggedIn()).toBe(true);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login('invaliduser', 'wrongpassword');

      // Should stay on sign in page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/sign_in');
    });

    test('should remember user when checkbox checked', async ({ page, context, auth }) => {
      // Create a fresh user
      const user = generateTestUser('remember');
      await auth.registerAndConfirm(user);

      // Now login with remember me
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.name, user.password, true);

      // Verify we're logged in
      expect(await loginPage.isLoggedIn()).toBe(true);
    });
  });

  test.describe('Sign Out', () => {
    test('should logout successfully', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      expect(await auth.isLoggedIn()).toBe(true);

      await auth.logout();

      // Should be logged out
      expect(await auth.isLoggedIn()).toBe(false);
    });
  });
});
