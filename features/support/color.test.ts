import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  hue,
  parseRgb,
  relativeLuminance,
  saturation,
} from './color.ts'

describe('parseRgb', () => {
  it('parses rgb()', () => {
    expect(parseRgb('rgb(255, 244, 230)')).toEqual({
      r: 255,
      g: 244,
      b: 230,
      a: 1,
    })
  })

  it('parses rgba() with alpha', () => {
    expect(parseRgb('rgba(42, 18, 21, 0.5)')).toEqual({
      r: 42,
      g: 18,
      b: 21,
      a: 0.5,
    })
  })

  it('parses a fully transparent color', () => {
    expect(parseRgb('rgba(0, 0, 0, 0)').a).toBe(0)
  })

  it('throws on any other color format', () => {
    expect(() => parseRgb('oklch(0.7 0.1 50)')).toThrow()
    expect(() => parseRgb('#fff')).toThrow()
  })
})

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0)
    expect(relativeLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1)
  })
})

describe('contrastRatio', () => {
  const black = { r: 0, g: 0, b: 0, a: 1 }
  const white = { r: 255, g: 255, b: 255, a: 1 }

  it('is 21 between black and white, in either order', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21)
    expect(contrastRatio(white, black)).toBeCloseTo(21)
  })

  it('is 1 between equal colors', () => {
    expect(contrastRatio(white, white)).toBe(1)
  })

  it('matches the ratio documented in design.md for cream on night', () => {
    const cream = parseRgb('rgb(255, 244, 230)')
    const night = parseRgb('rgb(42, 18, 21)')
    expect(contrastRatio(cream, night)).toBeCloseTo(16.17, 1)
  })
})

describe('hue and saturation', () => {
  it('puts red at 0, orange at about 30 and yellow at 60 degrees', () => {
    expect(hue({ r: 255, g: 0, b: 0, a: 1 })).toBe(0)
    expect(hue({ r: 255, g: 128, b: 0, a: 1 })).toBeCloseTo(30, 0)
    expect(hue({ r: 255, g: 255, b: 0, a: 1 })).toBe(60)
  })

  it('has no saturation for gray', () => {
    expect(saturation({ r: 128, g: 128, b: 128, a: 1 })).toBe(0)
  })

  it('is fully saturated for a pure color', () => {
    expect(saturation({ r: 255, g: 0, b: 0, a: 1 })).toBe(1)
  })

  it('treats pale cream as barely saturated', () => {
    expect(saturation(parseRgb('rgb(255, 244, 230)'))).toBeLessThan(0.2)
  })
})
