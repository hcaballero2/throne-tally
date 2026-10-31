import { useState } from 'react'
import InstallHint from '../../components/InstallHint'
import { useAppData } from '../../data/AppData'

const input = 'rounded-2xl border-[1.5px] border-line bg-card px-4 py-3'

/** Accounts are created by hand in the Firebase console, so there is no sign-up here. */
export default function Login() {
  const { store } = useAppData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await store.signIn(email, password)
    } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      setError(
        code === 'auth/network-request-failed' ? 'No connection. Logging in needs the internet once.'
        : code === 'auth/too-many-requests' ? 'Too many tries. Wait a few minutes and try again.'
        : 'Wrong email or password.',
      )
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Throne Tally</h1>
        <p className="mt-1 text-muted">Log in once on this phone and it remembers you.</p>
      </div>
      <form
        className="flex flex-col gap-2.5"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label htmlFor="login-email" className="sr-only">Email</label>
        <input id="login-email" type="email" autoComplete="username" required placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <label htmlFor="login-password" className="sr-only">Password</label>
        <input id="login-password" type="password" autoComplete="current-password" required placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
        <button type="submit" disabled={busy}
          className="rounded-2xl bg-ink px-4 py-3 font-display text-lg font-bold text-paper disabled:opacity-60">
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <InstallHint />
    </main>
  )
}

/** Signed in, but no members/{uid} doc links this account to Player 1 or 2. */
export function NotLinked() {
  const { store } = useAppData()
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Almost there</h1>
      <p className="text-muted">
        This account isn't linked to Player 1 or Player 2 yet. Add it under <strong>members</strong> in the
        Firebase console, then log in again.
      </p>
      <button type="button" onClick={() => void store.signOut()}
        className="rounded-2xl border-[1.5px] border-line bg-card px-4 py-3 font-semibold">
        Log out
      </button>
    </main>
  )
}
