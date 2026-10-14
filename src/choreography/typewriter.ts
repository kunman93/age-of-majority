import { gsap } from '../gsap'

const SECONDS_PER_CHARACTER = 0.03
const BLINK_SECONDS = 0.5
const CURSOR_LINGER_SECONDS = 2
const CURSOR_FADE_SECONDS = 0.4

// Types the intro out at the end of the timeline and returns what restores
// the final state, which is the intro's markup: all text typed, no cursor.
export function addTypewriter(
  timeline: gsap.core.Timeline,
  intro: HTMLElement,
): () => void {
  const typedText = intro.querySelector<HTMLElement>('[data-typed-text]')!
  const untypedText = intro.querySelector<HTMLElement>('[data-untyped-text]')!
  const cursor = intro.querySelector<HTMLElement>('[data-cursor]')!
  const text = typedText.textContent ?? ''

  const write = (count: number) => {
    typedText.textContent = text.slice(0, count)
    untypedText.textContent = text.slice(count)
  }
  write(0)
  intro.dataset.typed = 'typing'

  const blink = gsap.fromTo(
    cursor,
    { opacity: 1 },
    {
      opacity: 0,
      duration: BLINK_SECONDS,
      ease: 'steps(1)',
      repeat: -1,
      yoyo: true,
      paused: true,
    },
  )
  const typed = { count: 0 }

  timeline
    .add(() => {
      blink.play()
    })
    .to(typed, {
      count: text.length,
      duration: text.length * SECONDS_PER_CHARACTER,
      ease: 'none',
      onUpdate: () => write(Math.round(typed.count)),
      onComplete: () => {
        intro.dataset.typed = 'done'
      },
    })
    .to(
      cursor,
      { opacity: 0, duration: CURSOR_FADE_SECONDS, overwrite: true },
      `+=${CURSOR_LINGER_SECONDS}`,
    )

  return () => {
    write(text.length)
    intro.dataset.typed = 'done'
  }
}
