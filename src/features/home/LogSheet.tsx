import { useEffect, useRef, useState } from 'react'
import { KindIcon } from '../../components/icons'
import { useAppData } from '../../data/AppData'
import { KIND_LABEL, type Kind } from '../../data/types'
import { cleanWord } from '../../lib/words'

/** Bottom sheet: pick any words that describe it, optionally add a new one, then log. */
export default function LogSheet({ kind, onClose, onSave }: {
  kind: Kind
  onClose: () => void
  onSave: (tags: string[]) => void
}) {
  const { adjectives, store } = useAppData()
  const [picked, setPicked] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const saveRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    saveRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (w: string) => setPicked((p) => (p.includes(w) ? p.filter((x) => x !== w) : [...p, w]))

  async function addWord() {
    const w = cleanWord(draft)
    if (!w) return
    setDraft('')
    setPicked((p) => (p.includes(w) ? p : [...p, w]))
    if (!adjectives[kind].includes(w)) await store.addAdjective(kind, w)
  }

  const label = KIND_LABEL[kind].toLowerCase()
  const goClass = kind === 'pee' ? 'bg-pee border-pee text-[#2b2100]' : 'bg-poo border-poo text-[#fff7f0]'

  return (
    <>
      <div className="fixed inset-0 z-20 bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="fixed inset-x-0 bottom-0 z-20 rounded-t-3xl border-t border-line bg-card px-4 pt-5"
        style={{ paddingBottom: 'calc(18px + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <h3 id="sheet-title" className="flex items-center gap-2 font-display text-2xl font-semibold">
            <KindIcon kind={kind} className={`size-7 ${kind === 'pee' ? 'text-pee' : 'text-poo'}`} />
            Log a {label}
          </h3>
          <p className="-mt-3 text-sm text-muted">Pick any that fit, or just log it.</p>

          <div className="flex flex-wrap gap-2">
            {adjectives[kind].map((w) => {
              const on = picked.includes(w)
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(w)}
                  className={`rounded-full border-[1.5px] px-4 py-2.5 font-bold ${on ? 'border-ink bg-ink text-card' : 'border-line bg-paper text-ink'}`}
                >
                  {w}
                </button>
              )
            })}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void addWord()
            }}
          >
            <input
              id="sheet-new-word"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="New word…"
              maxLength={24}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-paper px-4 py-2.5"
            />
            <button type="submit" className="rounded-2xl border-[1.5px] border-line bg-paper px-4 font-bold" disabled={!draft.trim()}>
              Add
            </button>
          </form>

          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <button type="button" onClick={onClose} className="rounded-2xl border-[1.5px] border-line bg-paper px-5 py-3.5 font-display text-lg font-semibold">
              Cancel
            </button>
            <button
              ref={saveRef}
              type="button"
              onClick={() => onSave(adjectives[kind].filter((w) => picked.includes(w)).concat(picked.filter((w) => !adjectives[kind].includes(w))))}
              className={`rounded-2xl border-[1.5px] px-5 py-3.5 font-display text-lg font-semibold ${goClass}`}
            >
              Log {label}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
