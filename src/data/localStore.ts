import { DEFAULT_ADJECTIVES, type Adjectives, type LogEntry, type Player, type Slot, type Store } from './types'

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
  const listeners = new Set<() => void>()

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
