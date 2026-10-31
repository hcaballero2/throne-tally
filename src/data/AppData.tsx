import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { daysAgo } from '../lib/day'
import {
  DEFAULT_ADJECTIVES, DEFAULT_PLAYERS, type Adjectives, type LogEntry, type Player, type Session, type Slot, type Store,
} from './types'

/** How far back the history screen looks. */
export const HISTORY_DAYS = 60

interface AppData {
  store: Store
  players: Record<Slot, Player>
  logs: LogEntry[]
  adjectives: Adjectives
  session: Session
  /** Which seat this phone plays as; null until signed in and linked (or picked, in practice mode). */
  me: Slot | null
}

const Ctx = createContext<AppData | null>(null)

export function AppDataProvider({ store, children }: { store: Store; children: ReactNode }) {
  const [players, setPlayers] = useState<Partial<Record<Slot, Player>>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [adjectives, setAdjectives] = useState<Adjectives>(DEFAULT_ADJECTIVES)
  const [session, setSession] = useState<Session>({ state: 'loading' })
  const me = session.state === 'in' ? session.slot : null

  useEffect(() => store.watchSession(setSession), [store])

  // Data is readable only once signed in to a linked account; the history window is fixed at sign-in.
  useEffect(() => {
    if (!me) return
    const offs = [
      store.watchPlayers(setPlayers),
      store.watchLogs(daysAgo(HISTORY_DAYS), setLogs),
      store.watchAdjectives(setAdjectives),
    ]
    return () => offs.forEach((off) => off())
  }, [store, me])

  const value = useMemo<AppData>(() => ({
    store,
    players: { p1: players.p1 ?? DEFAULT_PLAYERS.p1, p2: players.p2 ?? DEFAULT_PLAYERS.p2 },
    logs,
    adjectives,
    session,
    me,
  }), [store, players, logs, adjectives, session, me])

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
