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
 * One Chance card. A Solution comes up 12 times in 36, whatever is left of the deck (Solutions
 * never run out); otherwise the card comes from the remaining Event/Problem deck.
 */
export function drawChanceCardId(deck: readonly string[]): string {
  if (deck.length === 0 || randomIndex(36) < SOLUTION_IDS.length) return SOLUTION_IDS[randomIndex(SOLUTION_IDS.length)]
  return deck[randomIndex(deck.length)]
}
