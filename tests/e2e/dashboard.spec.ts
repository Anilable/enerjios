import { test, expect } from '@playwright/test'

// Use the authenticated state
test.use({ storageState: 'playwright/.auth/user.json' })

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('displays dashboard overview correctly', async ({ page }) => {
    // Check if main dashboard elements are present
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Check for key metrics cards
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-customers"]')).toBeVisible()
    
    // Check for charts
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="project-status-chart"]')).toBeVisible()
  })

  test('navigation works correctly', async ({ page }) => {
    // Test sidebar navigation
    await page.click('[data-testid="nav-projects"]')
    await expect(page).toHaveURL('/dashboard/projects')
    await expect(page.locator('h1')).toContainText('Projeler')

    await page.click('[data-testid="nav-customers"]')
    await expect(page).toHaveURL('/dashboard/customers')
    await expect(page.locator('h1')).toContainText('Müşteriler')

    await page.click('[data-testid="nav-quotes"]')
    await expect(page).toHaveURL('/dashboard/quotes')
    await expect(page.locator('h1')).toContainText('Teklifler')
  })

  test('filters and search work', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'COMPLETED')
    await page.waitForLoadState('networkidle')
    
    // Verify filtered results
    const projectCards = page.locator('[data-testid="project-card"]')
    const count = await projectCards.count()
    
    if (count > 0) {
      // Check that all visible projects have the correct status
      for (let i = 0; i < count; i++) {
        await expect(projectCards.nth(i).locator('[data-testid="project-status"]')).toContainText('Tamamlandı')
      }
    }
  })

  test('quick actions work', async ({ page }) => {
    // Test quick action buttons
    await page.click('[data-testid="quick-new-project"]')
    await expect(page).toHaveURL('/dashboard/projects/new')
    
    await page.goBack()
    
    await page.click('[data-testid="quick-new-quote"]')
    await expect(page).toHaveURL('/dashboard/quotes/new')
  })

  test('responsive design works on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
      
      // Test mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]')
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
      
      // Navigate via mobile menu
      await page.click('[data-testid="mobile-nav-projects"]')
      await expect(page).toHaveURL('/dashboard/projects')
    }
  })
})