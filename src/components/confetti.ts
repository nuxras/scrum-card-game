import confetti from 'canvas-confetti'

// Hole-punch chads from ruled paper, with a few stabilo and Solution-blue dots.
const COLORS = ['#d3e3f4', '#a9c6e6', '#ffe53d', '#7fd0f5', '#ffffff']

/** A small burst of hole-punch confetti from an element (a story that just hit DONE). */
export function punchFrom(el: Element | null) {
  const rect = el?.getBoundingClientRect()
  const origin = rect
    ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
    : { x: 0.5, y: 0.4 }
  void confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 32,
    gravity: 0.9,
    ticks: 160,
    scalar: 0.8,
    shapes: ['circle'],
    colors: COLORS,
    origin,
    disableForReducedMotion: true,
  })
}

/** The end-of-game shower. */
export function celebrate() {
  const base = {
    shapes: ['circle'] as confetti.Shape[],
    colors: COLORS,
    scalar: 0.9,
    ticks: 260,
    disableForReducedMotion: true,
  }
  void confetti({ ...base, particleCount: 120, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } })
  void confetti({ ...base, particleCount: 120, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } })
  setTimeout(() => void confetti({ ...base, particleCount: 160, spread: 120, startVelocity: 40, origin: { x: 0.5, y: 0.3 } }), 350)
}
