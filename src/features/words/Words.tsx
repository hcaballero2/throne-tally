import { useState } from 'react'
import { KindIcon } from '../../components/icons'
import { useToast } from '../../components/Toast'
import { useAppData } from '../../data/AppData'
import { KINDS, KIND_LABEL, type Kind } from '../../data/types'
import { cleanWord } from '../../lib/words'

/** The shared describing words. Both players see the same lists. */
export default function Words() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 pb-28 pt-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Words</h1>
        <p className="mt-1 text-muted">The words you pick from when logging. Changes show up on both phones.</p>
      </div>
      {KINDS.map((k) => <WordList key={k} kind={k} />)}
    </main>
  )
}

function WordList({ kind }: { kind: Kind }) {
  const { store, adjectives } = useAppData()
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const [armed, setArmed] = useState<string | null>(null)
  const words = adjectives[kind]

  async function add() {
    const w = cleanWord(draft)
    if (!w) return
    setDraft('')
    if (words.some((x) => x.toLowerCase() === w.toLowerCase())) {
      toast(`"${w}" is already on the list`)
      return
    }
    try {
      await store.addAdjective(kind, w)
      toast(`Added "${w}"`)
    } catch {
      toast("Couldn't add that. Check your connection.")
    }
  }

  async function remove(w: string) {
    if (armed !== w) {
      setArmed(w)
      window.setTimeout(() => setArmed((a) => (a === w ? null : a)), 3000)
      return
    }
    setArmed(null)
    try {
      await store.removeAdjective(kind, w)
    } catch {
      toast("Couldn't remove that. Check your connection.")
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
        <KindIcon kind={kind} className={`size-6 ${kind === 'pee' ? 'text-pee' : 'text-poo'}`} />
        {KIND_LABEL[kind]} words
      </h2>
      <div className="flex flex-wrap gap-2">
        {words.length === 0 && <p className="text-muted">No words yet. Add one below.</p>}
        {words.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => void remove(w)}
            aria-label={armed === w ? `Confirm removing ${w}` : `Remove ${w}`}
            className={`inline-flex items-center gap-2 rounded-full border-[1.5px] bg-card py-2 pl-4 pr-3 font-bold ${armed === w ? 'border-danger text-danger' : 'border-line'}`}
          >
            {armed === w ? `Remove ${w}?` : w}
            <span aria-hidden="true" className="text-muted">×</span>
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void add()
        }}
      >
        <label htmlFor={`new-${kind}`} className="sr-only">New {KIND_LABEL[kind].toLowerCase()} word</label>
        <input
          id={`new-${kind}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`New ${KIND_LABEL[kind].toLowerCase()} word…`}
          maxLength={24}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-card px-4 py-2.5"
        />
        <button type="submit" disabled={!draft.trim()} className="rounded-2xl border-[1.5px] border-line bg-card px-4 font-bold disabled:opacity-50">
          Add
        </button>
      </form>
    </section>
  )
}
