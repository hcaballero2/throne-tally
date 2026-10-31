import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import TabBar from './components/TabBar'
import { ToastProvider } from './components/Toast'
import { AppDataProvider, useAppData } from './data/AppData'
import { createStore } from './data/store'
import type { Store } from './data/types'
import History from './features/history/History'
import Home from './features/home/Home'
import Me from './features/me/Me'
import Login, { NotLinked } from './features/onboarding/Login'
import PickPlayer from './features/onboarding/PickPlayer'
import Words from './features/words/Words'

export default function App() {
  const [store, setStore] = useState<Store | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createStore()
      .then(setStore)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  if (error) {
    return (
      <main className="mx-auto max-w-lg p-5">
        <p className="font-bold">Couldn't connect to the scoreboard.</p>
        <p className="mt-1 text-muted">Check your internet connection and reopen the app. ({error})</p>
      </main>
    )
  }
  if (!store) return <main className="p-5 text-muted">Loading the scores…</main>

  return (
    <AppDataProvider store={store}>
      <ToastProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ToastProvider>
    </AppDataProvider>
  )
}

function Shell() {
  const { me, store, session } = useAppData()
  if (session.state === 'loading') return <main className="p-5 text-muted">Loading the scores…</main>
  if (session.state === 'out') return <Login />
  if (!me) return store.mode === 'local' ? <PickPlayer /> : <NotLinked />
  return (
    <>
      {store.mode === 'local' && (
        <p className="mx-auto max-w-lg px-4 pt-3 text-center text-xs text-muted">
          Practice mode: not connected to Firebase yet, so scores stay on this phone.
        </p>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/words" element={<Words />} />
        <Route path="/me" element={<Me />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
    </>
  )
}
