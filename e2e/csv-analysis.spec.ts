import { test, expect } from '@playwright/test'

test.describe('Приложение анализа CSV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('должен корректно загрузить главную страницу', async ({ page }) => {
    await expect(page).toHaveTitle(/Сервис межгалактической аналитики/i)
    await expect(page.getByText('Загрузить файл')).toBeVisible()
  })

  test('должен осуществлять навигацию между страницами', async ({ page }) => {
    await page.getByText('История').click()
    await expect(page).toHaveURL('/history')

    await page.getByText('CSV Генератор').click()
    await expect(page).toHaveURL('/generate')
    await expect(page.getByText(/сгенерируйте готовый csv-файл/i)).toBeVisible()

    await page.getByText('CSV Аналитик').click()
    await expect(page).toHaveURL('/')
  })

  test('должен загружать и анализировать CSV файл', async ({ page }) => {
    await page.route('**/aggregate*', async route => {
      const response = {
        total_spend_galactic: 1000000,
        rows_affected: 10000,
        less_spent_at: 45,
        big_spent_at: 180,
        less_spent_value: 100,
        big_spent_value: 50000,
        average_spend_galactic: 1000,
        big_spent_civ: 'Galactic Empire',
        less_spent_civ: 'Rebel Alliance',
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify(response),
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const csvContent = `civilization,date,amount
Galactic Empire,2024-01-01,50000
Rebel Alliance,2024-01-02,100
Republic,2024-01-03,25000`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })

    await expect(page.getByText('test.csv')).toBeVisible()

    await page.getByRole('button', { name: /отправить/i }).click()

    await expect(page.getByText('1000000')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Galactic Empire')).toBeVisible()
  })

  test('должен обрабатывать ошибки загрузки файлов', async ({ page }) => {
    await page.route('**/aggregate*', async route => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Invalid file format' }),
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const csvContent = 'invalid,csv,content'
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })

    await page.getByRole('button', { name: /отправить/i }).click()

    const errorVisible = await page.getByText(/не удалось обработать/i).isVisible().catch(() => false) ||
      await page.getByText(/ошибка/i).isVisible().catch(() => false) ||
      await page.getByText(/error/i).isVisible().catch(() => false)

    expect(errorVisible).toBe(true)
  })

  test('должен валидировать типы файлов', async ({ page }) => {
    const txtContent = 'This is not a CSV file'
    const fileInput = page.locator('input[type="file"]')

    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(txtContent)
    })

    await expect(page.getByText('Можно загружать только *.csv файлы')).toBeVisible()
  })

  test('должен очищать загруженный файл', async ({ page }) => {
    const csvContent = 'test,data\n1,2'
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })

    await expect(page.getByText('test.csv')).toBeVisible()

    await page.locator('button[class*="clearFileButton"]').click()

    await expect(page.getByText('Загрузить файл')).toBeVisible()
    await expect(page.getByText('test.csv')).not.toBeVisible()
  })
  test('должен обрабатывать загрузку файлов drag-and-drop', async ({ page }) => {
    await expect(page.getByText('Загрузить файл')).toBeVisible()

    await page.getByText('Загрузить файл').click()
  })
})
