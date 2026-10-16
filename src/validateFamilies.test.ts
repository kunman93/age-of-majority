import { describe, expect, it } from 'vitest'
import { validateFamilies } from './validateFamilies'

const valid = [
  {
    name: 'Family A',
    messages: [{ author: 'Anna A', text: 'Happy birthday!' }],
  },
]

describe('validateFamilies', () => {
  it('accepts well-formed families', () => {
    expect(() => validateFamilies(valid)).not.toThrow()
  })

  it.each([
    ['nothing', undefined],
    ['an empty list', []],
    ['a family without a name', [{ messages: valid[0].messages }]],
    ['a family without messages', [{ name: 'Family A' }]],
    [
      'a family with an empty message list',
      [{ name: 'Family A', messages: [] }],
    ],
    [
      'a message without an author',
      [{ name: 'A', messages: [{ text: 'Hi' }] }],
    ],
    ['a message without text', [{ name: 'A', messages: [{ author: 'Anna' }] }]],
    [
      'a blank text',
      [{ name: 'A', messages: [{ author: 'Anna', text: ' ' }] }],
    ],
  ])('rejects %s', (_, families) => {
    expect(() => validateFamilies(families)).toThrow()
  })

  it.each(['Lorem ipsum dolor', '  lorem IPSUM dolor'])(
    'rejects the placeholder text %j',
    (text) => {
      expect(() =>
        validateFamilies([
          {
            name: 'A',
            messages: [{ author: 'Anna', text }],
          },
        ]),
      ).toThrow(/placeholder/i)
    },
  )
})
