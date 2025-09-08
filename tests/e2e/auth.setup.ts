import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Go to the sign-in page
  await page.goto('/auth/signin')

  // Fill in test credentials
  await page.fill('input[name="email"]', 'test@trakyasolar.com')
  await page.fill('input[name="password"]', 'testpassword123')
  
  // Click sign in button
  await page.click('button[type="submit"]')
  
  // Wait for successful authentication
  await page.waitForURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')

  // Save authentication state
  await page.context().storageState({ path: authFile })
})