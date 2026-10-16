import type { BlossomTone } from './pieces/Blossom'
import type { StemVariant } from './pieces/Stem'

export const PLACEMENTS = ['opening', 'showcase'] as const
export type Placement = (typeof PLACEMENTS)[number]

type Geometry = {
  /** centre, percent of the composition's width */
  x: number
  /** centre, percent of the composition's height */
  y: number
  /** percent of the composition's width */
  size: number
  /** degrees */
  rotation: number
}

export type Piece = Geometry &
  (
    | { piece: 'stem'; variant: StemVariant }
    | { piece: 'cosmos' | 'round'; tone: BlossomTone }
    | { piece: 'dust'; seed: number }
  )

export type Composition = {
  side: 'left' | 'right'
  anchor: 'top' | 'bottom'
  /** vw the composition is tall, before the clamp */
  height: number
  /** fraction of the composition's height that bleeds off its side edge */
  bleed: number
  /** painted first to last: dust, stems, then blossoms */
  pieces: readonly Piece[]
}

export const ornamentLayout: Record<Placement, readonly Composition[]> = {
  opening: [
    {
      side: 'left',
      anchor: 'top',
      height: 28,
      bleed: 0.2,
      pieces: [
        { piece: 'dust', seed: 1, x: 56, y: 50, size: 110, rotation: 0 },
        {
          piece: 'stem',
          variant: 'sweep',
          x: 38,
          y: 56,
          size: 58,
          rotation: 14,
        },
        {
          piece: 'stem',
          variant: 'arch',
          x: 66,
          y: 42,
          size: 40,
          rotation: -28,
        },
        { piece: 'round', tone: 'rose', x: 50, y: 38, size: 56, rotation: 10 },
        {
          piece: 'cosmos',
          tone: 'coral',
          x: 28,
          y: 76,
          size: 38,
          rotation: -14,
        },
        { piece: 'cosmos', tone: 'rose', x: 78, y: 72, size: 24, rotation: 32 },
      ],
    },
    {
      side: 'right',
      anchor: 'bottom',
      height: 26,
      bleed: 0.2,
      pieces: [
        { piece: 'dust', seed: 2, x: 46, y: 50, size: 100, rotation: 180 },
        {
          piece: 'stem',
          variant: 'arch',
          x: 60,
          y: 52,
          size: 54,
          rotation: -18,
        },
        {
          piece: 'stem',
          variant: 'sweep',
          x: 28,
          y: 64,
          size: 34,
          rotation: -38,
        },
        { piece: 'cosmos', tone: 'rose', x: 50, y: 44, size: 62, rotation: 0 },
        { piece: 'round', tone: 'coral', x: 72, y: 76, size: 34, rotation: 20 },
        { piece: 'round', tone: 'rose', x: 22, y: 30, size: 22, rotation: -10 },
      ],
    },
  ],
  showcase: [
    {
      side: 'left',
      anchor: 'bottom',
      height: 24,
      bleed: 0.15,
      pieces: [
        { piece: 'dust', seed: 3, x: 50, y: 46, size: 104, rotation: 90 },
        { piece: 'stem', variant: 'arch', x: 42, y: 56, size: 50, rotation: 8 },
        {
          piece: 'cosmos',
          tone: 'coral',
          x: 56,
          y: 40,
          size: 58,
          rotation: -22,
        },
        { piece: 'round', tone: 'rose', x: 30, y: 74, size: 30, rotation: 40 },
      ],
    },
    {
      side: 'right',
      anchor: 'top',
      height: 28,
      bleed: 0.2,
      pieces: [
        { piece: 'dust', seed: 4, x: 44, y: 54, size: 112, rotation: 270 },
        {
          piece: 'stem',
          variant: 'sweep',
          x: 58,
          y: 54,
          size: 56,
          rotation: -8,
        },
        {
          piece: 'stem',
          variant: 'sweep',
          x: 30,
          y: 36,
          size: 30,
          rotation: 30,
        },
        {
          piece: 'round',
          tone: 'coral',
          x: 46,
          y: 62,
          size: 50,
          rotation: -30,
        },
        { piece: 'cosmos', tone: 'rose', x: 70, y: 28, size: 34, rotation: 12 },
        {
          piece: 'cosmos',
          tone: 'coral',
          x: 24,
          y: 82,
          size: 22,
          rotation: 20,
        },
      ],
    },
  ],
}
