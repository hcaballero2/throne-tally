import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const Ctx = createContext<(msg: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 2200)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div
          role="status"
          className="fixed left-1/2 z-30 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 font-bold text-card"
          style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))' }}
        >
          {msg}
        </div>
      )}
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
