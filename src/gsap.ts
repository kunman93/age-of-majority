import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

// Web fonts reflow the text after the first measurement and
// ScrollTrigger only refreshes on window load and resize.
void document.fonts?.ready.then(() => ScrollTrigger.refresh())

export { gsap, ScrollTrigger, useGSAP }
