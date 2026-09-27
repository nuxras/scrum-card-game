import { BookOpen, Check, RotateCcw } from 'lucide-react'
import { DAYS_PER_SPRINT, MAX_SPRINTS } from '../game/data'
import type { GameState } from '../game/types'
import { PenCircle } from './bits'

function DayTrack({ state }: { state: GameState }) {
  const current = (state.sprint - 1) * DAYS_PER_SPRINT + state.day
  const finished = state.phase === 'finished'
  const inReview = state.phase === 'review'
  const planning = state.phase === 'planning'

  return (
    <ol className="daytrack" aria-label={`Hari ke-${current} dari 9`}>
      {Array.from({ length: MAX_SPRINTS }, (_, si) => (
        <li key={si} className="daytrack__sprint">
          <span className="daytrack__label num">S{si + 1}</span>
          <span className="daytrack__boxes">
            {Array.from({ length: DAYS_PER_SPRINT }, (_, di) => {
              const n = si * DAYS_PER_SPRINT + di + 1
              const past = finished || inReview ? n <= current : planning ? n < current : n < current
              const today = !finished && !inReview && !planning && n === current
              return (
                <span key={di} className={`daybox${past ? ' is-past' : ''}${today ? ' is-today' : ''}`}>
                  {past && <Check aria-hidden="true" />}
                  {today && <PenCircle className="daybox__circle" />}
                </span>
              )
            })}
          </span>
        </li>
      ))}
    </ol>
  )
}

function TurnOrder({ state }: { state: GameState }) {
  const skippedToday = new Set(
    state.log
      .filter((e) => e.kind === 'skip' && e.sprint === state.sprint && e.day === state.day)
      .map((e) => e.member),
  )
  return (
    <ol className="turnorder" aria-label="Urutan giliran hari ini">
      {state.members.map((m, i) => {
        const current = state.phase === 'playing' && state.turn?.memberId === m.id
        const played = state.phase === 'playing' && i < state.turnIndex
        const skipped = played && skippedToday.has(m.name)
        const willSkip = !current && state.phase === 'playing' && state.skipNext[m.id]
        return (
          <li
            key={m.id}
            className={`turnorder__item${current ? ' is-current' : ''}${played ? ' is-played' : ''}${skipped ? ' is-skipped' : ''}`}
            aria-current={current ? 'step' : undefined}
          >
            {played && !skipped && <Check aria-hidden="true" />}
            <span className={`hand${current ? ' stabilo' : ''}`}>{m.name}</span>
            {skipped && <span className="turnorder__tag">skip</span>}
            {willSkip && <span className="turnorder__tag">akan skip</span>}
          </li>
        )
      })}
    </ol>
  )
}

export function NotebookHeader({
  state,
  onOpenRules,
  onNewGame,
  onCover,
}: {
  state: GameState
  onOpenRules: () => void
  onNewGame: () => void
  onCover: () => void
}) {
  const phaseLabel =
    state.phase === 'planning'
      ? 'Sprint Planning'
      : state.phase === 'review'
        ? 'Sprint Review'
        : state.phase === 'finished'
          ? 'Game selesai'
          : null

  return (
    <header className="nhead">
      <div className="nhead__row">
        <button type="button" className="nhead__brand" onClick={onCover} title="Kembali ke sampul">
          Scrum Card Game <span className="hand">Simulator</span>
        </button>
        <dl className="nhead__fields">
          <div className="nfield">
            <dt>Tim</dt>
            <dd className="hand">{state.teamName || 'Tanpa nama'}</dd>
          </div>
          <div className="nfield">
            <dt>Sprint</dt>
            <dd className="num">
              {state.sprint}
              <small>/{MAX_SPRINTS}</small>
            </dd>
          </div>
          <div className="nfield">
            <dt>Hari</dt>
            <dd className="num">
              {state.phase === 'planning' ? '–' : state.day}
              <small>/{DAYS_PER_SPRINT}</small>
            </dd>
          </div>
        </dl>
        <DayTrack state={state} />
        <div className="nhead__tools">
          <button type="button" className="btn btn--sm" onClick={onOpenRules}>
            <BookOpen aria-hidden="true" /> Cara main
          </button>
          <button type="button" className="btn btn--sm btn--quiet" onClick={onNewGame}>
            <RotateCcw aria-hidden="true" /> Game baru
          </button>
        </div>
      </div>
      <div className="nhead__row nhead__row--turns">
        {phaseLabel ? (
          <p className="nhead__phase">
            <span className="label">{phaseLabel}</span>
            <span className="hand">{state.members.map((m) => m.name).join(' · ')}</span>
          </p>
        ) : (
          <>
            <span className="label">Giliran hari ini</span>
            <TurnOrder state={state} />
          </>
        )}
      </div>
    </header>
  )
}
