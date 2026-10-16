import { describe, expect, it } from 'vitest'
import { chooseFamilies, families, type Family } from './families'

it('lists the families in order', () => {
  expect(families.map((family) => family.name)).toEqual([
    'Family Lorem',
    'Family Ipsum',
    'Family Dolor',
  ])
})

it('signs each message with the expected author', () => {
  expect(
    families.map((family) => family.messages.map((m) => m.author)),
  ).toEqual([
    ['Family Lorem'],
    ['Anna Ipsum', 'Ben Ipsum'],
    ['Family Dolor', 'Clara Dolor'],
  ])
})

it('uses Lorem ipsum placeholder texts', () => {
  const texts = families.flatMap((family) => family.messages.map((m) => m.text))

  expect(texts.length).toBeGreaterThan(0)
  texts.forEach((text) => expect(text).toMatch(/^Lorem ipsum/))
})

describe('chooseFamilies', () => {
  const placeholders: readonly Family[] = [
    { name: 'Placeholder', messages: [] },
  ]
  const wishes: readonly Family[] = [{ name: 'Real', messages: [] }]

  it('shows the real wishes in production when they exist', () => {
    expect(chooseFamilies(placeholders, wishes, true)).toBe(wishes)
  })

  it('shows the placeholders in production without real wishes', () => {
    expect(chooseFamilies(placeholders, undefined, true)).toBe(placeholders)
  })

  it('shows the placeholders outside production even with real wishes', () => {
    expect(chooseFamilies(placeholders, wishes, false)).toBe(placeholders)
  })
})
