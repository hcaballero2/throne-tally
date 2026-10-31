import type { LogEntry, Slot } from '../data/types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar day as YYYY-MM-DD; sorts as a string. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return dayKey(d)
}

export function formatDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export interface Score {
  total: number
  pee: number
  poo: number
}

export function tally(logs: LogEntry[]): Record<Slot, Score> {
  const out: Record<Slot, Score> = { p1: { total: 0, pee: 0, poo: 0 }, p2: { total: 0, pee: 0, poo: 0 } }
  for (const l of logs) {
    const s = out[l.by]
    if (!s) continue
    s.total++
    s[l.kind]++
  }
  return out
}

/** The single slot with the most trips, or null for a tie or an empty day. */
export function winner(scores: Record<Slot, Score>): Slot | null {
  if (scores.p1.total === scores.p2.total) return null
  return scores.p1.total > scores.p2.total ? 'p1' : 'p2'
}
