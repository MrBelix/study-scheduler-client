// Mock data ported from the MD3 design bundle (studyscheduler/project/data.js).

export const COLORS = [
  '#FF6B6B', '#FFA94D', '#F2C94C', '#51CF66',
  '#3DBEEC', '#7B61FF', '#E27EC2', '#5B7CFA',
]

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

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Анна Коваленко',   short: 'АК', color: COLORS[2],
    subjects: [{ name: 'Математика', rate: 600 }, { name: 'Українська', rate: 500 }],
    balance: -1200, next: 'Сьогодні · 17:00', lessons: 24 },
  { id: 's2', name: 'Максим Іщенко',    short: 'МІ', color: COLORS[4],
    subjects: [{ name: 'Англійська · A2', rate: 550 }],
    balance: +550, next: 'Сьогодні · 18:30', lessons: 12 },
  { id: 's3', name: 'Софія Бондар',     short: 'СБ', color: COLORS[5],
    subjects: [
      { name: 'Математика', rate: 700 },
      { name: 'Фізика', rate: 700 },
      { name: 'Підг. ЗНО', rate: 800 },
    ],
    balance: 0, next: 'Завтра · 16:00', lessons: 32 },
  { id: 's4', name: 'Олег Петренко',    short: 'ОП', color: COLORS[1],
    subjects: [{ name: 'Англійська · B1', rate: 500 }],
    balance: -2500, next: 'Чт · 19:00', lessons: 8 },
  { id: 's5', name: 'Дарина Сидоренко', short: 'ДС', color: COLORS[3],
    subjects: [{ name: 'Читання', rate: 450 }, { name: 'Письмо', rate: 450 }],
    balance: +650, next: 'Пт · 11:00', lessons: 18 },
  { id: 's6', name: 'Артем Голуб',      short: 'АГ', color: COLORS[6],
    subjects: [{ name: 'Англійська · B2', rate: 600 }],
    balance: -600, next: 'Пн · 15:00', lessons: 6 },
  { id: 's7', name: 'Юлія Шевченко',    short: 'ЮШ', color: COLORS[7],
    subjects: [{ name: 'Business English', rate: 700 }, { name: 'Speaking', rate: 600 }],
    balance: 0, next: 'Вт · 10:00', lessons: 14 },
  { id: 's8', name: 'Назар Кравчук',    short: 'НК', color: COLORS[0],
    subjects: [{ name: 'Англійська · A1', rate: 550 }],
    balance: +275, next: '—', lessons: 3 },
]

export interface HistoryItem {
  date: string
  day: string
  kind: 'lesson' | 'pay'
  label: string
  amount: number
  note?: string
}

export const HISTORY: HistoryItem[] = [
  { date: '14 тра', day: 'Чт', kind: 'lesson', label: 'Математика · 60 хв', amount: -600, note: 'Рівняння з модулем' },
  { date: '12 тра', day: 'Вт', kind: 'lesson', label: 'Українська · 60 хв', amount: -500 },
  { date: '12 тра', day: 'Вт', kind: 'pay',    label: 'Оплата · Monobank',  amount: +3000 },
  { date: '07 тра', day: 'Чт', kind: 'lesson', label: 'Математика · 60 хв', amount: -600 },
  { date: '05 тра', day: 'Вт', kind: 'lesson', label: 'Українська · 60 хв', amount: -500, note: 'Скасовано пізно — рахується' },
  { date: '30 кві', day: 'Чт', kind: 'lesson', label: 'Математика · 60 хв', amount: -600 },
  { date: '23 кві', day: 'Чт', kind: 'pay',    label: 'Оплата · готівка',   amount: +1800 },
]
