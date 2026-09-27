import { RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { ExportButtons, LogTable } from '../components/LogTable'
import { StoryCard } from '../components/StoryCard'
import { celebrate } from '../components/confetti'
import { endReasonText } from '../game/export'
import type { GameState } from '../game/types'
import { PlanActualTable } from './Review'

export function Finished({ state, onNewGame }: { state: GameState; onNewGame: () => void }) {
  const done = state.stories.filter((s) => s.column === 'done').length

  useEffect(() => {
    celebrate()
  }, [])

  return (
    <div className="finished">
      <div className="finished__head">
        <h1 className="page-title finished__title">
          <span className="stabilo">Game selesai!</span>
        </h1>
        <p className="finished__reason">
          {endReasonText(state)}.
          {state.endReason !== 'all-done' && (
            <>
              {' '}
              <strong className="num">{done}</strong> dari <span className="num">12</span> cerita DONE.
            </>
          )}
        </p>
      </div>

      <div className="finished__grid">
        <section aria-labelledby="sum-title">
          <h2 id="sum-title" className="section-title">
            Plan vs Actual
          </h2>
          <PlanActualTable records={state.sprints} />
          <div className="finished__export">
            <p>Unduh log lengkap untuk lampiran laporan. File Excel berisi log giliran, Plan vs Actual, status cerita, dan kartu yang diambil.</p>
            <ExportButtons state={state} big />
          </div>
        </section>
        <section aria-labelledby="final-title">
          <h2 id="final-title" className="section-title">
            Papan akhir
          </h2>
          <ul className="mini-grid mini-grid--final">
            {state.stories.map((s) => (
              <StoryCard key={s.id} as="li" story={s} state={state} compact />
            ))}
          </ul>
        </section>
      </div>

      <LogTable state={state} tall />

      <div className="finished__foot">
        <button type="button" className="btn" onClick={onNewGame}>
          <RotateCcw aria-hidden="true" /> Main lagi dari awal
        </button>
      </div>
    </div>
  )
}
