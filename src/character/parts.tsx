import type { ReactNode } from 'react'

/*
 * Characters are three stacked SVG layers in a 120×120 box:
 *   base  – the body, which also says where its face and the top of its head are
 *   eyes  – drawn at the base's eye line
 *   top   – a hat or hair, drawn in its own coordinates where (0,0) is the
 *           top-centre of the head and "up" is negative y
 * Colours are fixed (not theme tokens): a character looks the same on both phones.
 */

const LINE = '#2b2420'
const SW = 2.5

interface BaseSpec {
  label: string
  eyeY: number
  eyeGap: number
  topY: number
  topScale: number
  draw: () => ReactNode
}

function Cat({ fur, ear, inner, muzzle, nose, mask, stripes }: {
  fur: string; ear: string; inner: string; muzzle?: string; nose: string; mask?: string; stripes?: string
}) {
  return (
    <g stroke={LINE} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round">
      <path d="M28 58 L32 14 L58 38 Z" fill={ear} />
      <path d="M92 58 L88 14 L62 38 Z" fill={ear} />
      <path d="M35 46 L36 25 L49 38 Z" fill={inner} stroke="none" />
      <path d="M85 46 L84 25 L71 38 Z" fill={inner} stroke="none" />
      <ellipse cx="60" cy="70" rx="40" ry="34" fill={fur} />
      {stripes && <path d="M51 40 l2.5 9 M60 37 v11 M69 40 l-2.5 9" stroke={stripes} strokeWidth="3.5" fill="none" />}
      {mask && <ellipse cx="60" cy="83" rx="23" ry="17" fill={mask} stroke="none" opacity="0.75" />}
      {muzzle && <ellipse cx="60" cy="85" rx="15" ry="10" fill={muzzle} stroke="none" />}
      <path d="M55.5 78 h9 l-4.5 5 z" fill={nose} strokeWidth="1.5" />
      <path d="M60 83 q-4 5 -8 2 M60 83 q4 5 8 2" fill="none" strokeWidth="2" />
      <path d="M45 84 h-19 M45 88 l-18 5 M75 84 h19 M75 88 l18 5" strokeWidth="1.5" fill="none" />
    </g>
  )
}

export const BASES = {
  'gray-cat': {
    label: 'Gray cat', eyeY: 63, eyeGap: 16, topY: 38, topScale: 1,
    draw: () => <Cat fur="#9aa3ad" ear="#9aa3ad" inner="#f4b6c2" muzzle="#d6dce2" nose="#e58a9e" stripes="#6b7480" />,
  },
  siamese: {
    label: 'Siamese', eyeY: 63, eyeGap: 16, topY: 38, topScale: 1,
    draw: () => <Cat fur="#f6ead9" ear="#e2763a" inner="#f6c3a0" mask="#e2763a" nose="#a8451f" />,
  },
  poop: {
    label: 'Poop', eyeY: 72, eyeGap: 14, topY: 42, topScale: 0.9,
    draw: () => (
      <g stroke={LINE} strokeWidth={SW} strokeLinejoin="round" fill="#8b5a2b">
        <rect x="18" y="80" width="84" height="26" rx="13" />
        <rect x="25" y="59" width="70" height="27" rx="13.5" />
        <rect x="35" y="41" width="50" height="24" rx="12" />
        <path d="M47 44 C49 32 61 29 70 24 C66 33 75 37 72 44 Z" />
        <path d="M28 88 q8 -4 16 -2 M34 66 q7 -3 14 -1 M42 47 q6 -3 12 -1" stroke="#c99466" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M50 91 q10 9 20 0" stroke={LINE} fill="#5a2f14" strokeWidth="2" />
      </g>
    ),
  },
  toilet: {
    label: 'Toilet', eyeY: 27, eyeGap: 14, topY: 8, topScale: 1.05,
    draw: () => (
      <g stroke="#4f5d6b" strokeWidth={SW} strokeLinejoin="round">
        <path d="M44 96 L40 113 L80 113 L76 96 Z" fill="#e3eaf0" />
        <path d="M20 60 C22 84 38 96 46 99 L74 99 C82 96 98 84 100 60 Z" fill="#f7fafc" />
        <rect x="28" y="8" width="64" height="44" rx="9" fill="#f7fafc" />
        <rect x="30" y="13" width="8" height="4" rx="2" fill="#aab6c2" strokeWidth="1.5" />
        <ellipse cx="60" cy="60" rx="42" ry="10" fill="#e3eaf0" />
        <ellipse cx="60" cy="60" rx="30" ry="5.5" fill="#bcd4e6" strokeWidth="1.5" />
        <path d="M52 41 q8 6 16 0" fill="none" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    ),
  },
} satisfies Record<string, BaseSpec>

export type BaseId = keyof typeof BASES

type EyeDraw = (x: number, y: number, side: -1 | 1) => ReactNode

const star = (x: number, y: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

export const EYES = {
  big: {
    label: 'Big',
    draw: ((x, y) => (
      <g>
        <circle cx={x} cy={y} r="8.5" fill="#fff" stroke={LINE} strokeWidth="2" />
        <circle cx={x + 1} cy={y + 1} r="5" fill="#1b1b1b" />
        <circle cx={x + 2.6} cy={y - 1} r="1.8" fill="#fff" />
      </g>
    )) as EyeDraw,
  },
  dots: {
    label: 'Dots',
    draw: ((x, y) => (
      <g>
        <circle cx={x} cy={y} r="4.5" fill="#1b1b1b" />
        <circle cx={x + 1.5} cy={y - 1.5} r="1.4" fill="#fff" />
      </g>
    )) as EyeDraw,
  },
  happy: {
    label: 'Happy',
    draw: ((x, y) => <path d={`M${x - 7} ${y + 3} q7 -10 14 0`} fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />) as EyeDraw,
  },
  sleepy: {
    label: 'Sleepy',
    draw: ((x, y) => (
      <g stroke={LINE} strokeWidth="2" strokeLinecap="round">
        <path d={`M${x - 7} ${y} a7 7 0 0 0 14 0 z`} fill="#fff" />
        <circle cx={x} cy={y + 3} r="2.6" fill="#1b1b1b" stroke="none" />
        <path d={`M${x - 8.5} ${y} h17`} strokeWidth="3" />
      </g>
    )) as EyeDraw,
  },
  angry: {
    label: 'Grumpy',
    draw: ((x, y, side) => (
      <g>
        <circle cx={x} cy={y + 1} r="4.5" fill="#1b1b1b" />
        <path d={`M${x + side * 8} ${y - 11} L${x - side * 6} ${y - 5}`} stroke={LINE} strokeWidth="3.2" strokeLinecap="round" />
      </g>
    )) as EyeDraw,
  },
  googly: {
    label: 'Googly',
    draw: ((x, y, side) => (
      <g>
        <circle cx={x} cy={y} r="10" fill="#fff" stroke={LINE} strokeWidth="2" />
        <circle cx={x + (side === -1 ? 3 : -2)} cy={y + (side === -1 ? 3 : 4)} r="4.5" fill="#1b1b1b" />
      </g>
    )) as EyeDraw,
  },
  stars: {
    label: 'Starry',
    draw: ((x, y) => <polygon points={star(x, y, 8)} fill="#f2c624" stroke="#8a6d00" strokeWidth="1.5" strokeLinejoin="round" />) as EyeDraw,
  },
  hearts: {
    label: 'Hearts',
    draw: ((x, y) => (
      <path d={`M${x} ${y + 7} C${x - 11} ${y} ${x - 7} ${y - 9} ${x} ${y - 3} C${x + 7} ${y - 9} ${x + 11} ${y} ${x} ${y + 7} Z`}
        fill="#e5484d" stroke="#8f1d22" strokeWidth="1.5" strokeLinejoin="round" />
    )) as EyeDraw,
  },
  shades: {
    label: 'Shades',
    // Drawn once across both eyes; see Character.
    draw: ((x, y) => (
      <g>
        <rect x={x - 11} y={y - 7} width="22" height="14" rx="5" fill="#141414" />
        <path d={`M${x - 7} ${y - 3} l5 0`} stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
    )) as EyeDraw,
  },
} satisfies Record<string, { label: string; draw: EyeDraw }>

export type EyesId = keyof typeof EYES

const T = { stroke: LINE, strokeWidth: 2, strokeLinejoin: 'round' as const }

export const TOPS = {
  none: { label: 'Nothing', draw: () => null },
  crown: {
    label: 'Crown',
    draw: () => (
      <g {...T}>
        <path d="M-20 2 L-23 -22 L-11 -11 L0 -29 L11 -11 L23 -22 L20 2 Z" fill="#f2c624" />
        <circle cx="0" cy="-7" r="3" fill="#e5484d" strokeWidth="1.2" />
        <circle cx="-12" cy="-4" r="2.2" fill="#3b82f6" strokeWidth="1.2" />
        <circle cx="12" cy="-4" r="2.2" fill="#3b82f6" strokeWidth="1.2" />
      </g>
    ),
  },
  tophat: {
    label: 'Top hat',
    draw: () => (
      <g {...T}>
        <rect x="-16" y="-38" width="32" height="38" rx="3" fill="#232323" />
        <rect x="-16" y="-12" width="32" height="6" fill="#c0392b" />
        <ellipse cx="0" cy="0" rx="27" ry="5" fill="#232323" />
      </g>
    ),
  },
  beanie: {
    label: 'Beanie',
    draw: () => (
      <g {...T}>
        <path d="M-26 2 C-26 -32 26 -32 26 2 Z" fill="#2f80ed" />
        <rect x="-28" y="-7" width="56" height="11" rx="5.5" fill="#1c5db8" />
        <circle cx="0" cy="-30" r="7" fill="#f4f4f4" />
      </g>
    ),
  },
  party: {
    label: 'Party hat',
    draw: () => (
      <g {...T}>
        <path d="M-16 2 L0 -40 L16 2 Z" fill="#e5484d" />
        <path d="M-10 -14 L8 -6 M-5 -27 L5 -22" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="-41" r="5" fill="#f2c624" />
      </g>
    ),
  },
  cowboy: {
    label: 'Cowboy',
    draw: () => (
      <g {...T}>
        <path d="M-18 -1 C-21 -26 -8 -31 0 -24 C8 -31 21 -26 18 -1 Z" fill="#a06a35" />
        <path d="M-18 -7 C-6 -4 6 -4 18 -7 L18 -2 C6 1 -6 1 -18 -2 Z" fill="#5a3416" />
        <path d="M-40 -2 C-32 -10 -16 0 0 0 C16 0 32 -10 40 -2 C32 7 -32 7 -40 -2 Z" fill="#8b5a2b" />
      </g>
    ),
  },
  bow: {
    label: 'Bow',
    draw: () => (
      <g {...T} transform="translate(14 -2) rotate(15)">
        <path d="M0 -6 L-17 -17 L-17 5 Z" fill="#ff6fa8" />
        <path d="M0 -6 L17 -17 L17 5 Z" fill="#ff6fa8" />
        <circle cx="0" cy="-6" r="5" fill="#e0457f" />
      </g>
    ),
  },
  mohawk: {
    label: 'Mohawk',
    draw: () => (
      <path {...T} d="M-12 4 L-15 -16 L-6 -9 L-5 -31 L2 -11 L8 -27 L10 -7 L18 -15 L13 4 Z" fill="#7b3fe4" />
    ),
  },
  curls: {
    label: 'Curly hair',
    draw: () => (
      <g {...T} fill="#6b3e26">
        <circle cx="-22" cy="0" r="9" />
        <circle cx="22" cy="0" r="9" />
        <circle cx="-13" cy="-10" r="10" />
        <circle cx="13" cy="-10" r="10" />
        <circle cx="0" cy="-15" r="11" />
      </g>
    ),
  },
  bob: {
    label: 'Blonde bob',
    draw: () => (
      <path {...T} fill="#f2cf63"
        d="M-30 22 C-34 -6 -20 -22 0 -22 C20 -22 34 -6 30 22 C26 24 24 20 24 14 C22 2 14 -6 0 -6 C-14 -6 -22 2 -24 14 C-24 20 -26 24 -30 22 Z" />
    ),
  },
  tp: {
    label: 'Toilet paper',
    draw: () => (
      <g {...T}>
        <path d="M14 -22 h5 v26 h-5" fill="#fff" />
        <rect x="-14" y="-26" width="28" height="27" rx="4" fill="#fbfbfb" />
        <ellipse cx="0" cy="-26" rx="14" ry="5" fill="#ececec" />
        <ellipse cx="0" cy="-26" rx="5" ry="2" fill="#b9a58f" strokeWidth="1.2" />
      </g>
    ),
  },
  plunger: {
    label: 'Plunger',
    draw: () => (
      <g {...T}>
        <rect x="-3" y="-50" width="6" height="40" rx="2" fill="#c68d61" />
        <path d="M-19 2 C-19 -16 19 -16 19 2 Z" fill="#c0392b" />
      </g>
    ),
  },
} satisfies Record<string, { label: string; draw: () => ReactNode }>

export type TopId = keyof typeof TOPS

export const BASE_IDS = Object.keys(BASES) as BaseId[]
export const EYES_IDS = Object.keys(EYES) as EyesId[]
export const TOP_IDS = Object.keys(TOPS) as TopId[]
