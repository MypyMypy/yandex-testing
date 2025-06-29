import { HomePage } from '@pages/Home'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockCSVFile } from '../../../test/utils'
import { render } from '../../../test/utils'

const mockAnalyzeCsv = vi.fn()
vi.mock('@hooks/use-csv-analysis', () => ({
  useCsvAnalysis: vi.fn(() => ({
    analyzeCsv: mockAnalyzeCsv,
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@utils/storage', () => ({
  addToHistory: vi.fn(),
}))

describe('HomePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockAnalyzeCsv.mockClear()
  })

  it('should render initial state correctly', () => {
    render(<HomePage />)

    expect(screen.getByText('Загрузить файл')).toBeInTheDocument()
    expect(screen.getByText(/здесь появятся хайлайты/i)).toBeInTheDocument()
  })

  it('should handle file upload and show send button', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const file = createMockCSVFile('test.csv')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    await user.upload(fileInput, file)

    expect(screen.getByText('test.csv')).toBeInTheDocument()

    const sendButton = screen.getByRole('button', { name: /отправить/i })
    expect(sendButton).toBeInTheDocument()
    expect(sendButton).not.toBeDisabled()
  })
})
