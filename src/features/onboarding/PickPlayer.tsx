import Character from '../../character/Character'
import InstallHint from '../../components/InstallHint'
import { useAppData } from '../../data/AppData'
import { SLOTS } from '../../data/types'

/** First launch on a phone: claim one of the two seats. */
export default function PickPlayer() {
  const { players, setMe } = useAppData()
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Throne Tally</h1>
        <p className="mt-1 text-muted">Two players. Most bathroom trips by midnight wins the day. Which one are you?</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setMe(s)}
            className="flex flex-col items-center gap-2 rounded-3xl border-2 border-line bg-card p-4 active:border-ink"
          >
            <Character look={players[s].look} size={96} />
            <span className="font-display text-lg font-semibold">{players[s].name}</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">You can change your name and character on the Me tab.</p>
      <InstallHint />
    </main>
  )
}
