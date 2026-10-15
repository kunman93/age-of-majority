import { useEffect, type RefObject } from 'react'
import type { SceneMode } from '../background/useSceneMode'
import { addTypewriter } from './typewriter'
import { gsap, ScrollTrigger, useGSAP } from '../gsap'
import {
  CARD,
  CARD_REVEAL_END,
  GREETING_FADE,
  HEADING,
  LINEAR,
  OPENING_FADE_SCRUB,
  scrubbedReveal,
} from './motion'

const NO_REDUCED_MOTION = '(prefers-reduced-motion: no-preference)'

const targets = (scope: HTMLElement, selector: string) =>
  gsap.utils.toArray<HTMLElement>(selector, scope)

export function useChoreography(
  scope: RefObject<HTMLElement | null>,
  mode: SceneMode,
) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const matchMedia = gsap.matchMedia()

      matchMedia.add(NO_REDUCED_MOTION, () => {
        const load = gsap.timeline()
        load.from(targets(root, 'h1'), {
          opacity: 0,
          duration: GREETING_FADE,
          ease: HEADING.ease,
        })
        const [intro] = targets(root, '[data-intro]')
        const opening = targets(root, '[data-opening]')
        const { restore: restoreIntro } = addTypewriter(load, intro, opening[0])
        gsap.to(opening, {
          opacity: 0,
          ease: LINEAR,
          scrollTrigger: {
            trigger: opening[0],
            start: 'top top',
            end: 'bottom top',
            scrub: OPENING_FADE_SCRUB,
          },
        })

        // from, not to: the markup is the final state
        targets(root, '[data-reveal="heading"]').forEach((heading) =>
          gsap.from(heading, {
            opacity: 0,
            ...HEADING,
            scrollTrigger: scrubbedReveal(heading),
          }),
        )
        // below the finale heading, so it follows the heading's drop
        targets(root, '[data-reveal="fade"]').forEach((fade) =>
          gsap.from(fade, {
            opacity: 0,
            ease: LINEAR,
            scrollTrigger: scrubbedReveal(fade),
          }),
        )

        // one timeline on the board, so the lower cards are in place by the
        // time the visitor reaches them. Opacity stays linear in its own tween
        // so the overshoot of the slide never flickers the text
        const [board] = targets(root, '[data-board]')
        const wishes = gsap.timeline({
          scrollTrigger: scrubbedReveal(board, CARD_REVEAL_END),
        })
        targets(root, '[data-reveal="card"]').forEach((card, index) => {
          const side = index % 2 === 0 ? -1 : 1
          const position = index * CARD.stagger
          const { duration } = CARD
          wishes
            .from(card, { opacity: 0, ease: LINEAR, duration }, position)
            .from(
              card,
              { x: side * CARD.x, ease: CARD.ease, duration },
              position,
            )
        })

        return restoreIntro
      })

      return () => matchMedia.revert()
    },
    { scope },
  )

  // the showcase height depends on the mode and moves everything below it
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [mode])
}
