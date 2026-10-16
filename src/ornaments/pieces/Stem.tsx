import { PALETTE } from './palette'
import { useGradientId } from './useGradientId'

type Leaf = { x: number; y: number; angle: number; length: number }
type Bud = { x: number; y: number; angle: number }
type StemSpec = {
  stem: string
  branches: string[]
  leaves: Leaf[]
  buds: Bud[]
}

const STEM_VARIANTS = {
  sweep: {
    stem: 'M62 298 C 14 246 104 196 60 138 C 24 90 80 54 64 6',
    branches: ['M52 196 C 30 176 22 150 30 124', 'M64 112 C 88 98 96 76 90 54'],
    leaves: [
      { x: 40, y: 262, angle: 200, length: 44 },
      { x: 78, y: 224, angle: -20, length: 40 },
      { x: 46, y: 178, angle: 205, length: 34 },
      { x: 70, y: 150, angle: -35, length: 30 },
      { x: 56, y: 104, angle: 215, length: 28 },
      { x: 72, y: 70, angle: -50, length: 24 },
    ],
    buds: [
      { x: 30, y: 124, angle: -12 },
      { x: 90, y: 54, angle: 18 },
      { x: 64, y: 6, angle: 4 },
    ],
  },
  arch: {
    stem: 'M18 298 C 10 200 40 120 108 96 C 126 90 134 70 128 46',
    branches: [
      'M26 206 C 52 196 70 172 74 146',
      'M70 124 C 66 100 78 82 98 76',
    ],
    leaves: [
      { x: 20, y: 262, angle: -30, length: 40 },
      { x: 16, y: 226, angle: 200, length: 36 },
      { x: 40, y: 168, angle: -55, length: 34 },
      { x: 52, y: 128, angle: 190, length: 30 },
      { x: 92, y: 102, angle: -75, length: 28 },
      { x: 118, y: 84, angle: 230, length: 22 },
    ],
    buds: [
      { x: 74, y: 146, angle: 8 },
      { x: 98, y: 76, angle: -30 },
      { x: 128, y: 46, angle: 8 },
    ],
  },
} satisfies Record<string, StemSpec>

export type StemVariant = keyof typeof STEM_VARIANTS

const leafPath = (length: number) =>
  `M0 0 C ${length * 0.25} ${-length * 0.3} ${length * 0.72} ${-length * 0.3} ${length} 0 C ${length * 0.72} ${length * 0.3} ${length * 0.25} ${length * 0.3} 0 0Z`

const BUD = 'M0 0 C 6 -5 7 -16 0 -26 C -7 -16 -6 -5 0 0Z'
const CALYX = 'M-6 -4 C -3 0 3 0 6 -4 C 3 -9 -3 -9 -6 -4Z'

/** A flowing gold stem with leaves and buds */
function Stem({ variant }: { variant: StemVariant }) {
  const gold = useGradientId('gold')
  const { stem, branches, leaves, buds } = STEM_VARIANTS[variant]

  return (
    <svg
      viewBox="0 0 150 300"
      data-ornament="stem"
      data-ornament-layer="stem"
      className="block h-auto w-full"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PALETTE.sun} />
          <stop offset="0.45" stopColor={PALETTE.tangerine} />
          <stop offset="0.7" stopColor={PALETTE.cream} stopOpacity="0.9" />
          <stop offset="1" stopColor={PALETTE.sun} />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gold})`} strokeLinecap="round">
        <path d={stem} strokeWidth="4.5" />
        {branches.map((d) => (
          <path key={d} d={d} strokeWidth="2.8" />
        ))}
      </g>
      {leaves.map(({ x, y, angle, length }) => (
        <g
          key={`${x}-${y}`}
          transform={`translate(${x} ${y}) rotate(${angle})`}
        >
          <path d={leafPath(length)} fill={`url(#${gold})`} opacity="0.95" />
          <path
            d={`M2 0 L${length * 0.85} 0`}
            stroke={PALETTE.cream}
            strokeOpacity="0.55"
            strokeWidth="0.8"
            fill="none"
          />
        </g>
      ))}
      {buds.map(({ x, y, angle }) => (
        <g
          key={`${x}-${y}`}
          transform={`translate(${x} ${y}) rotate(${angle})`}
        >
          <path d={BUD} fill={PALETTE.ember} opacity="0.8" />
          <path d={BUD} fill={`url(#${gold})`} opacity="0.35" />
          <path d={CALYX} fill={`url(#${gold})`} />
        </g>
      ))}
    </svg>
  )
}

export default Stem
