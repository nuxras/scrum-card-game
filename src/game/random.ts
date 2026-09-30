import { SOLUTION_IDS } from './data'
import type { Dice } from './types'

/** Uniform integer in [0, max) without modulo bias. */
function randomIndex(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max
  const buf = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buf)
    if (buf[0] < limit) return buf[0] % max
  }
}

export function rollDie(): number {
  return randomIndex(6) + 1
}

export function rollTwoDice(): Dice {
  return [rollDie(), rollDie()]
}

/**
 * One Chance card from the pile: what is left of the Event/Problem deck plus the 12 Solutions,
 * which never run out. The thinner the deck, the likelier a Solution.
 */
export function drawChanceCardId(deck: readonly string[]): string {
  const pile = [...deck, ...SOLUTION_IDS]
  return pile[randomIndex(pile.length)]
}
