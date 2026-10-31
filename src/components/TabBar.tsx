import { NavLink } from 'react-router'

const TABS = [
  { to: '/', label: 'Today', end: true },
  { to: '/history', label: 'History', end: false },
  { to: '/words', label: 'Words', end: false },
  { to: '/me', label: 'Me', end: false },
]

/** Fixed bottom navigation, clear of the iPhone home indicator. */
export default function TabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `py-3 text-center font-display text-[15px] font-semibold ${isActive ? 'text-ink' : 'text-muted'}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
