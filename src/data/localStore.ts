import { DEFAULT_ADJECTIVES, type Adjectives, type LogEntry, type Player, type Session, type Slot, type Store } from './types'

/**
 * Practice mode, used until Firebase is configured: everything stays in this
 * browser's localStorage. Same shape as the Firestore store so screens don't care.
 */
interface LocalState {
  players: Partial<Record<Slot, Player>>
  logs: LogEntry[]
  adjectives: Adjectives
}

const KEY = 'throne-tally:local'
const SLOT_KEY = 'throne-tally:slot'

function readSlot(): Slot | null {
  try {
    const v = localStorage.getItem(SLOT_KEY)
    return v === 'p1' || v === 'p2' ? v : null
  } catch {
    return null
  }
}

function writeSlot(slot: Slot | null) {
  try {
    if (slot) localStorage.setItem(SLOT_KEY, slot)
    else localStorage.removeItem(SLOT_KEY)
  } catch {
    // Private mode: the choice lasts for this visit only.
  }
}

function load(): LocalState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LocalState
  } catch {
    // Fall through to a fresh state.
  }
  return { players: {}, logs: [], adjectives: structuredClone(DEFAULT_ADJECTIVES) }
}

export function createLocalStore(): Store {
  let state = load()
  let slot = readSlot()
  const listeners = new Set<() => void>()
  const sessionListeners = new Set<(s: Session) => void>()

  function setSlot(next: Slot | null) {
    slot = next
    writeSlot(next)
    sessionListeners.forEach((l) => l({ state: 'in', slot }))
  }

  function commit(next: LocalState) {
    state = next
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage full or blocked: keep the in-memory state for this visit.
    }
    listeners.forEach((l) => l())
  }

  // Another tab changed the data.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    listeners.forEach((l) => l())
  })

  function watch(emit: () => void) {
    emit()
    listeners.add(emit)
    return () => {
      listeners.delete(emit)
    }
  }

  return {
    mode: 'local',
    watchSession(cb) {
      cb({ state: 'in', slot })
      sessionListeners.add(cb)
      return () => {
        sessionListeners.delete(cb)
      }
    },
    async signIn() {
      throw new Error('Practice mode has no accounts')
    },
    async signOut() {
      setSlot(null)
    },
    pickSlot: setSlot,
    watchPlayers: (cb) => watch(() => cb(state.players)),
    watchLogs: (sinceDay, cb) => watch(() => cb(state.logs.filter((l) => l.day >= sinceDay))),
    watchAdjectives: (cb) => watch(() => cb(state.adjectives)),
    async savePlayer(player) {
      commit({ ...state, players: { ...state.players, [player.slot]: player } })
    },
    async addLog(entry) {
      commit({ ...state, logs: [...state.logs, { ...entry, id: crypto.randomUUID() }] })
    },
    async removeLog(id) {
      commit({ ...state, logs: state.logs.filter((l) => l.id !== id) })
    },
    async addAdjective(kind, word) {
      if (state.adjectives[kind].includes(word)) return
      commit({ ...state, adjectives: { ...state.adjectives, [kind]: [...state.adjectives[kind], word] } })
    },
    async removeAdjective(kind, word) {
      commit({ ...state, adjectives: { ...state.adjectives, [kind]: state.adjectives[kind].filter((w) => w !== word) } })
    },
  }
}
