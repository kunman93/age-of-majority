import { useGSAP } from '@gsap/react'
import { invalidate } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type RefObject } from 'react'
import { showcaseStage } from '../story/showcaseStage'

gsap.registerPlugin(useGSAP, ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

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

      // Web fonts reflow the text after the first measurement and
      // ScrollTrigger only refreshes on window load and resize.
      let active = true
      void document.fonts?.ready.then(() => {
        if (active) ScrollTrigger.refresh()
      })
      return () => {
        active = false
      }
    },
    { scope: wrapper },
  )

  return progress
}
