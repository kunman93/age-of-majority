import { useEffect, type RefObject } from 'react'
import type { SceneMode } from '../background/useSceneMode'
import { addTypewriter } from './typewriter'
import { gsap, ScrollTrigger, useGSAP } from '../gsap'

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
        load.from(targets(root, 'h1'), { opacity: 0, duration: 0.8 })
        const [intro] = targets(root, '[data-intro]')
        const restoreIntro = addTypewriter(load, intro)

        const opening = targets(root, '[data-opening]')
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
        targets(root, '[data-reveal]').forEach((target) =>
          gsap.from(target, {
            opacity: 0,
            y: 40,
            ease: 'none',
            scrollTrigger: {
              trigger: target,
              start: 'top bottom',
              end: 'clamp(top 60%)',
              scrub: 0.5,
            },
          }),
        )

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
