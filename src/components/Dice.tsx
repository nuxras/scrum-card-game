import { useEffect, useEffectEvent, useState } from 'react'
import type { Dice as DicePair } from '../game/types'

// Cube faces: 1 front, 6 back, 3 right, 4 left, 2 top, 5 bottom.
const FACE_ROTATION: Record<number, [number, number]> = {
  1: [0, 0],
  6: [0, 180],
  3: [0, -90],
  4: [0, 90],
  2: [-90, 0],
  5: [90, 0],
}

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

const REST: [number, number] = [-22, 28]
const mod360 = (n: number) => ((n % 360) + 360) % 360

function Face({ n, side }: { n: number; side: string }) {
  return (
    <div className={`die__face die__face--${side}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={PIPS[n].includes(i) ? 'pip' : 'pip pip--off'} />
      ))}
    </div>
  )
}

function Die({ value, spin }: { value: number | null; spin: number }) {
  const [pose, setPose] = useState(() => ({ value, spin, angle: value ? FACE_ROTATION[value] : REST }))

  // A new roll (spin) or face (value) moves the cube: whole forward turns, then the face.
  if (pose.value !== value || pose.spin !== spin) {
    let angle = pose.angle
    if (value) {
      const [tx, ty] = FACE_ROTATION[value]
      if (spin === 0 || pose.spin === spin) angle = [tx, ty]
      else {
        const [cx, cy] = pose.angle
        const turns = 2 + (spin % 2)
        angle = [cx - mod360(cx) + 360 * turns + tx, cy - mod360(cy) + 360 * (turns + 1) + ty]
      }
    }
    setPose({ value, spin, angle })
  }

  const [x, y] = pose.angle
  return (
    <div className="die">
      <div className="die__cube" style={{ transform: `rotateX(${x}deg) rotateY(${y}deg)` }}>
        <Face n={1} side="front" />
        <Face n={6} side="back" />
        <Face n={3} side="right" />
        <Face n={4} side="left" />
        <Face n={2} side="top" />
        <Face n={5} side="bottom" />
      </div>
    </div>
  )
}

/**
 * Two dice. Give them `values` plus a new `rollKey` to tumble onto those faces;
 * `onSettled` fires when they come to rest.
 */
export function DicePairView({
  values,
  rollKey,
  reduced,
  onSettled,
  size = 'lg',
}: {
  values: DicePair | null
  rollKey: number
  reduced: boolean
  onSettled?: () => void
  size?: 'lg' | 'sm'
}) {
  const duration = reduced ? 0 : 1100
  const settle = useEffectEvent(() => onSettled?.())

  useEffect(() => {
    if (rollKey === 0) return
    const t = setTimeout(settle, duration + 60)
    return () => clearTimeout(t)
  }, [rollKey, duration])

  // Alternating keyframe names restart the toss animation on every roll.
  const toss = rollKey === 0 || reduced ? undefined : rollKey % 2 ? 'toss-a' : 'toss-b'

  return (
    <div
      className={`dice dice--${size}`}
      data-toss={toss}
      style={{ '--die-t': `${duration}ms` } as React.CSSProperties}
      aria-hidden="true"
    >
      <Die value={values?.[0] ?? null} spin={rollKey} />
      <Die value={values?.[1] ?? null} spin={rollKey ? rollKey + 1 : 0} />
    </div>
  )
}
