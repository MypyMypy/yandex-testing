import { test, expect } from '@playwright/test'

test.describe('Базовая функциональность приложения', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/', { timeout: 5000 })
    } catch (_error) {
      console.log('Development server not available, skipping E2E tests')
      test.skip()
    }
  })

  test('должен загружать главную страницу', async ({ page }) => {
    await expect(page).toHaveTitle(/Сервис межгалактической аналитики/i)
  })

  test('должен иметь кнопку загрузки', async ({ page }) => {
    await expect(page.getByText('Загрузить файл')).toBeVisible()
  })

  test('должен иметь навигацию', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('должен переходить к истории', async ({ page }) => {
    await page.getByRole('link', { name: /история/i }).click()
    await expect(page).toHaveURL('/history')
  })

  test('должен переходить к генератору', async ({ page }) => {
    await page.getByRole('link', { name: /csv генератор/i }).click()
    await expect(page).toHaveURL('/generate')
  })
})
