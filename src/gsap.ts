import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

// Web fonts reflow the text after the first measurement and ScrollTrigger only
// refreshes on window load and resize. `ready` can resolve before a font has
// started loading, so `loadingdone` catches the fonts that arrive later.
void document.fonts?.ready.then(() => ScrollTrigger.refresh())
document.fonts?.addEventListener('loadingdone', () => ScrollTrigger.refresh())

export { gsap, ScrollTrigger, useGSAP }
