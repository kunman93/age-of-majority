import { expect, it, vi } from 'vitest'

const mockFonts = () => {
  let resolve!: () => void
  const ready = new Promise<void>((done) => {
    resolve = done
  })
  const fonts = Object.assign(new EventTarget(), { ready })
  Object.defineProperty(document, 'fonts', {
    value: fonts,
    configurable: true,
  })
  return { resolve, fonts }
}

const loadFresh = async () => {
  vi.resetModules()
  return import('./gsap')
}

it('registers ScrollTrigger', async () => {
  const { gsap, ScrollTrigger } = await loadFresh()
  const target = { value: 0 }

  gsap.to(target, { value: 1, scrollTrigger: { trigger: document.body } })

  expect(ScrollTrigger.getAll()).toHaveLength(1)
})

it('refreshes ScrollTrigger once after the fonts are ready', async () => {
  const { resolve } = mockFonts()
  const { ScrollTrigger } = await loadFresh()
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')

  resolve()
  await Promise.resolve()
  await Promise.resolve()

  expect(refresh).toHaveBeenCalledTimes(1)
})

it('refreshes ScrollTrigger when fonts that start loading after ready finish', async () => {
  const { fonts } = mockFonts()
  const { ScrollTrigger } = await loadFresh()
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')

  fonts.dispatchEvent(new Event('loadingdone'))

  expect(refresh).toHaveBeenCalledTimes(1)
})
