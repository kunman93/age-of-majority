import ReactThreeTestRenderer from '@react-three/test-renderer'
import { expect, it, vi } from 'vitest'
import type { Points, ShaderMaterial } from 'three'
import StoryObject, { STORY_COUNT } from './StoryObject'

async function renderStoryObject(progress = { current: 0 }) {
  const renderer = await ReactThreeTestRenderer.create(
    <StoryObject progress={progress} />,
  )
  const points = renderer.scene.children[0].instance as Points
  return { renderer, points, material: points.material as ShaderMaterial }
}

it('draws the story object as one set of points', async () => {
  const { renderer, points } = await renderStoryObject()

  expect(renderer.scene.children).toHaveLength(1)
  expect(points.type).toBe('Points')
})

it('has a position for every particle in every stage', async () => {
  const { points } = await renderStoryObject()

  for (const name of ['position', 'aStage1', 'aStage2']) {
    expect(points.geometry.getAttribute(name).count).toBe(STORY_COUNT)
  }
  expect(points.geometry.getAttribute('aOffset').count).toBe(STORY_COUNT)
  expect(points.geometry.getAttribute('aStage3')).toBeUndefined()
})

it('follows the shared progress after a frame', async () => {
  const progress = { current: 0 }
  const { renderer, material } = await renderStoryObject(progress)
  expect(material.uniforms.uProgress.value).toBe(0)

  progress.current = 1.5
  await renderer.advanceFrames(1, 0.016)

  expect(material.uniforms.uProgress.value).toBe(1.5)
})

it('has no visibility uniform', async () => {
  const { material } = await renderStoryObject()

  expect(material.uniforms.uVisible).toBeUndefined()
})

it('has no time uniform', async () => {
  const { material } = await renderStoryObject()

  expect(material.uniforms.uTime).toBeUndefined()
})

it('disposes its geometry and material on unmount', async () => {
  const { renderer, points, material } = await renderStoryObject()
  const disposeGeometry = vi.spyOn(points.geometry, 'dispose')
  const disposeMaterial = vi.spyOn(material, 'dispose')

  await renderer.unmount()

  expect(disposeGeometry).toHaveBeenCalled()
  expect(disposeMaterial).toHaveBeenCalled()
})
