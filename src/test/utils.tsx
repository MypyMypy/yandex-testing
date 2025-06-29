/* eslint-disable react-refresh/only-export-components */
import { ReactElement } from 'react'

import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

export const createMockFile = (name: string, _size: number, type: string) => {
  return new File(['mock content'], name, { type, lastModified: Date.now() })
}

export const createMockCSVFile = (name = 'test.csv', size = 1024) => {
  return createMockFile(name, size, 'text/csv')
}

export const createMockStreamResponse = (data: Record<string, unknown>) => {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      controller.close()
    },
  })

  return {
    ok: true,
    body: stream,
  } as Response
}
