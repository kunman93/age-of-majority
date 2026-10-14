import { expect, it, vi } from 'vitest'

const mockFonts = () => {
  let resolve!: () => void
  const ready = new Promise<void>((done) => {
    resolve = done
  })
  Object.defineProperty(document, 'fonts', {
    value: { ready },
    configurable: true,
  })
  return resolve
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
  const resolve = mockFonts()
  const { ScrollTrigger } = await loadFresh()
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')

  resolve()
  await Promise.resolve()
  await Promise.resolve()

  expect(refresh).toHaveBeenCalledTimes(1)
})
