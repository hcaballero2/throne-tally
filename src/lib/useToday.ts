import { useEffect, useState } from 'react'
import { dayKey } from './day'

/** Today's day key, updated when the clock passes midnight or the app comes back to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(dayKey)
  useEffect(() => {
    const check = () => setToday(dayKey())
    const id = window.setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return today
}
