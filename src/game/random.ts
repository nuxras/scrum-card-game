import { CHANCE_DECK } from './data'
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

/** One card from the combined Event + Problem + Solution deck, with replacement. */
export function drawChanceCardId(): string {
  return CHANCE_DECK[randomIndex(CHANCE_DECK.length)].id
}
