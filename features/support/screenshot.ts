/// <reference lib="dom" />
import type { Page } from '@playwright/test'

export const countDifferingPixels = (
  page: Page,
  first: Buffer,
  second: Buffer,
) =>
  page.evaluate(
    async ([a, b]) => {
      const read = async (base64: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, canvas.width, canvas.height).data
      }
      const [left, right] = [await read(a), await read(b)]
      let differing = 0
      for (let i = 0; i < left.length; i += 4) {
        if (
          left[i] !== right[i] ||
          left[i + 1] !== right[i + 1] ||
          left[i + 2] !== right[i + 2]
        )
          differing += 1
      }
      return differing
    },
    [first.toString('base64'), second.toString('base64')],
  )
