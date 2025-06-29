import { useAnalysisStore } from '@store/analysisStore'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { mockAnalysisHighlights } from '../../test/mocks'

describe('Хранилище анализа данных', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAnalysisStore())
    act(() => {
      result.current.reset()
    })
  })

  it('должен иметь начальное состояние', () => {
    const { result } = renderHook(() => useAnalysisStore())

    expect(result.current.file).toBeNull()
    expect(result.current.status).toBe('idle')
    expect(result.current.highlights).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('должен устанавливать файл', () => {
    const { result } = renderHook(() => useAnalysisStore())
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })

    act(() => {
      result.current.setFile(mockFile)
    })

    expect(result.current.file).toBe(mockFile)
  })

  it('должен устанавливать статус', () => {
    const { result } = renderHook(() => useAnalysisStore())

    act(() => {
      result.current.setStatus('processing')
    })

    expect(result.current.status).toBe('processing')
  })

  it('должен устанавливать подсветки', () => {
    const { result } = renderHook(() => useAnalysisStore())

    act(() => {
      result.current.setHighlights(mockAnalysisHighlights)
    })

    expect(result.current.highlights).toEqual(mockAnalysisHighlights)
  })

  it('должен устанавливать ошибку', () => {
    const { result } = renderHook(() => useAnalysisStore())
    const errorMessage = 'Something went wrong'

    act(() => {
      result.current.setError(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('должен сбрасывать все состояние', () => {
    const { result } = renderHook(() => useAnalysisStore())
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })

    act(() => {
      result.current.setFile(mockFile)
      result.current.setStatus('completed')
      result.current.setHighlights(mockAnalysisHighlights)
      result.current.setError('Error message')
    })

    expect(result.current.file).toBe(mockFile)
    expect(result.current.status).toBe('error')
    expect(result.current.highlights).toEqual(mockAnalysisHighlights)
    expect(result.current.error).toBe('Error message')

    act(() => {
      result.current.reset()
    })

    expect(result.current.file).toBeNull()
    expect(result.current.status).toBe('idle')
    expect(result.current.highlights).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('должен корректно обрабатывать состояния рабочего процесса', () => {
    const { result } = renderHook(() => useAnalysisStore())
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })

    act(() => {
      result.current.setFile(mockFile)
    })
    expect(result.current.status).toBe('idle')

    act(() => {
      result.current.setStatus('processing')
    })
    expect(result.current.status).toBe('processing')

    act(() => {
      result.current.setHighlights(mockAnalysisHighlights)
      result.current.setStatus('completed')
    })
    expect(result.current.status).toBe('completed')
    expect(result.current.highlights).toEqual(mockAnalysisHighlights)
    expect(result.current.error).toBeNull()
  })

  it('должен обрабатывать рабочий процесс с ошибкой', () => {
    const { result } = renderHook(() => useAnalysisStore())
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })

    act(() => {
      result.current.setFile(mockFile)
      result.current.setStatus('processing')
    })

    act(() => {
      result.current.setError('Processing failed')
      result.current.setStatus('error')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Processing failed')
    expect(result.current.file).toBe(mockFile)
  })

  it('должен очищать ошибку при установке нового файла', () => {
    const { result } = renderHook(() => useAnalysisStore())
    const mockFile1 = new File(['content1'], 'test1.csv', { type: 'text/csv' })
    const mockFile2 = new File(['content2'], 'test2.csv', { type: 'text/csv' })

    act(() => {
      result.current.setFile(mockFile1)
      result.current.setError('Previous error')
    })

    expect(result.current.error).toBe('Previous error')

    act(() => {
      result.current.setFile(mockFile2)
      result.current.setError(null)
    })

    expect(result.current.file).toBe(mockFile2)
    expect(result.current.error).toBeNull()
  })
})
