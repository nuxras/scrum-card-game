import type { GameState } from './types'

const KEY = 'scrum-card-game-simulator:v1'

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    if (parsed?.version !== 1 || !Array.isArray(parsed.stories) || parsed.stories.length !== 12) return null
    return parsed
  } catch {
    return null
  }
}

export function saveGame(state: GameState) {
  try {
    if (state.phase === 'setup') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: the game still works, it just won't survive a refresh.
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
