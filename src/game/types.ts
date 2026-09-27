export type Column = 'backlog' | 'todo' | 'inprogress' | 'done'

export type Phase = 'setup' | 'planning' | 'playing' | 'review' | 'finished'

export type Dice = [number, number]

export interface Member {
  id: string
  name: string
}

export interface ActiveProblem {
  uid: string
  cardId: string
  sprint: number
  day: number
}

export interface StoryState {
  id: number
  estimate: number
  remaining: number
  column: Column
  problems: ActiveProblem[]
  /** Member ids who worked on this story, most recent last. */
  workers: string[]
  /** Sprints in which the team committed this story during planning. */
  plannedIn: number[]
  doneSprint: number | null
  doneDay: number | null
  /** Remaining-hour values during the last turn that changed this story; last = current. */
  trail: number[]
  trailTurn: number
}

export interface HeldSolution {
  uid: string
  cardId: string
  sprint: number
  day: number
}

export interface DiceRoll {
  dice: Dice
  base: number
  penalty: number
  result: number
}

export type PendingDecision = 'goodRecruit' | 'visibleEffort' | 'guru'

export type TurnStage = 'pick' | 'roll' | 'draw' | 'decide' | 'done'

export interface TurnDraft {
  seq: number
  memberId: string
  /** 1-based position within the day. */
  order: number
  storyId: number | null
  stage: TurnStage
  roll: DiceRoll | null
  extraDice: Dice | null
  cards: string[]
  pending: PendingDecision | null
  notes: string[]
  /** Story was pulled from Backlog, outside this sprint's Plan. */
  unplanned: boolean
  /** Story hours when the dice were rolled (Jam Story Tersisa). */
  before: number | null
  /** Hours added to the roll by cards: Doing Well, Home Work, Visible Effort, Good Recruit. */
  bonus: number
  /** Card changes to the story itself, e.g. "+6 (Extra Cost)". */
  adjust: string[]
}

export type LogKind = 'turn' | 'skip' | 'solution'

export interface LogEntry {
  id: number
  kind: LogKind
  sprint: number
  day: number
  order: number | null
  member: string
  storyId: number | null
  dice: string
  cardIds: string[]
  cards: string
  effect: string
  remaining: number | null
  status: string
  /* Structured numbers for the report (optional: older saves lack them). */
  dice1?: number | null
  dice2?: number | null
  /** Total Jam Dari Dadu: d1 + d2, before Birthday. */
  diceTotal?: number | null
  /** Jam Efektif: hours worked into the story (dice − Birthday + roll bonuses). */
  effective?: number | null
  /** Jam Story Tersisa: story hours at the start of the work. */
  before?: number | null
  /** Jam Story Tersisa − Jam Efektif, floored at 0. */
  afterWork?: number | null
  /** Card effects on the story after the work, e.g. "+6 (Extra Cost)". */
  adjust?: string
  /** Every value the story's hours passed through this turn. */
  trail?: number[]
  problemsAfter?: string
  pocketAfter?: number
  skipReason?: string
}

export interface SprintRecord {
  sprint: number
  plannedIds: number[]
  plannedEstimate: number
  plannedRemaining: number
  doneIds: number[]
}

export interface DayNote {
  sprint: number
  day: number
  problems: string[]
}

export interface SkipNotice {
  name: string
  reason: string
  sprint: number
  day: number
}

export type EndReason = 'all-done' | 'time-up'

export interface GameState {
  version: 1
  phase: Phase
  teamName: string
  members: Member[]
  stories: StoryState[]
  solutions: HeldSolution[]
  sprint: number
  day: number
  /** Index into members of whose turn it is today. */
  turnIndex: number
  /** memberId → name of the card that makes them skip their next turn. */
  skipNext: Record<string, string>
  /** memberIds whose next dice result gets −1 (Birthday). Never stacks. */
  birthday: Record<string, true>
  turn: TurnDraft | null
  turnSeq: number
  log: LogEntry[]
  sprints: SprintRecord[]
  endReason: EndReason | null
  dayNote: DayNote | null
  skipNotices: SkipNotice[]
  uid: number
}

export type Action =
  | { type: 'setupTeam'; teamName: string; names: string[] }
  | { type: 'commitPlan'; storyIds: number[] }
  | { type: 'selectStory'; storyId: number }
  | { type: 'rollDice'; dice: Dice }
  | { type: 'drawCard'; cardId: string }
  | { type: 'resolveDecision'; accept: boolean; dice?: Dice; problemUid?: string }
  | { type: 'useSolution'; solutionUid: string; problemUid: string }
  | { type: 'endTurn' }
  | { type: 'startNextSprint' }
  | { type: 'dismissDayNote' }
  | { type: 'dismissSkipNotices' }
  | { type: 'load'; state: GameState }
  | { type: 'reset' }
