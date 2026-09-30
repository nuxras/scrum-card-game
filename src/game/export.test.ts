import { describe, expect, it } from 'vitest'
import writeExcelFile from 'write-excel-file/node'
import { createInitialState, findStory, gameReducer } from './engine'
import { workbookSheets } from './export'
import type { Action, Dice, GameState } from './types'

const run = (s: GameState, ...actions: Action[]) => actions.reduce(gameReducer, s)

function turn(s: GameState, storyId: number, dice: Dice, cardId: string, solve = false): GameState {
  s = run(s, { type: 'selectStory', storyId }, { type: 'rollDice', dice }, { type: 'drawCard', cardId })
  if (solve && s.solutions.length) {
    const problem = findStory(s, storyId).problems.at(-1)
    if (problem) s = gameReducer(s, { type: 'useSolution', solutionUid: s.solutions[0].uid, problemUid: problem.uid })
  }
  return gameReducer(s, { type: 'endTurn' })
}

/** Sprint 1 of a 2-member team: #5 DONE, #1 blocked, one skip, one Solution used. */
function sprintOne(): GameState {
  let s = run(
    createInitialState(),
    { type: 'setupTeam', teamName: 'Kelompok Uji', names: ['Nugraha', 'Pio'] },
    { type: 'commitPlan', storyIds: [1, 5] },
  )
  s = turn(s, 5, [6, 6], 's-insight') // Nugraha: #5 16 → 4
  s = turn(s, 5, [2, 2], 'p-bad-quality', true) // Pio: #5 → 0, Bad Quality closed by Insight → DONE
  s = turn(s, 1, [3, 3], 'e-health-problem') // Nugraha skips day 3
  s = turn(s, 1, [4, 4], 'e-extra-cost') // Pio: #1 18 → 10 → 16
  s = turn(s, 1, [1, 1], 'p-unclear-spec') // day 3: Nugraha skipped, Pio → #1 14, blocked
  return s
}

const text = (rows: unknown[][]) =>
  rows.map((r) => r.map((c) => (c && typeof c === 'object' && 'value' in c ? String((c as { value: unknown }).value) : '')).join(' | ')).join('\n')

describe('report workbook', () => {
  it('adds Sprint Review & Retro and Identitas Kelompok sheets after the lecturer log', () => {
    const s = sprintOne()
    expect(s.phase).toBe('review')
    const names = workbookSheets(s).map((x) => x.sheet)
    expect(names.slice(0, 3)).toEqual(['Log Giliran', 'Sprint Review & Retro', 'Identitas Kelompok'])
  })

  it('fills the review facts from the log and leaves the team boxes empty', () => {
    const sheet = workbookSheets(sprintOne()).find((x) => x.sheet === 'Sprint Review & Retro')!
    const t = text(sheet.data as unknown[][])
    expect(t).toContain('SPRINT 1')
    expect(t).toContain('Plan (commitment) | 2 cerita (#1, #5) · 40 jam estimasi')
    expect(t).toContain('Actual (DONE) | 1 cerita (#5) · 16 jam estimasi')
    expect(t).toContain('Selisih Actual − Plan | -1 cerita · -24 jam estimasi')
    expect(t).toContain('#1 (sisa 14 jam, diblokir Unclear Spec)')
    expect(t).toContain('Problem yang muncul | Bad Quality, Unclear Spec')
    expect(t).toContain('Solution yang dipakai | Insight → Bad Quality (#5)')
    expect(t).toContain('Giliran dilewati | Nugraha (Hari 3, Health Problem)')
    expect(t).toContain('Pio: +6 (Extra Cost) di #1')
    expect(t).toContain('Apa yang berjalan baik? (diisi kelompok) | ')
    expect(t).toContain('SPRINT RETROSPECTIVE')
  })

  it('lists members with empty full-name and NIM boxes', () => {
    const sheet = workbookSheets(sprintOne()).find((x) => x.sheet === 'Identitas Kelompok')!
    const t = text(sheet.data as unknown[][])
    expect(t).toContain('Kelompok | Kelompok Uji')
    expect(t).toContain('Urutan Giliran | Nickname (di log) | Nama Lengkap | NIM')
    expect(t).toContain('1 | Nugraha |  | ')
    expect(t).toContain('2 | Pio |  | ')
  })

  it('writes a valid .xlsx file', async () => {
    const buffer = await writeExcelFile(workbookSheets(sprintOne())).toBuffer()
    expect(buffer.subarray(0, 2).toString()).toBe('PK')
  })
})
