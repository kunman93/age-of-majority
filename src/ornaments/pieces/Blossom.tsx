import { PALETTE } from './palette'
import { useGradientId } from './useGradientId'

const TONES = {
  rose: [PALETTE.cream, PALETTE.blush, PALETTE.ember],
  coral: [PALETTE.blush, PALETTE.ember, PALETTE.plum],
} as const

export type BlossomTone = keyof typeof TONES

// each petal points up from the heart; the tip of a cosmos petal is scalloped
const COSMOS_PETAL =
  'M0 -6 C -24 -26 -36 -64 -24 -92 C -17 -84 -9 -90 0 -78 C 9 -90 17 -84 24 -92 C 36 -64 24 -26 0 -6Z'
const ROUND_PETAL = 'M0 -4 C -42 -22 -46 -80 0 -94 C 46 -80 42 -22 0 -4Z'

type Ring = { count: number; turn: number; scale: number; opacity: number }

const COSMOS_RINGS: Ring[] = [
  { count: 8, turn: 0, scale: 1, opacity: 0.72 },
  { count: 8, turn: 22.5, scale: 0.8, opacity: 0.82 },
  { count: 8, turn: 0, scale: 0.46, opacity: 0.9 },
]
const ROUND_RINGS: Ring[] = [
  { count: 6, turn: 0, scale: 1, opacity: 0.7 },
  { count: 6, turn: 30, scale: 0.78, opacity: 0.8 },
  { count: 6, turn: 0, scale: 0.55, opacity: 0.86 },
  { count: 5, turn: 36, scale: 0.3, opacity: 0.9 },
]

function Blossom({
  piece,
  petal,
  rings,
  tone,
}: {
  piece: string
  petal: string
  rings: Ring[]
  tone: BlossomTone
}) {
  const gradient = useGradientId('petal')
  const gold = useGradientId('heart')
  const [heart, middle, rim] = TONES[tone]

  return (
    <svg
      viewBox="-100 -100 200 200"
      data-ornament={piece}
      data-ornament-layer="blossom"
      className="block h-auto w-full"
    >
      <defs>
        <radialGradient
          id={gradient}
          cx="0"
          cy="0"
          r="96"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={heart} />
          <stop offset="0.4" stopColor={middle} />
          <stop offset="1" stopColor={rim} />
        </radialGradient>
        <radialGradient id={gold}>
          <stop offset="0" stopColor={PALETTE.cream} />
          <stop offset="0.5" stopColor={PALETTE.sun} />
          <stop offset="1" stopColor={PALETTE.tangerine} />
        </radialGradient>
      </defs>
      {rings.map(({ count, turn, scale, opacity }, ring) =>
        Array.from({ length: count }, (_, index) => (
          <g
            key={`${ring}-${index}`}
            transform={`rotate(${turn + (360 / count) * index}) scale(${scale})`}
          >
            <path d={petal} fill={`url(#${gradient})`} opacity={opacity} />
            <path
              d="M0 -14 L0 -66"
              stroke={PALETTE.cream}
              strokeOpacity="0.35"
              strokeWidth="1"
              fill="none"
            />
          </g>
        )),
      )}
      <circle r="9" fill={`url(#${gold})`} />
      {Array.from({ length: 10 }, (_, index) => (
        <circle
          key={index}
          cx={Math.cos((index * Math.PI) / 5) * 14}
          cy={Math.sin((index * Math.PI) / 5) * 14}
          r="1.6"
          fill={PALETTE.tangerine}
        />
      ))}
    </svg>
  )
}

export const Cosmos = ({ tone }: { tone: BlossomTone }) => (
  <Blossom
    piece="cosmos"
    petal={COSMOS_PETAL}
    rings={COSMOS_RINGS}
    tone={tone}
  />
)

export const Round = ({ tone }: { tone: BlossomTone }) => (
  <Blossom piece="round" petal={ROUND_PETAL} rings={ROUND_RINGS} tone={tone} />
)
