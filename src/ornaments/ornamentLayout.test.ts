import { expect, it } from 'vitest'
import { layerOf, ornamentLayout, PLACEMENTS } from './ornamentLayout'

const compositions = PLACEMENTS.flatMap((placement) =>
  ornamentLayout[placement].map((composition) => ({
    placement,
    ...composition,
  })),
)

it.each(PLACEMENTS)(
  'frames the %s from the left and the right',
  (placement) => {
    expect(ornamentLayout[placement].map(({ side }) => side).sort()).toEqual([
      'left',
      'right',
    ])
  },
)

it('gives every composition stems, blossoms and dust', () => {
  for (const { pieces } of compositions) {
    expect(new Set(pieces.map(({ piece }) => layerOf(piece)))).toEqual(
      new Set(['stem', 'blossom', 'dust']),
    )
  }
})

it('draws each of the four compositions differently, not as a mirror copy', () => {
  const drawings = compositions.map(({ pieces }) => JSON.stringify(pieces))

  expect(new Set(drawings).size).toBe(compositions.length)
})
