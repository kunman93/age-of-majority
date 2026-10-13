import { expect, it } from 'vitest'
import { families } from './families'

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
