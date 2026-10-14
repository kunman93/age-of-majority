import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import StageIllustration from './StageIllustration'
import { STAGES, stageShapes } from './stageShapes'

it.each(STAGES)('draws one path per shape of the %s stage', (stage) => {
  const { container } = render(<StageIllustration stage={stage} />)

  const paths = container.querySelectorAll('path')
  expect(paths).toHaveLength(stageShapes[stage].length)
  paths.forEach((path) => expect(path).toHaveAttribute('fill-rule', 'evenodd'))
})

it('is hidden from assistive technology', () => {
  const { container } = render(<StageIllustration stage="key" />)

  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

it('names its stage', () => {
  const { container } = render(<StageIllustration stage="18" />)

  expect(container.querySelector('svg')).toHaveAttribute(
    'data-stage-illustration',
    '18',
  )
})
