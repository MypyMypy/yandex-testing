import { vi } from 'vitest'

export const mockUseCsvAnalysis = vi.fn(() => ({
  analyzeCsv: vi.fn(),
  isLoading: false,
  error: null,
}))

vi.mock('../hooks/use-csv-analysis', () => ({
  useCsvAnalysis: mockUseCsvAnalysis
}))
