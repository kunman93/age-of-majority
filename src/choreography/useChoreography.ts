import { useEffect, type RefObject } from 'react'
import type { SceneMode } from '../background/useSceneMode'
import { addTypewriter } from './typewriter'
import { gsap, ScrollTrigger, useGSAP } from '../gsap'

const NO_REDUCED_MOTION = '(prefers-reduced-motion: no-preference)'

const targets = (scope: HTMLElement, selector: string) =>
  gsap.utils.toArray<HTMLElement>(selector, scope)

// finished before the element's top reaches the middle of the viewport
const scrubbedReveal = (trigger: HTMLElement) => ({
  trigger,
  start: 'top bottom',
  end: 'clamp(top 60%)',
  scrub: 0.5,
})

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
        load.from(targets(root, 'h1'), { opacity: 0, duration: 0.8 })
        const [intro] = targets(root, '[data-intro]')
        const opening = targets(root, '[data-opening]')
        const { restore: restoreIntro } = addTypewriter(load, intro, opening[0])
        gsap.to(opening, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: opening[0],
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        })

        // from, not to: the markup is the final state
        targets(root, '[data-reveal]:not([data-reveal="card"])').forEach(
          (target) =>
            gsap.from(target, {
              opacity: 0,
              y: 40,
              ease: 'none',
              scrollTrigger: scrubbedReveal(target),
            }),
        )

        // one timeline on the board, so the lower cards are in place by the
        // time the visitor reaches them. Opacity stays linear in its own tween
        // so the overshoot of the slide never flickers the text
        const [board] = targets(root, '[data-board]')
        const wishes = gsap.timeline({
          scrollTrigger: {
            trigger: board,
            start: 'top bottom',
            end: 'clamp(top 40%)',
            scrub: 0.5,
          },
        })
        targets(root, '[data-reveal="card"]').forEach((card, index) => {
          const side = index % 2 === 0 ? -1 : 1
          const position = index * 0.15
          wishes
            .from(card, { opacity: 0, ease: 'none', duration: 1 }, position)
            .from(
              card,
              { x: side * 100, ease: 'back.inOut(3)', duration: 1 },
              position,
            )
        })

        return restoreIntro
      })

      return () => matchMedia.revert()
    },
    { scope, dependencies: [mode], revertOnUpdate: true },
  )

  // the showcase height depends on the mode and moves everything below it
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [mode])
}
