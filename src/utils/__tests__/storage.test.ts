import { addToHistory, clearHistory, getHistory, removeFromHistory } from '@utils/storage'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockHighlights } from '../../test/mocks'

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123'),
  },
})

describe('Утилиты для работы с локальным хранилищем', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getHistory', () => {
    it('должен возвращать пустой массив, когда история отсутствует', () => {
      const result = getHistory()
      expect(result).toEqual([])
    })

    it('должен возвращать историю из localStorage', () => {
      const mockHistory = [
        {
          id: '1',
          timestamp: Date.now(),
          fileName: 'test.csv',
          highlights: mockHighlights,
        },
      ]
      localStorage.setItem('tableHistory', JSON.stringify(mockHistory))

      const result = getHistory()
      expect(result).toEqual(mockHistory)
    })

    it('должен возвращать пустой массив при некорректном JSON в localStorage', () => {
      localStorage.setItem('tableHistory', 'invalid json')

      const result = getHistory()
      expect(result).toEqual([])
    })
  })

  describe('addToHistory', () => {
    it('должен добавлять новый элемент в историю с id и timestamp', () => {
      const item = {
        fileName: 'test.csv',
        highlights: mockHighlights,
      }

      const result = addToHistory(item)

      expect(result).toEqual({
        ...item,
        id: 'mock-uuid-123',
        timestamp: expect.any(Number),
      })

      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toEqual(result)
    })

    it('должен добавлять элемент в начало существующей истории', () => {
      const existingItem = {
        id: 'existing-id',
        timestamp: Date.now() - 1000,
        fileName: 'existing.csv',
        highlights: mockHighlights,
      }
      localStorage.setItem('tableHistory', JSON.stringify([existingItem]))

      const newItem = {
        fileName: 'new.csv',
        highlights: mockHighlights,
      }

      addToHistory(newItem)

      const history = getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].fileName).toBe('new.csv')
      expect(history[1]).toEqual(existingItem)
    })

    it('должен обрабатывать ошибки localStorage', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      const item = {
        fileName: 'test.csv',
        highlights: mockHighlights,
      }

      expect(() => addToHistory(item)).toThrow()
      
      localStorage.setItem = originalSetItem
    })
  })

  describe('removeFromHistory', () => {
    it('должен удалять элемент с соответствующим id', () => {
      const items = [
        {
          id: '1',
          timestamp: Date.now(),
          fileName: 'test1.csv',
          highlights: mockHighlights,
        },
        {
          id: '2',
          timestamp: Date.now() - 1000,
          fileName: 'test2.csv',
          highlights: mockHighlights,
        },
      ]
      localStorage.setItem('tableHistory', JSON.stringify(items))

      removeFromHistory('1')

      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].id).toBe('2')
    })

    it('должен корректно обрабатывать несуществующий id', () => {
      const items = [
        {
          id: '1',
          timestamp: Date.now(),
          fileName: 'test1.csv',
          highlights: mockHighlights,
        },
      ]
      localStorage.setItem('tableHistory', JSON.stringify(items))

      removeFromHistory('non-existent')

      const history = getHistory()
      expect(history).toHaveLength(1)
    })

    it('должен обрабатывать ошибки localStorage', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      expect(() => removeFromHistory('1')).toThrow()
      
      localStorage.setItem = originalSetItem
    })
  })

  describe('clearHistory', () => {
    it('должен очищать всю историю', () => {
      localStorage.setItem('tableHistory', JSON.stringify([{ id: '1', fileName: 'test.csv' }]))

      clearHistory()

      expect(localStorage.getItem('tableHistory')).toBeNull()
    })

    it('должен обрабатывать ошибки localStorage', () => {
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      expect(() => clearHistory()).toThrow()
      
      localStorage.removeItem = originalRemoveItem
    })
  })
})
