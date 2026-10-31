import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { daysAgo } from '../lib/day'
import {
  DEFAULT_ADJECTIVES, DEFAULT_PLAYERS, type Adjectives, type LogEntry, type Player, type Slot, type Store,
} from './types'

/** How far back the history screen looks. */
export const HISTORY_DAYS = 60
const SLOT_KEY = 'throne-tally:slot'

interface AppData {
  store: Store
  players: Record<Slot, Player>
  logs: LogEntry[]
  adjectives: Adjectives
  /** Which seat this phone plays as; null until chosen. */
  me: Slot | null
  setMe: (slot: Slot | null) => void
}

const Ctx = createContext<AppData | null>(null)

function readSlot(): Slot | null {
  try {
    const v = localStorage.getItem(SLOT_KEY)
    return v === 'p1' || v === 'p2' ? v : null
  } catch {
    return null
  }
}

export function AppDataProvider({ store, children }: { store: Store; children: ReactNode }) {
  const [players, setPlayers] = useState<Partial<Record<Slot, Player>>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [adjectives, setAdjectives] = useState<Adjectives>(DEFAULT_ADJECTIVES)
  const [me, setMeState] = useState<Slot | null>(readSlot)

  // Subscribe once per store; the history window is fixed at launch.
  useEffect(() => {
    const offs = [
      store.watchPlayers(setPlayers),
      store.watchLogs(daysAgo(HISTORY_DAYS), setLogs),
      store.watchAdjectives(setAdjectives),
    ]
    return () => offs.forEach((off) => off())
  }, [store])

  const value = useMemo<AppData>(() => ({
    store,
    players: { p1: players.p1 ?? DEFAULT_PLAYERS.p1, p2: players.p2 ?? DEFAULT_PLAYERS.p2 },
    logs,
    adjectives,
    me,
    setMe(slot) {
      try {
        if (slot) localStorage.setItem(SLOT_KEY, slot)
        else localStorage.removeItem(SLOT_KEY)
      } catch {
        // Private mode: the choice lasts for this visit only.
      }
      setMeState(slot)
    },
  }), [store, players, logs, adjectives, me])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppData(): AppData {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAppData outside AppDataProvider')
  return v
}

export function otherSlot(slot: Slot): Slot {
  return slot === 'p1' ? 'p2' : 'p1'
}
