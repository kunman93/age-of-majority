export const LINEAR = 'none'

export const GREETING_FADE = 2.5

export const HEADING = Object.freeze({ y: -100, ease: 'power2.inOut' })

export const CARD = Object.freeze({
  x: 100,
  ease: 'back.inOut(3)',
  duration: 1,
  stagger: 0.15,
})

// seconds a reveal lags behind the scroll position
export const SCRUB = 4

export const OPENING_FADE_SCRUB = 0.5

const REVEAL_END = 'clamp(top 60%)'
export const CARD_REVEAL_END = 'clamp(top 50%)'

// finished before the element's top reaches the chosen height of the viewport
export const scrubbedReveal = (
  trigger: HTMLElement,
  end: string = REVEAL_END,
) => ({
  trigger,
  start: 'top bottom',
  end,
  scrub: SCRUB,
})
