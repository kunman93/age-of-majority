import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

const getSnapshot = () => document.visibilityState === 'visible'

export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
