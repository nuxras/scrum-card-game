import {
  DAYS_PER_SPRINT,
  KIND_LABEL,
  MAX_MEMBERS,
  MAX_SPRINTS,
  MIN_MEMBERS,
  STORIES,
  getCard,
  getStoryCard,
} from './data'
import type {
  Action,
  ActiveProblem,
  Dice,
  GameState,
  LogEntry,
  Member,
  StoryState,
  TurnDraft,
} from './types'

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export function createInitialState(): GameState {
  return {
    version: 1,
    phase: 'setup',
    teamName: '',
    members: [],
    stories: STORIES.map((card) => ({
      id: card.id,
      estimate: card.estimate,
      remaining: card.estimate,
      column: 'backlog',
      problems: [],
      workers: [],
      plannedIn: [],
      doneSprint: null,
      doneDay: null,
      trail: [],
      trailTurn: 0,
    })),
    solutions: [],
    sprint: 1,
    day: 1,
    turnIndex: 0,
    skipNext: {},
    birthday: {},
    turn: null,
    turnSeq: 0,
    log: [],
    sprints: [],
    endReason: null,
    dayNote: null,
    skipNotices: [],
    uid: 0,
  }
}

export interface TeamValidation {
  ok: boolean
  errors: string[]
}

/** Checks member names before a game starts. Error copy is shown to players. */
export function validateTeam(names: string[]): TeamValidation {
  const trimmed = names.map((n) => n.trim())
  const errors: string[] = []
  if (trimmed.length < MIN_MEMBERS) errors.push(`Minimal ${MIN_MEMBERS} anggota.`)
  if (trimmed.length > MAX_MEMBERS) errors.push(`Maksimal ${MAX_MEMBERS} anggota.`)
  if (trimmed.some((n) => n.length === 0)) errors.push('Semua baris anggota harus diisi nama.')
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const n of trimmed) {
    const key = n.toLocaleLowerCase('id')
    if (!key) continue
    if (seen.has(key)) dupes.add(n)
    seen.add(key)
  }
  if (dupes.size > 0) errors.push(`Nama harus beda supaya log tidak tertukar: ${[...dupes].join(', ')}.`)
  return { ok: errors.length === 0, errors }
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function findStory(state: GameState, id: number): StoryState {
  const story = state.stories.find((s) => s.id === id)
  if (!story) throw new Error(`Unknown story ${id}`)
  return story
}

export function memberName(state: GameState, memberId: string): string {
  return state.members.find((m) => m.id === memberId)?.name ?? '?'
}

export function isDoneReady(story: StoryState): boolean {
  return story.column !== 'done' && story.remaining === 0 && story.problems.length === 0
}

export type StoryStatus = 'done' | 'blocked' | 'inprogress' | 'todo' | 'backlog'

export function storyStatus(story: StoryState): StoryStatus {
  if (story.column === 'done') return 'done'
  if (story.problems.length > 0 && story.column === 'inprogress') return 'blocked'
  return story.column
}

export function statusLabel(story: StoryState): string {
  if (story.column === 'done') return 'DONE'
  const blocked = story.problems.length > 0
  const base = story.column === 'inprogress' ? 'IN PROGRESS' : story.column === 'todo' ? 'TODO' : 'BACKLOG'
  return blocked ? `${base} (BLOCKED)` : base
}

/** Day number across the whole game, 1–9. */
export function absoluteDay(state: Pick<GameState, 'sprint' | 'day'>): number {
  return (state.sprint - 1) * DAYS_PER_SPRINT + state.day
}

export function activeProblems(state: GameState): { story: StoryState; problem: ActiveProblem }[] {
  return state.stories.flatMap((story) => story.problems.map((problem) => ({ story, problem })))
}

/** Average team output per sprint: members × days × 7 (mean of two dice). */
export function sprintCapacity(memberCount: number): number {
  return memberCount * DAYS_PER_SPRINT * 7
}

export function currentSprintRecord(state: GameState) {
  return state.sprints.find((r) => r.sprint === state.sprint) ?? null
}

export function sumEstimates(ids: number[]): number {
  return ids.reduce((sum, id) => sum + getStoryCard(id).estimate, 0)
}

/**
 * Suggested story for the active turn: the lowest-numbered story committed to this
 * sprint that still has hours to burn; then the lowest Backlog story with hours;
 * then any unfinished story (e.g. one waiting only on a Solution).
 */
export function suggestStory(state: GameState): number | null {
  const open = state.stories.filter((s) => s.column !== 'done')
  const committed = open.filter((s) => s.column === 'todo' || s.column === 'inprogress')
  const pick =
    committed.find((s) => s.remaining > 0) ??
    open.find((s) => s.column === 'backlog' && s.remaining > 0) ??
    committed[0] ??
    open[0]
  return pick?.id ?? null
}

export function isFinishedAllDone(state: GameState): boolean {
  return state.stories.every((s) => s.column === 'done')
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'load':
      return action.state
    case 'reset':
      return createInitialState()
    case 'setupTeam':
      return setupTeam(state, action.teamName, action.names)
    case 'commitPlan':
      return commitPlan(state, action.storyIds)
    case 'selectStory':
      return selectStory(state, action.storyId)
    case 'rollDice':
      return rollDice(state, action.dice)
    case 'drawCard':
      return drawCard(state, action.cardId)
    case 'resolveDecision':
      return resolveDecision(state, action.accept, action.dice, action.problemUid)
    case 'useSolution':
      return applySolution(state, action.solutionUid, action.problemUid)
    case 'endTurn':
      return endTurn(state)
    case 'startNextSprint':
      return startNextSprint(state)
    case 'dismissDayNote':
      return state.dayNote ? { ...state, dayNote: null } : state
    case 'dismissSkipNotices':
      return state.skipNotices.length ? { ...state, skipNotices: [] } : state
  }
}

function clone(state: GameState): GameState {
  return structuredClone(state)
}

function nextUid(s: GameState, prefix: string): string {
  s.uid += 1
  return `${prefix}${s.uid}`
}

function isDie(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 6
}

function validDice(dice: Dice | undefined): dice is Dice {
  return Array.isArray(dice) && dice.length === 2 && isDie(dice[0]) && isDie(dice[1])
}

function setupTeam(state: GameState, teamName: string, names: string[]): GameState {
  if (state.phase !== 'setup' || !validateTeam(names).ok) return state
  const s = createInitialState()
  s.teamName = teamName.trim()
  s.members = names.map((name, i): Member => ({ id: `m${i + 1}`, name: name.trim() }))
  s.phase = 'planning'
  return s
}

function commitPlan(state: GameState, storyIds: number[]): GameState {
  if (state.phase !== 'planning') return state
  const ids = [...new Set(storyIds)]
  const open = new Set(state.stories.filter((st) => st.column !== 'done').map((st) => st.id))
  if (ids.length === 0 || ids.some((id) => !open.has(id))) return state

  const s = clone(state)
  let plannedRemaining = 0
  for (const story of s.stories) {
    if (story.column === 'done') continue
    if (ids.includes(story.id)) {
      // Work already started keeps its place in progress; untouched stories wait in TODO.
      story.column = story.remaining < story.estimate || story.workers.length > 0 ? 'inprogress' : 'todo'
      story.plannedIn.push(s.sprint)
      plannedRemaining += story.remaining
    } else {
      story.column = 'backlog'
    }
  }
  s.sprints.push({
    sprint: s.sprint,
    plannedIds: [...ids].sort((a, b) => a - b),
    plannedEstimate: sumEstimates(ids),
    plannedRemaining,
    doneIds: [],
  })
  s.phase = 'playing'
  s.day = 1
  s.turnIndex = 0
  s.dayNote = null
  beginTurn(s)
  return s
}

function selectStory(state: GameState, storyId: number): GameState {
  const turn = state.turn
  if (state.phase !== 'playing' || !turn || (turn.stage !== 'pick' && turn.stage !== 'roll')) return state
  const story = state.stories.find((st) => st.id === storyId)
  if (!story || story.column === 'done') return state
  const s = clone(state)
  s.turn!.storyId = storyId
  s.turn!.stage = 'roll'
  return s
}

function rollDice(state: GameState, dice: Dice): GameState {
  const turn = state.turn
  if (state.phase !== 'playing' || !turn || turn.stage !== 'roll' || turn.storyId == null) return state
  if (!validDice(dice)) return state
  const s = clone(state)
  const t = s.turn!
  const story = findStory(s, t.storyId!)
  const base = dice[0] + dice[1]
  const penalty = s.birthday[t.memberId] ? 1 : 0
  delete s.birthday[t.memberId]
  const result = Math.max(0, base - penalty)
  t.roll = { dice, base, penalty, result }
  t.before = story.remaining

  if (story.column === 'backlog') {
    t.unplanned = true
    t.notes.push(`#${story.id} ditarik dari Backlog (di luar Plan sprint ini)`)
  }
  story.column = 'inprogress'
  story.workers = [...story.workers.filter((id) => id !== t.memberId), t.memberId]
  changeRemaining(s, story, story.remaining - result)
  t.stage = 'draw'
  return s
}

function drawCard(state: GameState, cardId: string): GameState {
  const turn = state.turn
  if (state.phase !== 'playing' || !turn || turn.stage !== 'draw') return state
  let card
  try {
    card = getCard(cardId)
  } catch {
    return state
  }
  const s = clone(state)
  const t = s.turn!
  const story = findStory(s, t.storyId!)
  t.cards.push(card.id)
  t.stage = 'done'

  if (card.kind === 'problem') {
    story.problems.push({ uid: nextUid(s, 'p'), cardId: card.id, sprint: s.sprint, day: s.day })
    t.notes.push(`Problem "${card.name}" menempel di #${story.id}; cerita diblokir sampai ditutup Solution`)
    return s
  }
  if (card.kind === 'solution') {
    s.solutions.push({ uid: nextUid(s, 's'), cardId: card.id, sprint: s.sprint, day: s.day })
    t.notes.push(`Solution "${card.name}" disimpan di Kantong Solusi tim`)
    return s
  }

  switch (card.effect) {
    case 'skipSelf':
      s.skipNext[t.memberId] = card.name
      t.notes.push(`${memberName(s, t.memberId)} melewatkan giliran berikutnya (${card.name})`)
      break
    case 'goodRecruit':
    case 'visibleEffort':
      t.pending = card.effect
      t.stage = 'decide'
      break
    case 'guru':
      if (story.problems.length > 0) {
        t.pending = 'guru'
        t.stage = 'decide'
      } else {
        t.notes.push(`Guru: tidak ada Problem di #${story.id}, tidak ada efek`)
      }
      break
    case 'doingWell':
      t.bonus = (t.bonus ?? 0) + 4
      changeRemaining(s, story, story.remaining - 4)
      t.notes.push(`Doing Well: +4 ke hasil dadu, jam #${story.id} −4`)
      break
    case 'homeWork':
      t.bonus = (t.bonus ?? 0) + 2
      changeRemaining(s, story, story.remaining - 2)
      t.notes.push(`Home Work: +2 ke hasil dadu, jam #${story.id} −2`)
      break
    case 'birthday':
      for (const m of s.members) s.birthday[m.id] = true
      t.notes.push('Birthday: hasil dadu berikutnya semua anggota −1')
      break
    case 'fairy':
      addAdjust(t, 'jadi 0 (Fairy)')
      changeRemaining(s, story, 0)
      t.notes.push(
        story.problems.length > 0
          ? `Fairy: jam #${story.id} jadi 0, tapi masih diblokir Problem`
          : `Fairy: jam #${story.id} langsung jadi 0`,
      )
      break
    case 'overtime':
      t.stage = 'draw'
      t.notes.push('Overtime: ambil 1 kartu lagi')
      break
    case 'requirementsChange':
      addAdjust(t, '+4 (Requirements Change)')
      changeRemaining(s, story, story.remaining + 4)
      t.notes.push(`Requirements Change: sisa jam #${story.id} +4`)
      break
    case 'emergencyCall':
      for (const m of s.members) s.skipNext[m.id] = card.name
      t.notes.push('Emergency Call: semua anggota melewatkan giliran berikutnya')
      break
    case 'hardDriveCrashed':
      addAdjust(t, `reset ke estimasi awal ${story.estimate} (Hard Drive Crashed)`)
      changeRemaining(s, story, story.estimate)
      t.notes.push(`Hard Drive Crashed: progres #${story.id} hilang, sisa jam kembali ke estimasi awal (${story.estimate})`)
      break
    case 'extraCost':
      addAdjust(t, '+6 (Extra Cost)')
      changeRemaining(s, story, story.remaining + 6)
      t.notes.push(`Extra Cost: sisa jam #${story.id} +6`)
      break
  }
  return s
}

function resolveDecision(state: GameState, accept: boolean, dice?: Dice, problemUid?: string): GameState {
  const turn = state.turn
  if (state.phase !== 'playing' || !turn || turn.stage !== 'decide' || !turn.pending) return state
  const s = clone(state)
  const t = s.turn!
  const story = findStory(s, t.storyId!)

  switch (t.pending) {
    case 'goodRecruit':
      if (accept) {
        if (!validDice(dice)) return state
        const extra = dice[0] + dice[1]
        t.extraDice = dice
        t.bonus = (t.bonus ?? 0) + extra
        changeRemaining(s, story, story.remaining - extra)
        t.notes.push(`Good Recruit: lempar lagi ${dice[0]} + ${dice[1]} = ${extra}, jam #${story.id} −${extra}`)
      } else {
        t.notes.push('Good Recruit: tidak dipakai')
      }
      break
    case 'visibleEffort':
      if (accept) {
        t.bonus = (t.bonus ?? 0) + 3
        changeRemaining(s, story, story.remaining - 3)
        t.notes.push(`Visible Effort: +3 ke hasil dadu, jam #${story.id} −3`)
      } else {
        t.notes.push('Visible Effort: tidak dipakai')
      }
      break
    case 'guru':
      if (accept) {
        const idx = story.problems.findIndex((p) => p.uid === problemUid)
        if (idx < 0) return state
        const [removed] = story.problems.splice(idx, 1)
        t.notes.push(`Guru: Problem "${getCard(removed.cardId).name}" dihapus dari #${story.id}`)
      } else {
        t.notes.push('Guru: tidak dipakai')
      }
      break
  }
  t.pending = null
  t.stage = 'done'
  return s
}

function applySolution(state: GameState, solutionUid: string, problemUid: string): GameState {
  if (state.phase !== 'playing') return state
  const solution = state.solutions.find((x) => x.uid === solutionUid)
  const target = activeProblems(state).find(({ problem }) => problem.uid === problemUid)
  if (!solution || !target) return state

  const s = clone(state)
  const t = s.turn
  // Used after this turn's card: the turn's row is written first, as it stood, and
  // the Solution row follows it, so the log reads in the order things happened.
  const afterCard = t != null && t.stage === 'done'
  if (afterCard && !t.snapshot) t.snapshot = buildTurnEntry(s, t)

  const story = findStory(s, target.story.id)
  s.solutions = s.solutions.filter((x) => x.uid !== solutionUid)
  story.problems = story.problems.filter((p) => p.uid !== problemUid)

  // A story mid-turn (dice already rolled) is judged at the end of that turn: the
  // Chance card still to come can change its hours.
  const deferred = t != null && t.storyId === story.id && (t.stage === 'draw' || t.stage === 'decide')
  if (!deferred) settleDone(s, story)
  if (t && t.stage === 'roll' && t.storyId === story.id && story.column === 'done') {
    t.storyId = null
    t.stage = 'pick'
  }

  const solutionCard = getCard(solution.cardId)
  const problemCard = getCard(target.problem.cardId)
  const entry: PendingLog = {
    kind: 'solution',
    order: null,
    member: 'Tim',
    storyId: story.id,
    dice: '—',
    cardIds: [solution.cardId, target.problem.cardId],
    cards: `${solutionCard.name} (Solution) → ${problemCard.name} (Problem)`,
    effect:
      story.column === 'done'
        ? `Problem ditutup; #${story.id} DONE`
        : `Problem ditutup di #${story.id}`,
    remaining: story.remaining,
    status: statusLabel(story),
    before: story.remaining,
    problemsAfter: problemNames(story),
    pocketAfter: s.solutions.length,
  }
  if (afterCard) t.afterLog = [...(t.afterLog ?? []), entry]
  else pushLog(s, entry)

  if (isFinishedAllDone(s) && (!t || t.stage === 'pick' || t.stage === 'roll')) {
    finish(s, 'all-done')
  }
  return s
}

function endTurn(state: GameState): GameState {
  const turn = state.turn
  if (state.phase !== 'playing' || !turn || turn.stage !== 'done') return state
  const s = clone(state)
  const t = s.turn!
  for (const story of s.stories) settleDone(s, story)
  pushLog(s, t.snapshot ?? buildTurnEntry(s, t))
  for (const entry of t.afterLog ?? []) pushLog(s, entry)

  s.turn = null
  s.skipNotices = []
  s.dayNote = null
  s.turnIndex += 1
  beginTurn(s)
  return s
}

type PendingLog = Omit<LogEntry, 'id' | 'sprint' | 'day'>

/** The log row for a turn whose card is resolved. A story ready for DONE is reported as DONE. */
function buildTurnEntry(s: GameState, t: TurnDraft): PendingLog {
  const story = findStory(s, t.storyId!)
  const roll = t.roll!
  const done = story.column === 'done' || isDoneReady(story)

  const diceParts = [
    roll.penalty
      ? `${roll.dice[0]} + ${roll.dice[1]} − 1 (Birthday) = ${roll.result}`
      : `${roll.dice[0]} + ${roll.dice[1]} = ${roll.result}`,
  ]
  if (t.extraDice) diceParts.push(`Good Recruit ${t.extraDice[0]} + ${t.extraDice[1]} = ${t.extraDice[0] + t.extraDice[1]}`)

  const notes = [...t.notes]
  if (done) notes.push(`#${story.id} DONE`)

  const before = t.before ?? story.remaining
  const effective = roll.result + (t.bonus ?? 0)
  return {
    kind: 'turn',
    order: t.order,
    member: memberName(s, t.memberId),
    storyId: story.id,
    dice: diceParts.join('; '),
    cardIds: [...t.cards],
    cards: t.cards.map((id) => `${getCard(id).name} (${KIND_LABEL[getCard(id).kind]})`).join(' → '),
    effect: notes.join('; '),
    remaining: story.remaining,
    status: done ? 'DONE' : statusLabel(story),
    dice1: roll.dice[0],
    dice2: roll.dice[1],
    diceTotal: roll.base,
    effective,
    before,
    afterWork: Math.max(0, before - effective),
    adjust: (t.adjust ?? []).join('; '),
    trail: story.trailTurn === t.seq ? [...story.trail] : [before, story.remaining],
    problemsAfter: problemNames(story),
    pocketAfter: s.solutions.length,
  }
}

function startNextSprint(state: GameState): GameState {
  if (state.phase !== 'review' || state.sprint >= MAX_SPRINTS) return state
  const s = clone(state)
  s.sprint += 1
  s.day = 1
  s.turnIndex = 0
  s.phase = 'planning'
  s.dayNote = null
  s.skipNotices = []
  return s
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function changeRemaining(s: GameState, story: StoryState, value: number) {
  const next = Math.max(0, value)
  const seq = s.turn?.seq ?? 0
  if (story.trailTurn !== seq || story.trail.length === 0) {
    story.trail = [story.remaining]
    story.trailTurn = seq
  }
  story.remaining = next
  story.trail.push(next)
}

function addAdjust(t: TurnDraft, text: string) {
  t.adjust = [...(t.adjust ?? []), text]
}

function problemNames(story: StoryState): string {
  return story.problems.map((p) => getCard(p.cardId).name).join(', ')
}

function settleDone(s: GameState, story: StoryState) {
  if (!isDoneReady(story)) return
  story.column = 'done'
  story.doneSprint = s.sprint
  story.doneDay = s.day
  const record = s.sprints.find((r) => r.sprint === s.sprint)
  if (record && !record.doneIds.includes(story.id)) record.doneIds.push(story.id)
}

function pushLog(s: GameState, entry: Omit<LogEntry, 'id' | 'sprint' | 'day'>) {
  s.log.push({ id: s.log.length + 1, sprint: s.sprint, day: s.day, ...entry })
}

function finish(s: GameState, reason: 'all-done' | 'time-up') {
  s.phase = 'finished'
  s.endReason = reason
  s.turn = null
}

/**
 * Starts the turn at s.turnIndex, applying skips and rolling over days and sprints.
 * Days advance by themselves once every member has had a turn.
 */
function beginTurn(s: GameState) {
  for (;;) {
    if (isFinishedAllDone(s)) {
      finish(s, 'all-done')
      return
    }
    if (s.turnIndex >= s.members.length) {
      s.dayNote = { sprint: s.sprint, day: s.day, problems: problemsDrawnOn(s, s.sprint, s.day) }
      if (s.day >= DAYS_PER_SPRINT) {
        if (s.sprint >= MAX_SPRINTS) finish(s, 'time-up')
        else {
          s.phase = 'review'
          s.turn = null
        }
        return
      }
      s.day += 1
      s.turnIndex = 0
    }
    const member = s.members[s.turnIndex]
    const reason = s.skipNext[member.id]
    if (reason) {
      delete s.skipNext[member.id]
      s.skipNotices.push({ name: member.name, reason, sprint: s.sprint, day: s.day })
      pushLog(s, {
        kind: 'skip',
        order: s.turnIndex + 1,
        member: member.name,
        storyId: null,
        dice: '—',
        cardIds: [],
        cards: '—',
        effect: `Giliran dilewati (${reason})`,
        remaining: null,
        status: 'DILEWATI',
        dice1: 0,
        dice2: 0,
        diceTotal: 0,
        effective: 0,
        pocketAfter: s.solutions.length,
        skipReason: reason,
      })
      s.turnIndex += 1
      continue
    }
    s.turnSeq += 1
    const turn: TurnDraft = {
      seq: s.turnSeq,
      memberId: member.id,
      order: s.turnIndex + 1,
      storyId: null,
      stage: 'pick',
      roll: null,
      extraDice: null,
      cards: [],
      pending: null,
      notes: [],
      unplanned: false,
      before: null,
      bonus: 0,
      adjust: [],
    }
    s.turn = turn
    return
  }
}

function problemsDrawnOn(s: GameState, sprint: number, day: number): string[] {
  return s.log
    .filter((e) => e.kind === 'turn' && e.sprint === sprint && e.day === day)
    .flatMap((e) => e.cardIds)
    .filter((id) => getCard(id).kind === 'problem')
    .map((id) => getCard(id).name)
}
