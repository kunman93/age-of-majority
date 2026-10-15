export const PLACEMENTS = ['opening', 'showcase'] as const

export type Placement = (typeof PLACEMENTS)[number]

export type Ornament = {
  kind: 'sparkle' | 'star' | 'confetti'
  /** percent of the layer */
  left: number
  /** percent of the layer */
  top: number
  /** pixels */
  size: number
  color: 'text-sun' | 'text-tangerine' | 'text-ember' | 'text-blush'
  /** pixels the ornament travels vertically over the page scroll */
  drift: number
}

export const ornamentLayout: Record<Placement, readonly Ornament[]> = {
  opening: [
    {
      kind: 'sparkle',
      left: 6,
      top: 4,
      size: 28,
      color: 'text-sun',
      drift: -60,
    },
    {
      kind: 'confetti',
      left: 28,
      top: 9,
      size: 16,
      color: 'text-ember',
      drift: 40,
    },
    {
      kind: 'star',
      left: 52,
      top: 3,
      size: 22,
      color: 'text-tangerine',
      drift: -30,
    },
    {
      kind: 'sparkle',
      left: 86,
      top: 8,
      size: 20,
      color: 'text-blush',
      drift: 70,
    },
    { kind: 'star', left: 10, top: 92, size: 24, color: 'text-sun', drift: 50 },
    {
      kind: 'confetti',
      left: 38,
      top: 96,
      size: 14,
      color: 'text-blush',
      drift: -45,
    },
    {
      kind: 'sparkle',
      left: 66,
      top: 90,
      size: 30,
      color: 'text-tangerine',
      drift: -70,
    },
    {
      kind: 'confetti',
      left: 90,
      top: 95,
      size: 18,
      color: 'text-ember',
      drift: 35,
    },
  ],
  showcase: [
    {
      kind: 'star',
      left: 8,
      top: 6,
      size: 26,
      color: 'text-tangerine',
      drift: 55,
    },
    {
      kind: 'sparkle',
      left: 30,
      top: 11,
      size: 20,
      color: 'text-sun',
      drift: -40,
    },
    {
      kind: 'confetti',
      left: 60,
      top: 5,
      size: 16,
      color: 'text-blush',
      drift: 65,
    },
    {
      kind: 'sparkle',
      left: 88,
      top: 10,
      size: 28,
      color: 'text-ember',
      drift: -55,
    },
    {
      kind: 'confetti',
      left: 12,
      top: 94,
      size: 18,
      color: 'text-sun',
      drift: -50,
    },
    {
      kind: 'sparkle',
      left: 40,
      top: 90,
      size: 24,
      color: 'text-blush',
      drift: 45,
    },
    {
      kind: 'star',
      left: 70,
      top: 95,
      size: 22,
      color: 'text-sun',
      drift: -65,
    },
    {
      kind: 'confetti',
      left: 92,
      top: 91,
      size: 14,
      color: 'text-tangerine',
      drift: 30,
    },
  ],
}
