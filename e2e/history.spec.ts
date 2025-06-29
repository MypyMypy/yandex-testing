import { test, expect } from '@playwright/test'

test.describe('Страница истории', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('должен показывать сообщение о пустой истории когда нет элементов', async ({ page }) => {
    await page.goto('/history')

    await expect(page.getByText(/\.csv$/)).not.toBeVisible()

    await expect(page.getByRole('button', { name: /очистить всё/i })).not.toBeVisible()

    await expect(page.getByRole('button', { name: /сгенерировать больше/i })).toBeVisible()
  })

  test('должен отображать элементы истории', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const mockHistory = [
        {
          id: '1',
          timestamp: Date.now(),
          fileName: 'test1.csv',
          highlights: {
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
        },
        {
          id: '2',
          timestamp: Date.now() - 1000,
          fileName: 'test2.csv'
        }
      ]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))
    })

    await page.goto('/history')

    await expect(page.getByText('test1.csv')).toBeVisible()
    await expect(page.getByText('test2.csv')).toBeVisible()

    await expect(page.getByText(/обработан успешно/i).first()).toBeVisible()
    await expect(page.getByText(/не удалось обработать/i).first()).toBeVisible()
  })

  test('должен открывать модальное окно с хайлайтами', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const mockHistory = [{
        id: '1',
        timestamp: Date.now(),
        fileName: 'test.csv',
        highlights: {
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
      }]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))
    })

    await page.goto('/history')

    await page.getByRole('button', { name: /открыть хайлайты/i }).click()

    await expect(page.getByText('1000000')).toBeVisible()
    await expect(page.getByText('Galactic Empire')).toBeVisible()
  })

  test('должен удалять отдельные элементы истории', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const mockHistory = [
        {
          id: '1',
          timestamp: Date.now(),
          fileName: 'test1.csv'
        },
        {
          id: '2',
          timestamp: Date.now() - 1000,
          fileName: 'test2.csv'
        }
      ]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))
    })

    await page.goto('/history')

    await expect(page.getByText('test1.csv')).toBeVisible()
    await expect(page.getByText('test2.csv')).toBeVisible()

    await page.getByRole('button', { name: /удалить файл/i }).first().click()

    await expect(page.getByText('test1.csv')).not.toBeVisible()
    await expect(page.getByText('test2.csv')).toBeVisible()
  })

  test('должен очищать всю историю', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const mockHistory = [
        { id: '1', timestamp: Date.now(), fileName: 'test1.csv' },
        { id: '2', timestamp: Date.now() - 1000, fileName: 'test2.csv' }
      ]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))
    })

    await page.goto('/history')

    await expect(page.getByText('test1.csv')).toBeVisible()
    await expect(page.getByText('test2.csv')).toBeVisible()
    await page.getByRole('button', { name: /очистить всё/i }).click()

    await expect(page.getByText('test1.csv')).not.toBeVisible()
    await expect(page.getByText('test2.csv')).not.toBeVisible()

    await expect(page.getByRole('button', { name: /очистить всё/i })).not.toBeVisible()

    await expect(page.getByRole('button', { name: /сгенерировать больше/i })).toBeVisible()
  })

  test('должен переходить на страницу генерации', async ({ page }) => {
    await page.goto('/history')

    await page.getByRole('button', { name: /сгенерировать больше/i }).click()

    await expect(page).toHaveURL('/generate')
    await expect(page.getByText(/сгенерируйте готовый csv-файл/i)).toBeVisible()
  })

  test('должен корректно форматировать даты', async ({ page }) => {
    const specificDate = new Date('2024-01-15T10:30:00Z').getTime()

    await page.goto('/')
    await page.evaluate((timestamp) => {
      const mockHistory = [{
        id: '1',
        timestamp: timestamp,
        fileName: 'test.csv'
      }]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))
    }, specificDate)

    await page.goto('/history')

    await expect(page.getByText(/15\.01\.2024|2024-01-15|Jan 15, 2024/)).toBeVisible()
  })

  test('должен корректно обрабатывать пустые хайлайты', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const mockHistory = [{
        id: '1',
        timestamp: Date.now(),
        fileName: 'error-file.csv'
      }]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))
    })

    await page.goto('/history')

    await expect(page.getByText('error-file.csv')).toBeVisible()
    await expect(page.getByText(/не удалось обработать/i)).toBeVisible()

    const highlightsButton = page.getByRole('button', { name: /открыть хайлайты/i })
    await expect(highlightsButton).toBeVisible()
    await expect(highlightsButton).toHaveClass(/disabled/)
  })
})
