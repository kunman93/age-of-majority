import { useId } from 'react'

// useId contains colons, which are awkward inside url(#...)
export const useGradientId = (name: string) =>
  `${useId().replace(/:/g, '')}-${name}`
