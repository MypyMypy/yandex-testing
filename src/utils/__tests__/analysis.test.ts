import {
  transformAnalysisData,
  InvalidServerResponseError,
  convertHighlightsToArray,
  isCsvFile,
  validateServerResponse,
} from '@utils/analysis'
import { describe, it, expect } from 'vitest'

import { mockApiResponse, mockInvalidApiResponse, mockHighlights } from '../../test/mocks'

describe('Утилиты для анализа данных', () => {
  describe('transformAnalysisData', () => {
    it('должен корректно преобразовывать валидный ответ API', () => {
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(mockApiResponse) + '\n')

      const result = transformAnalysisData(data)

      expect(result.highlights).toEqual({
        total_spend_galactic: 1000000,
        less_spent_at: 45,
        big_spent_at: 180,
        less_spent_value: 100,
        big_spent_value: 50000,
        average_spend_galactic: 1000,
        big_spent_civ: 'Galactic Empire',
        less_spent_civ: 'Rebel Alliance',
      })

      expect(result.highlightsToStore).toHaveLength(8)
      expect(result.highlightsToStore[0]).toHaveProperty('title')
      expect(result.highlightsToStore[0]).toHaveProperty('description')
    })

    it('должен выбрасывать InvalidServerResponseError для некорректного ответа', () => {
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(mockInvalidApiResponse) + '\n')

      expect(() => transformAnalysisData(data)).toThrow(InvalidServerResponseError)
    })

    it('должен обрабатывать пустой ответ', () => {
      const encoder = new TextEncoder()
      const data = encoder.encode('\n')

      expect(() => transformAnalysisData(data)).toThrow()
    })

    it('должен обрабатывать некорректный JSON', () => {
      const encoder = new TextEncoder()
      const data = encoder.encode('invalid json\n')

      expect(() => transformAnalysisData(data)).toThrow()
    })
  })

  describe('convertHighlightsToArray', () => {
    it('должен преобразовывать объект подсветок в массив', () => {
      const result = convertHighlightsToArray(mockHighlights)

      expect(result).toHaveLength(9)
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('description')
      
      const totalSpendItem = result.find(item => item.description === 'Общие расходы')
      expect(totalSpendItem?.title).toBe('1000000')
    })

    it('должен корректно обрабатывать числовые значения', () => {
      const highlights = { 
        ...mockHighlights, 
        total_spend_galactic: 1234.56 
      }
      const result = convertHighlightsToArray(highlights)

      const totalSpendItem = result.find(item => item.description === 'Общие расходы')
      expect(totalSpendItem?.title).toBe('1235')
    })
  })

  describe('isCsvFile', () => {
    it('должен возвращать true для CSV файлов', () => {
      const csvFile = new File(['content'], 'test.csv', { type: 'text/csv' })
      expect(isCsvFile(csvFile)).toBe(true)
    })

    it('должен возвращать true для CSV файлов с расширением в верхнем регистре', () => {
      const csvFile = new File(['content'], 'test.CSV', { type: 'text/csv' })
      expect(isCsvFile(csvFile)).toBe(true)
    })

    it('должен возвращать false для не-CSV файлов', () => {
      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      expect(isCsvFile(txtFile)).toBe(false)
    })
  })

  describe('validateServerResponse', () => {
    it('должен возвращать true для валидного ответа', () => {
      expect(validateServerResponse(mockApiResponse)).toBe(true)
    })

    it('должен возвращать false для ответа без валидных ключей', () => {
      expect(validateServerResponse({ invalid_key: 'value' })).toBe(false)
    })

    it('должен выбрасывать ошибку для ответа с null значениями', () => {
      const responseWithNull = { ...mockApiResponse, total_spend_galactic: null } as Record<string, string | number | null>
      expect(() => validateServerResponse(responseWithNull as Record<string, string | number>)).toThrow(InvalidServerResponseError)
    })
  })
})
