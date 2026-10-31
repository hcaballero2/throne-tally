import type { BaseId, EyesId, TopId } from '../character/parts'

export type Kind = 'pee' | 'poo'
export const KINDS: Kind[] = ['pee', 'poo']
export const KIND_LABEL: Record<Kind, string> = { pee: 'Pee', poo: 'Poo' }

/** The two seats in the competition. Each phone claims one. */
export type Slot = 'p1' | 'p2'
export const SLOTS: Slot[] = ['p1', 'p2']

export interface Look {
  base: BaseId
  eyes: EyesId
  top: TopId
}

export interface Player {
  slot: Slot
  name: string
  look: Look
}

export interface LogEntry {
  id: string
  by: Slot
  kind: Kind
  tags: string[]
  /** Epoch ms when logged. */
  at: number
  /** Local calendar day, YYYY-MM-DD, of the phone that logged it. */
  day: string
}

export type Adjectives = Record<Kind, string[]>

export const DEFAULT_ADJECTIVES: Adjectives = {
  pee: ['Clear', 'Pale', 'Yellow', 'Dark', 'Neon', 'Green', 'Smelly', 'Long one'],
  poo: ['Hard', 'Soft', 'In-between', 'Big', 'Small', 'Pebbles', 'Runny', 'Smelly'],
}

export const DEFAULT_PLAYERS: Record<Slot, Player> = {
  p1: { slot: 'p1', name: 'Player 1', look: { base: 'gray-cat', eyes: 'big', top: 'none' } },
  p2: { slot: 'p2', name: 'Player 2', look: { base: 'siamese', eyes: 'big', top: 'none' } },
}

export type Unsubscribe = () => void

/**
 * Who is using this phone. Firebase: an email/password account linked to a seat by members/{uid}.
 * Practice mode: always signed in; the seat is picked on screen. slot is null when not linked or not picked yet.
 */
export type Session = { state: 'loading' } | { state: 'out' } | { state: 'in'; slot: Slot | null }

/** Everything the screens need from storage. Firebase in production, localStorage before it is set up. */
export interface Store {
  readonly mode: 'firebase' | 'local'
  watchSession(cb: (session: Session) => void): Unsubscribe
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  /** Practice mode only: choose a seat without an account. */
  pickSlot?(slot: Slot): void
  watchPlayers(cb: (players: Partial<Record<Slot, Player>>) => void): Unsubscribe
  watchLogs(sinceDay: string, cb: (logs: LogEntry[]) => void): Unsubscribe
  watchAdjectives(cb: (adjectives: Adjectives) => void): Unsubscribe
  savePlayer(player: Player): Promise<void>
  addLog(entry: Omit<LogEntry, 'id'>): Promise<void>
  removeLog(id: string): Promise<void>
  addAdjective(kind: Kind, word: string): Promise<void>
  removeAdjective(kind: Kind, word: string): Promise<void>
}
