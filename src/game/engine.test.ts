import { describe, expect, it } from 'vitest'
import { CHANCE_DECK, STORIES } from './data'
import { createInitialState, findStory, gameReducer, suggestStory, validateTeam } from './engine'
import { drawChanceCardId, rollTwoDice } from './random'
import type { Action, Dice, GameState } from './types'

function run(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce(gameReducer, state)
}

/** A team in sprint 1, day 1, with every story committed. */
function started(names = ['Ani', 'Budi'], committed = STORIES.map((s) => s.id)): GameState {
  return run(
    createInitialState(),
    { type: 'setupTeam', teamName: 'Tim Uji', names },
    { type: 'commitPlan', storyIds: committed },
  )
}

/** Plays one full turn: pick, roll, draw, then end the turn. */
function turn(state: GameState, storyId: number, dice: Dice, cardId: string, end = true): GameState {
  const s = run(
    state,
    { type: 'selectStory', storyId },
    { type: 'rollDice', dice },
    { type: 'drawCard', cardId },
  )
  return end ? gameReducer(s, { type: 'endTurn' }) : s
}

const NEUTRAL = 's-insight' // a Solution: never changes hours or turn order
const story = (s: GameState, id: number) => findStory(s, id)

describe('data', () => {
  it('has the official deck sizes', () => {
    expect(STORIES).toHaveLength(12)
    expect(CHANCE_DECK.filter((c) => c.kind === 'event')).toHaveLength(14)
    expect(CHANCE_DECK.filter((c) => c.kind === 'problem')).toHaveLength(10)
    expect(CHANCE_DECK.filter((c) => c.kind === 'solution')).toHaveLength(12)
    expect(STORIES.reduce((sum, s) => sum + s.estimate, 0)).toBe(364)
  })

  it('draws valid dice and cards', () => {
    for (let i = 0; i < 500; i++) {
      const [a, b] = rollTwoDice()
      expect(a).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(6)
      const id = drawChanceCardId()
      expect(CHANCE_DECK.some((c) => c.id === id)).toBe(true)
    }
  })
})

describe('setup and planning', () => {
  it('accepts 2–6 unique, non-empty names', () => {
    expect(validateTeam(['A']).ok).toBe(false)
    expect(validateTeam(['A', 'B', 'C', 'D', 'E', 'F', 'G']).ok).toBe(false)
    expect(validateTeam(['A', ' ']).ok).toBe(false)
    expect(validateTeam(['Ani', 'ani']).ok).toBe(false)
    expect(validateTeam(['Ani', 'Budi']).ok).toBe(true)
  })

  it('moves committed stories to TODO and records the Plan', () => {
    const s = started(['Ani', 'Budi'], [1, 2, 5])
    expect(s.phase).toBe('playing')
    expect(story(s, 1).column).toBe('todo')
    expect(story(s, 3).column).toBe('backlog')
    expect(s.sprints[0]).toMatchObject({ plannedIds: [1, 2, 5], plannedEstimate: 24 + 21 + 16 })
    expect(s.turn?.memberId).toBe('m1')
  })

  it('refuses an empty plan', () => {
    const s = run(createInitialState(), { type: 'setupTeam', teamName: '', names: ['A', 'B'] })
    expect(gameReducer(s, { type: 'commitPlan', storyIds: [] })).toBe(s)
  })

  it('suggests the lowest committed story that still has hours', () => {
    const s = started(['Ani', 'Budi'], [3, 5])
    expect(suggestStory(s)).toBe(3)
  })
})

describe('a turn', () => {
  it('subtracts the dice total and floors at 0', () => {
    let s = turn(started(), 5, [6, 5], NEUTRAL)
    expect(story(s, 5).remaining).toBe(5)
    expect(story(s, 5).column).toBe('inprogress')
    s = turn(s, 5, [6, 6], NEUTRAL)
    expect(story(s, 5).remaining).toBe(0)
    expect(story(s, 5).column).toBe('done')
  })

  it('judges DONE only at the end of the turn', () => {
    // Dice take #5 to 0, then Extra Cost adds 6 back before the turn ends.
    let s = turn(started(), 5, [6, 6], NEUTRAL) // 16 → 4
    s = turn(s, 5, [2, 2], 'e-extra-cost', false)
    expect(story(s, 5).trail).toEqual([4, 0, 6])
    expect(story(s, 5).remaining).toBe(6)
    const ended = gameReducer(s, { type: 'endTurn' })
    expect(story(ended, 5).column).toBe('inprogress')
  })

  it('logs every turn with its dice, card and result', () => {
    const s = turn(started(), 1, [3, 4], 'e-doing-well')
    expect(s.log[0]).toMatchObject({
      sprint: 1,
      day: 1,
      order: 1,
      member: 'Ani',
      storyId: 1,
      dice: '3 + 4 = 7',
      remaining: 24 - 7 - 4,
      status: 'IN PROGRESS',
    })
  })
})

describe('Problems and Solutions', () => {
  it('a Problem blocks DONE even at 0 hours, but work continues', () => {
    let s = turn(started(), 5, [2, 2], 'p-bad-quality')
    expect(story(s, 5).problems).toHaveLength(1)
    s = turn(s, 5, [6, 6], NEUTRAL)
    expect(story(s, 5).remaining).toBe(0)
    expect(story(s, 5).column).toBe('inprogress')
    expect(s.log.at(-1)?.status).toBe('IN PROGRESS (BLOCKED)')
  })

  it('a Solution is kept when unused and can close a Problem on any story later', () => {
    let s = turn(started(), 5, [6, 6], 's-pair-programming') // #5 → 4 hours, Solution kept
    expect(s.solutions).toHaveLength(1)
    s = turn(s, 5, [2, 2], 'p-unclear-spec') // #5 → 0 hours but blocked
    expect(story(s, 5).column).toBe('inprogress')
    const problemUid = story(s, 5).problems[0].uid
    s = gameReducer(s, { type: 'useSolution', solutionUid: s.solutions[0].uid, problemUid })
    expect(s.solutions).toHaveLength(0)
    expect(story(s, 5).problems).toHaveLength(0)
    expect(story(s, 5).column).toBe('done')
    expect(s.sprints[0].doneIds).toContain(5)
    expect(s.log.at(-1)).toMatchObject({ kind: 'solution', member: 'Tim', status: 'DONE' })
  })

  it('Solutions stack in the team pocket', () => {
    let s = turn(started(), 1, [1, 1], 's-specialist')
    s = turn(s, 1, [1, 1], 's-insight')
    expect(s.solutions.map((x) => x.cardId)).toEqual(['s-specialist', 's-insight'])
  })
})

describe('Event cards', () => {
  it('Extra Cost adds 6 and Requirements Change adds 4 to the current remaining hours', () => {
    let s = turn(started(), 1, [2, 3], 'e-extra-cost')
    expect(story(s, 1).remaining).toBe(24 - 5 + 6)
    expect(story(s, 1).estimate).toBe(24)
    s = turn(s, 1, [1, 1], 'e-requirements-change')
    expect(story(s, 1).remaining).toBe(25 - 2 + 4)
  })

  it('Hard Drive Crashed resets to the original estimate, even after Extra Cost', () => {
    let s = turn(started(), 1, [6, 6], 'e-extra-cost') // 24 − 12 + 6 = 18
    s = turn(s, 1, [5, 5], 'e-hard-drive-crashed')
    expect(story(s, 1).remaining).toBe(24)
  })

  it('Doing Well, Home Work add to the roll and floor at 0', () => {
    let s = turn(started(), 1, [1, 1], 'e-doing-well')
    expect(story(s, 1).remaining).toBe(24 - 2 - 4)
    s = turn(s, 1, [1, 1], 'e-home-work')
    expect(story(s, 1).remaining).toBe(18 - 2 - 2)
    s = turn(s, 5, [6, 6], 'e-doing-well')
    expect(story(s, 5).remaining).toBe(0)
  })

  it('Fairy finishes the hours but does not clear Problems', () => {
    let s = turn(started(), 1, [1, 1], 'p-poor-skills')
    s = turn(s, 1, [1, 1], 'e-fairy')
    expect(story(s, 1).remaining).toBe(0)
    expect(story(s, 1).column).toBe('inprogress')
  })

  it('Visible Effort asks first', () => {
    let s = turn(started(), 1, [1, 1], 'e-visible-effort', false)
    expect(s.turn?.stage).toBe('decide')
    expect(gameReducer(s, { type: 'endTurn' })).toBe(s)
    s = gameReducer(s, { type: 'resolveDecision', accept: true })
    expect(story(s, 1).remaining).toBe(24 - 2 - 3)
    let d = turn(started(), 1, [1, 1], 'e-visible-effort', false)
    d = gameReducer(d, { type: 'resolveDecision', accept: false })
    expect(story(d, 1).remaining).toBe(22)
  })

  it('Good Recruit rolls two more dice on Ya', () => {
    let s = turn(started(), 1, [1, 1], 'e-good-recruit', false)
    s = gameReducer(s, { type: 'resolveDecision', accept: true, dice: [4, 5] })
    expect(story(s, 1).remaining).toBe(24 - 2 - 9)
    s = gameReducer(s, { type: 'endTurn' })
    expect(s.log[0].dice).toBe('1 + 1 = 2; Good Recruit 4 + 5 = 9')
  })

  it('Guru removes a chosen Problem from the current story', () => {
    let s = turn(started(), 1, [1, 1], 'p-bad-mood')
    s = turn(s, 1, [1, 1], 'p-bad-quality')
    s = turn(s, 1, [1, 1], 'e-guru', false)
    expect(s.turn?.pending).toBe('guru')
    const target = story(s, 1).problems[1]
    s = gameReducer(s, { type: 'resolveDecision', accept: true, problemUid: target.uid })
    expect(story(s, 1).problems.map((p) => p.cardId)).toEqual(['p-bad-mood'])
  })

  it('Guru without a Problem on the story has no effect', () => {
    const s = turn(started(), 1, [1, 1], 'e-guru', false)
    expect(s.turn?.stage).toBe('done')
  })

  it('Overtime draws another card and applies it', () => {
    let s = turn(started(), 1, [1, 1], 'e-overtime', false)
    expect(s.turn?.stage).toBe('draw')
    s = run(s, { type: 'drawCard', cardId: 'e-extra-cost' }, { type: 'endTurn' })
    expect(story(s, 1).remaining).toBe(24 - 2 + 6)
    expect(s.log[0].cards).toBe('Overtime (Event) → Extra Cost (Event)')
  })

  it('Birthday gives everyone −1 on their next roll, once, without stacking', () => {
    let s = turn(started(), 1, [3, 3], 'e-birthday') // Ani
    s = turn(s, 2, [3, 3], 'e-birthday') // Budi: 6 − 1, then Birthday again
    expect(story(s, 2).remaining).toBe(21 - 5)
    s = turn(s, 1, [3, 3], NEUTRAL) // Ani: 6 − 1 (not −2)
    expect(story(s, 1).remaining).toBe(24 - 6 - 5)
    s = turn(s, 2, [3, 3], NEUTRAL) // Budi's second Birthday refreshed the −1
    expect(story(s, 2).remaining).toBe(16 - 5)
    s = turn(s, 1, [3, 3], NEUTRAL) // penalty used up
    expect(story(s, 1).remaining).toBe(13 - 6)
  })

  it('Health Problem skips that member’s next turn, and the skip counts as their turn', () => {
    let s = turn(started(['Ani', 'Budi', 'Citra']), 1, [1, 1], 'e-health-problem') // Ani, day 1
    s = turn(s, 1, [1, 1], NEUTRAL) // Budi
    s = turn(s, 1, [1, 1], NEUTRAL) // Citra → day 2, Ani skipped
    expect(s.day).toBe(2)
    expect(s.turn?.memberId).toBe('m2')
    expect(s.log.at(-1)).toMatchObject({ kind: 'skip', member: 'Ani', status: 'DILEWATI', day: 2 })
    expect(s.skipNotices).toHaveLength(1)
  })

  it('shows the end-of-day note only during the first turn of the new day', () => {
    let s = started()
    s = turn(s, 1, [1, 1], NEUTRAL)
    s = turn(s, 1, [1, 1], NEUTRAL) // day 1 ends
    expect(s.dayNote).toMatchObject({ sprint: 1, day: 1 })
    s = turn(s, 1, [1, 1], NEUTRAL)
    expect(s.dayNote).toBeNull()
  })

  it('Emergency Call makes every member skip their next turn, across days', () => {
    let s = turn(started(['Ani', 'Budi', 'Citra']), 1, [1, 1], NEUTRAL) // Ani
    s = turn(s, 1, [1, 1], 'e-emergency-call') // Budi
    // Citra (day 1), Ani and Budi (day 2) are skipped; Citra plays on day 2.
    expect(s.day).toBe(2)
    expect(s.turn?.memberId).toBe('m3')
    expect(s.log.filter((e) => e.kind === 'skip').map((e) => `${e.member}@${e.day}`)).toEqual([
      'Citra@1',
      'Ani@2',
      'Budi@2',
    ])
  })
})

describe('report columns (lecturer log format)', () => {
  const lastTurn = (s: GameState) => s.log.filter((e) => e.kind === 'turn').at(-1)!

  it('plain turn: Jam Efektif = dice, Penyesuaian = Tersisa − Efektif', () => {
    const s = turn(started(), 1, [3, 4], NEUTRAL)
    expect(lastTurn(s)).toMatchObject({ dice1: 3, dice2: 4, diceTotal: 7, effective: 7, before: 24, afterWork: 17, remaining: 17, adjust: '' })
  })

  it('floors Penyesuaian at 0', () => {
    let s = turn(started(), 5, [6, 5], NEUTRAL) // 16 → 5
    s = turn(s, 5, [6, 6], NEUTRAL)
    expect(lastTurn(s)).toMatchObject({ before: 5, effective: 12, afterWork: 0, remaining: 0 })
  })

  it('Birthday and roll bonuses change Jam Efektif, not the dice total', () => {
    let s = turn(started(), 1, [1, 1], 'e-birthday') // everyone −1 next roll
    s = turn(s, 2, [3, 3], 'e-doing-well') // Budi: 6 − 1 + 4 = 9
    expect(lastTurn(s)).toMatchObject({ diceTotal: 6, effective: 9, before: 21, afterWork: 12, remaining: 12 })
    let v = turn(started(), 1, [2, 2], 'e-visible-effort', false)
    v = run(v, { type: 'resolveDecision', accept: true }, { type: 'endTurn' })
    expect(lastTurn(v)).toMatchObject({ effective: 7, afterWork: 17 })
    let g = turn(started(), 1, [2, 2], 'e-good-recruit', false)
    g = run(g, { type: 'resolveDecision', accept: true, dice: [5, 6] }, { type: 'endTurn' })
    expect(lastTurn(g)).toMatchObject({ diceTotal: 4, effective: 15, afterWork: 9, remaining: 9 })
  })

  it('card changes to the story go in their own column, with the full trail', () => {
    const s = turn(started(), 1, [2, 3], 'e-extra-cost')
    expect(lastTurn(s)).toMatchObject({ before: 24, effective: 5, afterWork: 19, adjust: '+6 (Extra Cost)', remaining: 25, trail: [24, 19, 25] })
    const h = turn(turn(started(), 1, [6, 6], NEUTRAL), 1, [1, 1], 'e-hard-drive-crashed')
    expect(lastTurn(h)).toMatchObject({ before: 12, afterWork: 10, remaining: 24 })
    expect(lastTurn(h).adjust).toContain('Hard Drive Crashed')
  })

  it('skip rows carry zeros and the reason; Solution rows carry the pocket count', () => {
    let s = turn(started(), 1, [1, 1], 'e-health-problem') // Ani
    s = turn(s, 1, [1, 1], 's-insight') // Budi → day 2, Ani skipped
    expect(s.log.find((e) => e.kind === 'skip')).toMatchObject({ diceTotal: 0, effective: 0, skipReason: 'Health Problem' })
    expect(lastTurn(s).pocketAfter).toBe(1)
    s = turn(s, 1, [1, 1], 'p-bad-mood')
    const problemUid = findStory(s, 1).problems[0].uid
    s = gameReducer(s, { type: 'useSolution', solutionUid: s.solutions[0].uid, problemUid })
    expect(s.log.at(-1)).toMatchObject({ kind: 'solution', before: 18, remaining: 18, pocketAfter: 0, problemsAfter: '' })
  })
})

describe('progression', () => {
  it('advances days and sprints by itself and stops for review after day 3', () => {
    let s = started()
    for (let i = 0; i < 5; i++) s = turn(s, 10, [1, 1], NEUTRAL)
    expect(s).toMatchObject({ phase: 'playing', sprint: 1, day: 3 })
    s = turn(s, 10, [1, 1], NEUTRAL)
    expect(s.phase).toBe('review')
    s = gameReducer(s, { type: 'startNextSprint' })
    expect(s).toMatchObject({ phase: 'planning', sprint: 2, day: 1 })
    expect(story(s, 10).remaining).toBe(68 - 12)
  })

  it('carries progress between sprints and keeps started work in progress', () => {
    let s = started(['Ani', 'Budi'], [10])
    for (let i = 0; i < 6; i++) s = turn(s, 10, [1, 1], NEUTRAL)
    s = run(s, { type: 'startNextSprint' }, { type: 'commitPlan', storyIds: [10, 1] })
    expect(story(s, 10)).toMatchObject({ column: 'inprogress', remaining: 56 })
    expect(story(s, 1).column).toBe('todo')
  })

  it('ends with time-up after sprint 3', () => {
    let s = started()
    for (let sprint = 1; sprint <= 3; sprint++) {
      if (sprint > 1) s = run(s, { type: 'startNextSprint' }, { type: 'commitPlan', storyIds: [10] })
      for (let i = 0; i < 6; i++) s = turn(s, 10, [1, 1], NEUTRAL)
    }
    expect(s.phase).toBe('finished')
    expect(s.endReason).toBe('time-up')
    expect(gameReducer(s, { type: 'startNextSprint' })).toBe(s)
  })

  it('ends with all-done as soon as all 12 stories are DONE', () => {
    // Six members play 12 turns inside sprint 1.
    let s = started(['A', 'B', 'C', 'D', 'E', 'F'])
    for (let i = 0; i < 12; i++) {
      s = turn(s, STORIES[i].id, [6, 6], 'e-fairy')
    }
    expect(s.phase).toBe('finished')
    expect(s.endReason).toBe('all-done')
    expect(s.stories.every((x) => x.column === 'done')).toBe(true)
  })

  it('pulling a Backlog story mid-sprint is allowed and noted', () => {
    let s = started(['Ani', 'Budi'], [1])
    s = turn(s, 7, [1, 1], NEUTRAL)
    expect(story(s, 7).column).toBe('inprogress')
    expect(s.log[0].effect).toContain('ditarik dari Backlog')
  })
})
