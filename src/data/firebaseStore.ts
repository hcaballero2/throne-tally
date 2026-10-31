import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, initializeFirestore,
  onSnapshot, persistentLocalCache, persistentMultipleTabManager, query, setDoc, where,
} from 'firebase/firestore'
import {
  DEFAULT_ADJECTIVES, type Adjectives, type Kind, type LogEntry, type Player, type Slot, type Store,
} from './types'

/** Last known uid → seat link, so an offline launch still knows who this phone is. */
const MEMBER_KEY = 'throne-tally:member'

function cachedSlot(uid: string): Slot | null {
  try {
    const v = JSON.parse(localStorage.getItem(MEMBER_KEY) ?? 'null') as { uid: string; slot: Slot } | null
    return v?.uid === uid ? v.slot : null
  } catch {
    return null
  }
}

function cacheSlot(uid: string, slot: Slot | null) {
  try {
    if (slot) localStorage.setItem(MEMBER_KEY, JSON.stringify({ uid, slot }))
    else localStorage.removeItem(MEMBER_KEY)
  } catch {
    // Storage blocked: the next launch looks the seat up again.
  }
}

/**
 * Firestore layout:
 *   players/{p1|p2}     Player
 *   logs/{auto}         LogEntry without id
 *   meta/adjectives     { pee: string[], poo: string[] }
 *   members/{uid}       { slot } links an account to a seat; created by hand in the Firebase console
 */
export async function createFirebaseStore(config: FirebaseOptions): Promise<Store> {
  const app = initializeApp(config)
  // Persistent cache: the app opens offline with the last scores and queues new logs until back online.
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })

  // Firebase keeps the signed-in account in IndexedDB, so each phone logs in once.
  const auth = getAuth(app)

  const adjRef = doc(db, 'meta', 'adjectives')

  // Writes default words before the first edit, so editing one list never blanks the other.
  async function ensureAdjectives() {
    const snap = await getDoc(adjRef)
    if (!snap.exists()) await setDoc(adjRef, DEFAULT_ADJECTIVES)
  }

  return {
    mode: 'firebase',

    watchSession(cb) {
      cb({ state: 'loading' })
      return onAuthStateChanged(auth, async (user) => {
        // Anonymous sessions came from the first version of the app; the rules no longer accept them.
        if (!user || user.isAnonymous) {
          if (user) await fbSignOut(auth)
          cb({ state: 'out' })
          return
        }
        let slot: Slot | null
        try {
          const snap = await getDoc(doc(db, 'members', user.uid))
          const v = snap.data()?.slot
          slot = v === 'p1' || v === 'p2' ? v : null
          cacheSlot(user.uid, slot)
        } catch {
          slot = cachedSlot(user.uid)
        }
        cb({ state: 'in', slot })
      })
    },

    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    },

    async signOut() {
      await fbSignOut(auth)
    },

    watchPlayers(cb) {
      return onSnapshot(collection(db, 'players'), (snap) => {
        const out: Partial<Record<Slot, Player>> = {}
        for (const d of snap.docs) out[d.id as Slot] = d.data() as Player
        cb(out)
      })
    },

    watchLogs(sinceDay, cb) {
      const q = query(collection(db, 'logs'), where('day', '>=', sinceDay))
      return onSnapshot(q, (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LogEntry, 'id'>) })))
      })
    },

    watchAdjectives(cb) {
      return onSnapshot(adjRef, (snap) => {
        const data = snap.data() as Partial<Adjectives> | undefined
        cb({ pee: data?.pee ?? DEFAULT_ADJECTIVES.pee, poo: data?.poo ?? DEFAULT_ADJECTIVES.poo })
      })
    },

    async savePlayer(player) {
      await setDoc(doc(db, 'players', player.slot), player)
    },

    async addLog(entry) {
      await addDoc(collection(db, 'logs'), entry)
    },

    async removeLog(id) {
      await deleteDoc(doc(db, 'logs', id))
    },

    async addAdjective(kind: Kind, word: string) {
      await ensureAdjectives()
      await setDoc(adjRef, { [kind]: arrayUnion(word) }, { merge: true })
    },

    async removeAdjective(kind: Kind, word: string) {
      await ensureAdjectives()
      await setDoc(adjRef, { [kind]: arrayRemove(word) }, { merge: true })
    },
  }
}
