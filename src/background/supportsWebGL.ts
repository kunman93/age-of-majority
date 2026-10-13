export function supportsWebGL() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!context) return false
  // mobile Safari caps the number of live contexts
  ;(context as WebGLRenderingContext)
    .getExtension('WEBGL_lose_context')
    ?.loseContext()
  return true
}
