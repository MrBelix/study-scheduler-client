// Domain types for the Students feature.

export interface Subject {
  name: string
  rate: number
}

export interface Student {
  id: string
  name: string
  short: string
  color: string
  subjects: Subject[]
  balance: number
  next: string
  lessons: number
}

export interface HistoryItem {
  date: string
  day: string
  kind: 'lesson' | 'pay'
  label: string
  amount: number
  note?: string
}
