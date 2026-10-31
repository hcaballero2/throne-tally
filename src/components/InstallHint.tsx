import { isIOS, isStandalone } from '../lib/platform'

/** Shown only in a browser tab; disappears once the app is on the home screen. */
export default function InstallHint() {
  if (isStandalone()) return null
  return (
    <section className="rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed">
      <h2 className="mb-1 font-semibold">Put it on your home screen</h2>
      {isIOS() ? (
        <ol className="list-decimal space-y-1 pl-5 text-muted">
          <li>Tap the <strong>Share</strong> button (square with an arrow) in Safari.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Open <strong>Throne</strong> from your home screen.</li>
        </ol>
      ) : (
        <p className="text-muted">Open it in Safari on your iPhone and use Share → Add to Home Screen.</p>
      )}
    </section>
  )
}
