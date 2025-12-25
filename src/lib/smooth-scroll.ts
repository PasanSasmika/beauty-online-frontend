import Lenis from 'lenis'

let lenis: Lenis | null = null

export function initSmoothScroll(): void {
  if (typeof window === 'undefined') return
  if (lenis) return // prevent re-init

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) =>
      Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // smoothTouch: false,
  })

  function raf(time: number) {
    lenis?.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}

export function destroySmoothScroll(): void {
  lenis?.destroy()
  lenis = null
}
