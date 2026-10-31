import { useState } from 'react'
import Character from '../../character/Character'
import { CrownIcon, KindIcon } from '../../components/icons'
import { useToast } from '../../components/Toast'
import { otherSlot, useAppData } from '../../data/AppData'
import { KIND_LABEL, type Kind, type LogEntry, type Slot } from '../../data/types'
import { formatTime, tally, winner } from '../../lib/day'
import { useToday } from '../../lib/useToday'
import LogSheet from './LogSheet'

export default function Home() {
  const { store, players, logs, me } = useAppData()
  const toast = useToast()
  const today = useToday()
  const [sheet, setSheet] = useState<Kind | null>(null)

  if (!me) return null
  const rival = otherSlot(me)
  const todays = logs.filter((l) => l.day === today).sort((a, b) => b.at - a.at)
  const scores = tally(todays)
  const lead = winner(scores)
  const gap = Math.abs(scores.p1.total - scores.p2.total)

  let status = 'Most trips by midnight takes the crown.'
  if (lead === me) status = `You lead by ${gap}. Hold the throne until midnight.`
  else if (lead) status = `${players[lead].name} leads by ${gap}. Hydrate.`
  else if (scores.p1.total > 0) status = `Tied at ${scores.p1.total}. Next trip takes the lead.`

  async function save(kind: Kind, tags: string[]) {
    setSheet(null)
    try {
      const now = new Date()
      // Not awaited for the toast: Firestore applies it locally at once and syncs when online.
      const write = store.addLog({ by: me!, kind, tags, at: now.getTime(), day: today })
      toast(`${KIND_LABEL[kind]} logged`)
      await write
    } catch {
      toast("Couldn't log that. Check your connection and try again.")
    }
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 pb-28 pt-5">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Throne Tally</h1>
        <span className="text-sm text-muted">
          {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </header>

      <section aria-label="Today's standings" className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2.5">
          {[me, rival].map((slot) => (
            <PlayerCard key={slot} slot={slot} isMe={slot === me} leading={lead === slot} score={scores[slot]} />
          ))}
        </div>
        <p className="text-center text-sm text-muted">{status}</p>
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <BigButton kind="pee" onClick={() => setSheet('pee')} />
        <BigButton kind="poo" onClick={() => setSheet('poo')} />
      </div>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">Today's log</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {todays.length === 0 ? (
            <p className="px-4 py-5 text-muted">No trips yet today. Tap Pee or Poo above to log the first one.</p>
          ) : (
            todays.map((l) => <LogRow key={l.id} entry={l} mine={l.by === me} />)
          )}
        </div>
      </section>

      {sheet && <LogSheet kind={sheet} onClose={() => setSheet(null)} onSave={(tags) => void save(sheet, tags)} />}
    </main>
  )
}

function PlayerCard({ slot, isMe, leading, score }: {
  slot: Slot; isMe: boolean; leading: boolean; score: { total: number; pee: number; poo: number }
}) {
  const { players } = useAppData()
  const p = players[slot]
  return (
    <div
      className={`relative flex min-w-0 flex-col gap-1.5 rounded-2xl border bg-card p-3.5 ${leading ? 'border-gold shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-gold)_30%,transparent)]' : 'border-line'}`}
    >
      {leading && <CrownIcon className="absolute right-3 top-3 size-6 text-gold" />}
      <Character look={p.look} size={56} title={`${p.name}'s character`} />
      <div className="truncate font-bold">{isMe ? `${p.name} (you)` : p.name}</div>
      <div className="font-display text-5xl font-bold leading-none tabular-nums">{score.total}</div>
      <div className="flex gap-3 text-sm text-muted tabular-nums">
        <span className="inline-flex items-center gap-1"><KindIcon kind="pee" className="size-4 text-pee" />{score.pee}</span>
        <span className="inline-flex items-center gap-1"><KindIcon kind="poo" className="size-4 text-poo" />{score.poo}</span>
      </div>
    </div>
  )
}

function BigButton({ kind, onClick }: { kind: Kind; onClick: () => void }) {
  const cls = kind === 'pee' ? 'bg-pee-soft border-pee text-pee-ink' : 'bg-poo-soft border-poo text-poo-ink'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-3xl border-2 px-3 py-6 font-display text-2xl font-semibold transition-transform active:scale-[.97] motion-reduce:transition-none ${cls}`}
    >
      <KindIcon kind={kind} className={`size-11 ${kind === 'pee' ? 'text-pee' : 'text-poo'}`} />
      {KIND_LABEL[kind]}
    </button>
  )
}

function LogRow({ entry, mine }: { entry: LogEntry; mine: boolean }) {
  const { store, players } = useAppData()
  const toast = useToast()
  const [armed, setArmed] = useState(false)

  async function remove() {
    if (!armed) {
      setArmed(true)
      window.setTimeout(() => setArmed(false), 3000)
      return
    }
    try {
      await store.removeLog(entry.id)
      toast('Removed')
    } catch {
      toast("Couldn't remove that. Try again.")
    }
  }

  return (
    <div className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
      <Character look={players[entry.by].look} size={36} title={players[entry.by].name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-bold">
          <KindIcon kind={entry.kind} className={`size-4 ${entry.kind === 'pee' ? 'text-pee' : 'text-poo'}`} />
          <span className="truncate">{players[entry.by].name} · {KIND_LABEL[entry.kind]}</span>
        </div>
        <div className="text-sm text-muted">
          <time>{formatTime(entry.at)}</time> · {entry.tags.length ? entry.tags.join(', ') : 'No details'}
        </div>
      </div>
      {mine && (
        <button
          type="button"
          onClick={() => void remove()}
          className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-sm ${armed ? 'border-danger text-danger' : 'border-transparent text-muted'}`}
        >
          {armed ? 'Tap to confirm' : 'Remove'}
        </button>
      )}
    </div>
  )
}
