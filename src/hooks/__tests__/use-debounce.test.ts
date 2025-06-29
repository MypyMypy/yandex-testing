import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from '../use-debounce'

global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('тип анимации (по умолчанию)', () => {
    it('должен дебаунсить вызовы функций с использованием requestAnimationFrame', async () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() => useDebounce(mockFn))

      act(() => {
        result.current('arg1')
        result.current('arg2')
        result.current('arg3')
      })

      expect(mockFn).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1')
      expect(mockFn).toHaveBeenNthCalledWith(2, 'arg2')
      expect(mockFn).toHaveBeenNthCalledWith(3, 'arg3')
    })

    it('должен обрабатывать все вызовы в очереди', async () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() => useDebounce(mockFn))

      act(() => {
        result.current('call1')
        result.current('call2')
        result.current('call3')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('тип timeout', () => {
    it('должен дебаунсить вызовы функций с использованием setTimeout', () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() =>
        useDebounce(mockFn, { type: 'timeout', delay: 100 })
      )

      act(() => {
        result.current('arg1')
        result.current('arg2')
        result.current('arg3')
      })

      expect(mockFn).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(350)
      })

      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('должен использовать настраиваемую задержку', () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() =>
        useDebounce(mockFn, { type: 'timeout', delay: 500 })
      )

      act(() => {
        result.current('test')
      })

      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(mockFn).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('должен обрабатывать несколько вызовов последовательно', () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() =>
        useDebounce(mockFn, { type: 'timeout', delay: 50 })
      )

      act(() => {
        result.current('call1')
        result.current('call2')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('граничные случаи', () => {
    it('должен обрабатывать функции с несколькими аргументами', () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() =>
        useDebounce(mockFn, { type: 'timeout', delay: 50 })
      )

      act(() => {
        result.current('arg1', 'arg2', 123)
      })

      act(() => {
        vi.advanceTimersByTime(60)
      })

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
    })

    it('должен обрабатывать функции без аргументов', () => {
      const mockFn = vi.fn()
      const { result } = renderHook(() =>
        useDebounce(mockFn, { type: 'timeout', delay: 50 })
      )

      act(() => {
        result.current()
      })

      act(() => {
        vi.advanceTimersByTime(60)
      })

      expect(mockFn).toHaveBeenCalledWith()
    })
  })
})
