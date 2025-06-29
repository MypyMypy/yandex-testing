import { AnalysisHighlight } from '@app-types/analysis'
import { Highlights } from '@app-types/common'
import { HistoryItemType } from '@app-types/history'

export const mockHighlights: Highlights = {
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

export const mockAnalysisHighlights: AnalysisHighlight[] = [
  {
    title: 'Общие расходы',
    description: '1,000,000 галактических кредитов',
  },
  {
    title: 'Средние расходы',
    description: '1,000 галактических кредитов',
  },
  {
    title: 'Максимальные расходы',
    description: 'Galactic Empire (50,000 кредитов)',
  },
]

export const mockHistoryItem: HistoryItemType = {
  id: '1',
  timestamp: Date.now(),
  fileName: 'test-file.csv',
  highlights: mockHighlights,
}

export const mockHistoryItems: HistoryItemType[] = [
  mockHistoryItem,
  {
    id: '2',
    timestamp: Date.now() - 1000,
    fileName: 'another-file.csv',
    highlights: mockHighlights,
  },
  {
    id: '3',
    timestamp: Date.now() - 2000,
    fileName: 'error-file.csv',
  },
]

export const mockApiResponse = {
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

export const mockInvalidApiResponse = {
  invalid_field: 'some value',
}
