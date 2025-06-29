import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock fetch API
global.fetch = vi.fn()

// Simple ReadableStream mock for testing
if (typeof ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.ReadableStream = class MockReadableStream {
    private _source: { start?: (controller: { enqueue: (chunk: unknown) => void; close: () => void }) => void }
    private _chunk?: unknown
    private _consumed = false

    constructor(underlyingSource: { start?: (controller: { enqueue: (chunk: unknown) => void; close: () => void }) => void }) {
      this._source = underlyingSource
    }

    getReader() {
      let started = false
      return {
        read: async () => {
          if (!started && this._source.start) {
            started = true
            const controller = {
              enqueue: (chunk: unknown) => {
                this._chunk = chunk
              },
              close: () => {
              }
            }
            this._source.start(controller)
          }

          if (this._chunk && !this._consumed) {
            this._consumed = true
            return { done: false, value: this._chunk }
          }
          
          return { done: true, value: undefined }
        }
      }
    }
  } as unknown as typeof ReadableStream
}

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    length: 0,
    key: vi.fn(),
  } as Storage
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  // Reset localStorage store
  localStorageMock.clear()
})
