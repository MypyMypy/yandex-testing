import { useCsvAnalysis } from '@hooks/use-csv-analysis'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@utils/consts', () => ({
  API_HOST: 'http://localhost:3000',
}))

vi.mock('@utils/analysis', () => ({
  InvalidServerResponseError: class extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'InvalidServerResponseError'
    }
  },
  transformAnalysisData: vi.fn()
}))

describe('useCsvAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('должен успешно анализировать CSV файл', async () => {
    const mockFile = new File(['csv,data\n1,2'], 'test.csv', { type: 'text/csv' })
    const onData = vi.fn()
    const onError = vi.fn()
    const onComplete = vi.fn()

    const { transformAnalysisData } = await import('@utils/analysis')
    vi.mocked(transformAnalysisData).mockReturnValue({
      highlights: { 
        total_spend_galactic: 1000,
        average_spend_galactic: 100,
        big_spent_value: 5000,
        less_spent_value: 50,
        big_spent_civ: 'Empire',
        less_spent_civ: 'Rebels',
        big_spent_at: 120,
        less_spent_at: 30,
        rows_affected: 1000
      },
      highlightsToStore: [{ title: 'Test', description: 'Test highlight' }]
    })

    const mockStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode('{"total_spend": 1000}\n'))
        controller.close()
      }
    })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
    })

    const { result } = renderHook(() =>
      useCsvAnalysis({
        onData,
        onError,
        onComplete,
      }),
    )

    await result.current.analyzeCsv(mockFile)

    await waitFor(() => {
      expect(onData).toHaveBeenCalled()
    }, { timeout: 3000 })

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('должен обрабатывать пустое тело ответа', async () => {
    const mockFile = new File(['csv,data\n1,2'], 'test.csv', { type: 'text/csv' })
    const onData = vi.fn()
    const onError = vi.fn()
    const onComplete = vi.fn()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: null,
    })

    const { result } = renderHook(() =>
      useCsvAnalysis({
        onData,
        onError,
        onComplete,
      }),
    )

    await result.current.analyzeCsv(mockFile)

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Неизвестная ошибка парсинга :(',
      }),
    )
  })

  it('должен обрабатывать HTTP ошибки ответов', async () => {
    const mockFile = new File(['csv,data\n1,2'], 'test.csv', { type: 'text/csv' })
    const onData = vi.fn()
    const onError = vi.fn()
    const onComplete = vi.fn()

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    })

    const { result } = renderHook(() =>
      useCsvAnalysis({
        onData,
        onError,
        onComplete,
      }),
    )

    await result.current.analyzeCsv(mockFile)

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Неизвестная ошибка парсинга :(',
      }),
    )
  })

  it('должен обрабатывать сетевые ошибки', async () => {
    const mockFile = new File(['csv,data\n1,2'], 'test.csv', { type: 'text/csv' })
    const onData = vi.fn()
    const onError = vi.fn()
    const onComplete = vi.fn()

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useCsvAnalysis({
        onData,
        onError,
        onComplete,
      }),
    )

    await result.current.analyzeCsv(mockFile)

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Неизвестная ошибка парсинга :(',
      }),
    )
  })
})
