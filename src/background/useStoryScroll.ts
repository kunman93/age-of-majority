import { invalidate } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { gsap, useGSAP } from '../gsap'
import { showcaseStage } from '../story/showcaseStage'

export function useStoryScroll(wrapper: RefObject<HTMLElement | null>) {
  const progress = useRef(0)

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
    },
    { scope: wrapper },
  )

  return progress
}
