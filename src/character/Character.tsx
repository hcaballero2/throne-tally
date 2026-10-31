import { BASES, EYES, TOPS } from './parts'
import type { Look } from '../data/types'

/** A player's character on its plate. Unknown part ids (from an older or newer app) fall back to defaults. */
export default function Character({ look, size = 64, title }: { look: Look; size?: number; title?: string }) {
  const base = BASES[look.base] ?? BASES['gray-cat']
  const eyes = EYES[look.eyes] ?? EYES.big
  const top = TOPS[look.top] ?? TOPS.none
  const lx = 60 - base.eyeGap
  const rx = 60 + base.eyeGap

  return (
    <svg
      viewBox="-12 -26 144 144"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? `${base.label} character`}
      className="shrink-0 rounded-full bg-[#e6edf2]"
    >
      {base.draw()}
      {eyes.draw(lx, base.eyeY, -1)}
      {eyes.draw(rx, base.eyeY, 1)}
      {look.eyes === 'shades' && (
        <path d={`M${lx + 11} ${base.eyeY - 3} h${rx - lx - 22}`} stroke="#141414" strokeWidth="3" />
      )}
      <g transform={`translate(60 ${base.topY}) scale(${base.topScale})`}>{top.draw()}</g>
    </svg>
  )
}
