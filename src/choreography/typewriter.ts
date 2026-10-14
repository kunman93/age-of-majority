import { gsap, ScrollTrigger } from '../gsap'

const SECONDS_PER_CHARACTER = 0.03
const SECONDS_PER_ERASED_CHARACTER = 0.015
const HOLD_SECONDS = 2
const BLINK_SECONDS = 0.5

type Typewriter = {
  loop: gsap.core.Timeline
  restore: () => void
}

const part = (line: HTMLElement, name: string) =>
  line.querySelector<HTMLElement>(`[data-${name}]`)!

// Loops through the intro's sentences, typing, holding and erasing each one in
// its stacked line, after the load timeline has run. `restore` brings back the
// final state, which is the intro's markup: the full text, no cursor.
export function addTypewriter(
  load: gsap.core.Timeline,
  intro: HTMLElement,
  opening: HTMLElement,
): Typewriter {
  const full = part(intro, 'full-text')
  const lines = [...intro.querySelectorAll<HTMLElement>('[data-sentence-line]')]
  const sentences = lines.map((line) => part(line, 'untyped-text').textContent!)
  const cursors = lines.map((line) => part(line, 'cursor'))

  const write = (index: number, count: number) => {
    part(lines[index], 'typed-text').textContent = sentences[index].slice(
      0,
      count,
    )
    part(lines[index], 'untyped-text').textContent =
      sentences[index].slice(count)
  }
  const mark = (phase: string) => () => {
    intro.dataset.typed = phase
  }

  gsap.set(full, { display: 'none' })
  gsap.set(lines, { display: 'block', opacity: 0 })
  intro.dataset.typed = 'typing'
  intro.dataset.sentence = '0'

  const loop = gsap.timeline({ repeat: -1, paused: true })
  const blink = gsap.fromTo(
    cursors,
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

  sentences.forEach((sentence, index) => {
    const count = (from: number, to: number, secondsPerCharacter: number) =>
      loop.fromTo(
        typed,
        { count: from },
        {
          count: to,
          duration: sentence.length * secondsPerCharacter,
          ease: 'none',
          immediateRender: false,
          onUpdate: () => write(index, Math.round(typed.count)),
        },
      )

    loop
      .add(() => {
        intro.dataset.sentence = String(index)
        intro.dataset.typed = 'typing'
      })
      .set(lines[index], { opacity: 1 })
    count(0, sentence.length, SECONDS_PER_CHARACTER)
    loop.add(mark('shown'))
    loop.add(mark('erasing'), `+=${HOLD_SECONDS}`)
    count(sentence.length, 0, SECONDS_PER_ERASED_CHARACTER)
    loop.set(lines[index], { opacity: 0 })
  })

  const run = (running: boolean) => {
    loop.paused(!running)
    blink.paused(!running)
  }
  // the load timeline may end after the visitor has scrolled out of the opening
  let inView = true
  load.add(() => run(inView))
  ScrollTrigger.create({
    trigger: opening,
    start: 'top top',
    end: 'bottom top',
    onLeave: () => {
      inView = false
      run(false)
    },
    onEnterBack: () => {
      inView = true
      run(true)
    },
  })

  return {
    loop,
    restore: () => {
      lines.forEach((_, index) => write(index, 0))
      intro.dataset.typed = 'done'
      delete intro.dataset.sentence
    },
  }
}
