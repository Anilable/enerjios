import { test, expect } from '@playwright/test'

test.use({ storageState: 'playwright/.auth/user.json' })

test.describe('Projects Management', () => {
  test('can create a new project', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Click new project button
    await page.click('[data-testid="new-project-btn"]')
    await expect(page).toHaveURL('/dashboard/projects/new')
    
    // Fill project form
    await page.fill('[name="name"]', 'Test Solar Project')
    await page.fill('[name="description"]', 'E2E test project description')
    await page.selectOption('[name="projectType"]', 'RESIDENTIAL')
    await page.fill('[name="systemSize"]', '10.5')
    await page.fill('[name="address"]', 'Test Address, Istanbul')
    
    // Select customer
    await page.click('[data-testid="customer-select"]')
    await page.click('[data-testid="customer-option"]:first-child')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify redirect and success
    await expect(page).toHaveURL(/\/dashboard\/projects\/\w+/)
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Test Solar Project')
  })

  test('can view project details', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Click on first project
    const firstProject = page.locator('[data-testid="project-card"]').first()
    await firstProject.click()
    
    // Verify project details page
    await expect(page).toHaveURL(/\/dashboard\/projects\/\w+/)
    await expect(page.locator('[data-testid="project-details"]')).toBeVisible()
    
    // Check for project information sections
    await expect(page.locator('[data-testid="project-info"]')).toBeVisible()
    await expect(page.locator('[data-testid="system-specs"]')).toBeVisible()
    await expect(page.locator('[data-testid="financial-info"]')).toBeVisible()
  })

  test('can update project status', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Go to project details
    const firstProject = page.locator('[data-testid="project-card"]').first()
    await firstProject.click()
    
    // Click edit button
    await page.click('[data-testid="edit-project-btn"]')
    
    // Change status
    await page.selectOption('[name="status"]', 'IN_PROGRESS')
    
    // Save changes
    await page.click('button[type="submit"]')
    
    // Verify status update
    await expect(page.locator('[data-testid="project-status"]')).toContainText('Devam Ediyor')
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('can generate project quote', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Go to project details
    const firstProject = page.locator('[data-testid="project-card"]').first()
    await firstProject.click()
    
    // Click generate quote button
    await page.click('[data-testid="generate-quote-btn"]')
    
    // Fill quote form
    await page.fill('[name="title"]', 'Solar Installation Quote')
    await page.fill('[name="description"]', 'Detailed quote for solar installation')
    await page.fill('[name="validityDays"]', '30')
    
    // Add quote items
    await page.click('[data-testid="add-quote-item"]')
    await page.fill('[name="items[0].description"]', 'Solar Panels')
    await page.fill('[name="items[0].quantity"]', '20')
    await page.fill('[name="items[0].unitPrice"]', '500')
    
    // Submit quote
    await page.click('button[type="submit"]')
    
    // Verify quote creation
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page).toHaveURL(/\/dashboard\/quotes\/\w+/)
  })

  test('can use 3D designer', async ({ page }) => {
    await page.goto('/dashboard/designer')
    
    // Wait for 3D canvas to load
    await expect(page.locator('[data-testid="three-canvas"]')).toBeVisible()
    
    // Test map integration
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
    
    // Test panel placement tools
    await page.click('[data-testid="panel-tool"]')
    await expect(page.locator('[data-testid="panel-options"]')).toBeVisible()
    
    // Test save design
    await page.click('[data-testid="save-design-btn"]')
    await page.fill('[name="designName"]', 'Test Design')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('displays project analytics', async ({ page }) => {
    await page.goto('/dashboard/analytics')
    
    // Check analytics cards
    await expect(page.locator('[data-testid="total-projects-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-revenue-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="conversion-rate-metric"]')).toBeVisible()
    
    // Check charts
    await expect(page.locator('[data-testid="revenue-trend-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="project-status-chart"]')).toBeVisible()
    
    // Test time range selector
    await page.selectOption('[data-testid="timeframe-selector"]', '90d')
    await page.waitForLoadState('networkidle')
    
    // Verify data updated
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible()
  })

  test('can export project data', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Start download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-projects-btn"]')
    ])
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/projects.*\.(xlsx|csv)/)
  })
})