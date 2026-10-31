import { useEffect, useState } from 'react'
import Character from '../../character/Character'
import { BASES, BASE_IDS, EYES, EYES_IDS, TOPS, TOP_IDS } from '../../character/parts'
import { useToast } from '../../components/Toast'
import { useAppData } from '../../data/AppData'
import type { Look } from '../../data/types'

/** Edit this phone's player: name and character. Each tap saves straight away. */
export default function Me() {
  const { store, players, me } = useAppData()
  const toast = useToast()
  const player = me ? players[me] : null
  const [name, setName] = useState(player?.name ?? '')

  // Pick up a rename made on another phone or a late first snapshot.
  useEffect(() => {
    if (player) setName(player.name)
  }, [player?.name])

  if (!me || !player) return null

  async function save(next: { name?: string; look?: Look }) {
    try {
      await store.savePlayer({ ...player!, ...next })
    } catch {
      toast("Couldn't save. Check your connection and try again.")
    }
  }

  function saveName() {
    const n = name.trim().replace(/\s+/g, ' ').slice(0, 20)
    if (!n) {
      setName(player!.name)
      return
    }
    if (n !== player!.name) {
      void save({ name: n })
      toast('Name saved')
    }
  }

  const setLook = (patch: Partial<Look>) => void save({ look: { ...player.look, ...patch } })

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 pb-28 pt-5">
      <h1 className="font-display text-3xl font-bold">Me</h1>

      <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-card p-5">
        <Character look={player.look} size={160} title="Your character" />
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            saveName()
            ;(document.activeElement as HTMLElement | null)?.blur()
          }}
        >
          <label htmlFor="me-name" className="sr-only">Your name</label>
          <input
            id="me-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            maxLength={20}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-paper px-4 py-3 text-center font-display text-xl font-semibold"
          />
        </form>
      </div>

      <Picker title="Base" ids={BASE_IDS} selected={player.look.base} label={(id) => BASES[id].label}
        preview={(id) => ({ ...player.look, base: id })} onPick={(base) => setLook({ base })} />
      <Picker title="Eyes" ids={EYES_IDS} selected={player.look.eyes} label={(id) => EYES[id].label}
        preview={(id) => ({ ...player.look, eyes: id })} onPick={(eyes) => setLook({ eyes })} />
      <Picker title="Hat or hair" ids={TOP_IDS} selected={player.look.top} label={(id) => TOPS[id].label}
        preview={(id) => ({ ...player.look, top: id })} onPick={(top) => setLook({ top })} />

      <button
        type="button"
        onClick={() => {
          if (store.mode === 'local' || window.confirm('Log out on this phone? You will need your password to log back in.')) {
            void store.signOut()
          }
        }}
        className="rounded-2xl border-[1.5px] border-line bg-card px-4 py-3 font-semibold text-muted"
      >
        {store.mode === 'local' ? 'Switch player on this phone' : 'Log out'}
      </button>
    </main>
  )
}

function Picker<T extends string>({ title, ids, selected, label, preview, onPick }: {
  title: string
  ids: T[]
  selected: T
  label: (id: T) => string
  preview: (id: T) => Look
  onPick: (id: T) => void
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="grid grid-cols-4 gap-2">
        {ids.map((id) => {
          const on = id === selected
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(id)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl border-2 bg-card p-1.5 pb-2 ${on ? 'border-ink' : 'border-line'}`}
            >
              <Character look={preview(id)} size={64} title={label(id)} />
              <span className="w-full truncate text-center text-xs font-semibold">{label(id)}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
