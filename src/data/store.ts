import type { FirebaseOptions } from 'firebase/app'
import { createLocalStore } from './localStore'
import type { Store } from './types'

/** Firebase web config from .env.production. Not secret: the Firestore rules do the protecting. */
function firebaseConfig(): FirebaseOptions | null {
  const env = import.meta.env
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID) return null
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  }
}

export async function createStore(): Promise<Store> {
  const config = firebaseConfig()
  if (!config) return createLocalStore()
  // Loaded only when configured, so practice mode doesn't download the Firebase SDK.
  const { createFirebaseStore } = await import('./firebaseStore')
  return createFirebaseStore(config)
}
