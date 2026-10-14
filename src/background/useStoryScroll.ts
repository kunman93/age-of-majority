import { invalidate } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { gsap, useGSAP } from '../gsap'
import { showcaseStage } from '../story/showcaseStage'

export function useStoryScroll(wrapper: RefObject<HTMLElement | null>) {
  const progress = useRef(0)
  const entry = useRef(0)
  const exit = useRef(0)

  useGSAP(
    () => {
      const showcase = document.querySelector<HTMLElement>('[data-showcase]')
      if (!showcase) return

      // scrub only smooths a tween, so the scroll drives a 0..1 value
      const linear = { value: 0 }
      gsap.to(linear, {
        value: 1,
        ease: 'none',
        onUpdate: () => {
          progress.current = showcaseStage(linear.value)
          wrapper.current?.setAttribute(
            'data-story-progress',
            progress.current.toFixed(2),
          )
          invalidate()
        },
        scrollTrigger: {
          trigger: showcase,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      })

      const edge = (
        name: 'entry' | 'exit',
        value: { current: number },
        start: string,
        end: string,
      ) => {
        const state = { value: 0 }
        gsap.to(state, {
          value: 1,
          ease: 'none',
          onUpdate: () => {
            value.current = state.value
            wrapper.current?.setAttribute(
              `data-story-${name}`,
              state.value.toFixed(2),
            )
            invalidate()
          },
          scrollTrigger: {
            trigger: showcase,
            start,
            end,
            scrub: 0.5,
          },
        })
      }
      edge('entry', entry, 'top bottom', 'top top')
      edge('exit', exit, 'bottom bottom', 'bottom top')
    },
    { scope: wrapper },
  )

  return { progress, entry, exit }
}
