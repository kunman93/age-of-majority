import { useState } from 'react'
import { supportsWebGL } from './supportsWebGL'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export type SceneMode = 'scene' | 'static'

export function useSceneMode() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [webGLSupported, setWebGLSupported] = useState<boolean>()
  const [sceneFailed, setSceneFailed] = useState(false)
  if (!prefersReducedMotion && webGLSupported === undefined) {
    setWebGLSupported(supportsWebGL())
  }

  const mode: SceneMode =
    !prefersReducedMotion && webGLSupported && !sceneFailed ? 'scene' : 'static'

  return { mode, fallBackToStatic: () => setSceneFailed(true) }
}
