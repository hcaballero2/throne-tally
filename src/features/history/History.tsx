import Character from '../../character/Character'
import { CrownIcon } from '../../components/icons'
import { HISTORY_DAYS, useAppData } from '../../data/AppData'
import { SLOTS, type LogEntry, type Slot } from '../../data/types'
import { formatDay, tally, winner } from '../../lib/day'
import { useToday } from '../../lib/useToday'

/** Finished days only: today is still in play. */
export default function History() {
  const { players, logs } = useAppData()
  const today = useToday()

  const byDay = new Map<string, LogEntry[]>()
  for (const l of logs) {
    if (l.day >= today) continue
    byDay.set(l.day, [...(byDay.get(l.day) ?? []), l])
  }
  const days = [...byDay.keys()].sort().reverse()
  const crowns: Record<Slot, number> = { p1: 0, p2: 0 }
  const rows = days.map((d) => {
    const scores = tally(byDay.get(d)!)
    const w = winner(scores)
    if (w) crowns[w]++
    return { d, scores, w }
  })

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 pb-28 pt-5">
      <h1 className="font-display text-3xl font-bold">History</h1>

      <section aria-label={`Crowns in the last ${HISTORY_DAYS} days`} className="grid grid-cols-2 gap-2.5">
        {SLOTS.map((s) => (
          <div key={s} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            <Character look={players[s].look} size={48} title={players[s].name} />
            <div className="min-w-0">
              <div className="truncate font-bold">{players[s].name}</div>
              <div className="flex items-center gap-1 font-display text-2xl font-bold tabular-nums">
                <CrownIcon className="size-5 text-gold" />{crowns[s]}
              </div>
            </div>
          </div>
        ))}
      </section>
      <p className="-mt-3 text-center text-sm text-muted">Crowns won in the last {HISTORY_DAYS} days</p>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {rows.length === 0 ? (
          <p className="px-4 py-5 text-muted">Finished days show up here with their winner. Check back after midnight.</p>
        ) : (
          rows.map(({ d, scores, w }) => (
            <div key={d} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {w && <CrownIcon className="size-4 text-gold" />}
                  {formatDay(d)}: {w ? `${players[w].name} won` : 'Tie'}
                </div>
                <div className="text-sm text-muted tabular-nums">
                  {SLOTS.map((s) => `${players[s].name} ${scores[s].total} (${scores[s].pee} pee, ${scores[s].poo} poo)`).join(' · ')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
