import { Component, lazy, Suspense, useState, type ReactNode } from 'react'
import { supportsWebGL } from './supportsWebGL'
import { usePageVisible } from './usePageVisible'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const EmberCanvas = lazy(() => import('./EmberCanvas'))

class BackgroundErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Background() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const pageVisible = usePageVisible()
  const [webGLSupported] = useState(supportsWebGL)

  return (
    <>
      <div
        data-testid="background-glow"
        aria-hidden="true"
        className="from-glow to-night pointer-events-none fixed inset-0 -z-10 bg-radial-[at_50%_30%] to-70%"
      />
      {!prefersReducedMotion && webGLSupported && (
        <BackgroundErrorBoundary>
          <Suspense fallback={null}>
            <EmberCanvas paused={!pageVisible} />
          </Suspense>
        </BackgroundErrorBoundary>
      )}
    </>
  )
}

export default Background
