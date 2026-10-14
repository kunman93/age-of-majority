import { expect, it } from 'vitest'
import { splitSentences } from './splitSentences'

const INTRO =
  'Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say.'

it('splits the intro into three sentences that keep their punctuation', () => {
  expect(splitSentences(INTRO)).toEqual([
    'Today you come of age.',
    'This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you.',
    'Scroll on and read what they have to say.',
  ])
})

it('splits after exclamation and question marks too', () => {
  expect(splitSentences('Wow! Really? Yes.')).toEqual([
    'Wow!',
    'Really?',
    'Yes.',
  ])
})

it('keeps a text without a sentence end as one sentence', () => {
  expect(splitSentences('Hello there')).toEqual(['Hello there'])
})
