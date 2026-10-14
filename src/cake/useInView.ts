import { useEffect, useState, type RefObject } from 'react'

/** Whether the element currently intersects the viewport */
export function useInView(ref: RefObject<Element | null>) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver((entries) =>
      setInView(entries[entries.length - 1].isIntersecting),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
