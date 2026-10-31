import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, initializeFirestore,
  onSnapshot, persistentLocalCache, persistentMultipleTabManager, query, setDoc, where,
} from 'firebase/firestore'
import { DEFAULT_ADJECTIVES, type Adjectives, type Kind, type LogEntry, type Player, type Slot, type Store } from './types'

/**
 * Firestore layout:
 *   players/{p1|p2}     Player
 *   logs/{auto}         LogEntry without id
 *   meta/adjectives     { pee: string[], poo: string[] }
 */
export async function createFirebaseStore(config: FirebaseOptions): Promise<Store> {
  const app = initializeApp(config)
  // Persistent cache: the app opens offline with the last scores and queues new logs until back online.
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })

  // Anonymous sign-in so the security rules can require an authenticated app.
  // The session persists on the phone, so an offline launch reuses it.
  const auth = getAuth(app)
  await auth.authStateReady()
  if (!auth.currentUser) await signInAnonymously(auth)

  const adjRef = doc(db, 'meta', 'adjectives')

  // Writes default words before the first edit, so editing one list never blanks the other.
  async function ensureAdjectives() {
    const snap = await getDoc(adjRef)
    if (!snap.exists()) await setDoc(adjRef, DEFAULT_ADJECTIVES)
  }

  return {
    mode: 'firebase',

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
