/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseRgb } from '../../features/support/color'
import { glowTint } from './glowTint'

const styles = readFileSync('src/index.css', 'utf8')

const DARK_YELLOW = 'rgb(77, 61, 10)'
const DARK_ORANGE = 'rgb(74, 42, 20)'
const DARK_RED = 'rgb(74, 28, 24)'

describe('glowTint', () => {
  it('is a dark yellow at the top', () => {
    expect(glowTint(0)).toBe(DARK_YELLOW)
  })

  it('is a dark orange halfway', () => {
    expect(glowTint(0.5)).toBe(DARK_ORANGE)
  })

  it('is a dark red at the end, like the glow color', () => {
    expect(glowTint(1)).toBe(DARK_RED)
    expect(styles).toContain('--color-glow: #4a1c18')
  })

  it('blends continuously between the stops', () => {
    expect(glowTint(0.25)).toBe('rgb(76, 52, 15)')
    expect(glowTint(0.75)).toBe('rgb(74, 35, 22)')
  })

  it('clamps progress outside 0..1', () => {
    expect(glowTint(-1)).toBe(DARK_YELLOW)
    expect(glowTint(2)).toBe(DARK_RED)
  })

  it.each(['cream', 'blush', 'sun', 'tangerine'])(
    'keeps %s text at 4.5:1 or more on every stop',
    (name) => {
      const hex = new RegExp(`--color-${name}: #([0-9a-f]{6})`).exec(styles)![1]
      const text = parseRgb(
        `rgb(${[0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`,
      )

      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        expect(
          contrastRatio(text, parseRgb(glowTint(progress))),
        ).toBeGreaterThanOrEqual(4.5)
      }
    },
  )
})
