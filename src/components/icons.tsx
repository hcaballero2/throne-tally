import type { Kind } from '../data/types'

export function KindIcon({ kind, className = 'size-5' }: { kind: Kind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {kind === 'pee' ? (
        <path d="M12 2.2c-3.7 4.8-6.4 8.4-6.4 11.9a6.4 6.4 0 0 0 12.8 0c0-3.5-2.7-7.1-6.4-11.9zm-2.6 12.4a.9.9 0 0 1 .9.9c0 1.1.8 2 1.9 2.2a.9.9 0 1 1-.3 1.8 4 4 0 0 1-3.4-4 .9.9 0 0 1 .9-.9z" />
      ) : (
        <path d="M12.6 2.4c.5 1.6 2.2 2.3 2.2 4 0 .8-.3 1.4-.8 1.9h.9a2.6 2.6 0 0 1 2.4 3.6h.3a2.8 2.8 0 0 1 .4 5.6h.5a2.7 2.7 0 0 1 0 5.4H5.5a2.7 2.7 0 0 1 0-5.4H6a2.8 2.8 0 0 1 .4-5.6h.3A2.6 2.6 0 0 1 9.1 8.3h1.3c-.6-.3-1-.9-1-1.7 0-1.9 2.4-2.1 3.2-4.2z" />
      )}
    </svg>
  )
}

export function CrownIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3 7.5l4.5 4L12 4.5l4.5 7 4.5-4-1.8 10.5H4.8L3 7.5zM5 19.5h14v2H5z" />
    </svg>
  )
}
