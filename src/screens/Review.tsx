import { ArrowRight } from 'lucide-react'
import type { Dispatch } from 'react'
import { ExportButtons } from '../components/LogTable'
import { StoryCard } from '../components/StoryCard'
import { currentSprintRecord, findStory, sumEstimates } from '../game/engine'
import type { Action, GameState, SprintRecord } from '../game/types'

export function PlanActualTable({ records, caption }: { records: SprintRecord[]; caption?: string }) {
  const totals = records.reduce(
    (t, r) => ({
      planN: t.planN + r.plannedIds.length,
      planH: t.planH + r.plannedEstimate,
      doneN: t.doneN + r.doneIds.length,
      doneH: t.doneH + sumEstimates(r.doneIds),
    }),
    { planN: 0, planH: 0, doneN: 0, doneH: 0 },
  )
  return (
    <div className="table-scroll">
    <table className="flip-table">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">Sprint</th>
          <th scope="col" colSpan={2}>
            Plan
          </th>
          <th scope="col" colSpan={2}>
            Actual (DONE)
          </th>
        </tr>
        <tr className="flip-table__sub">
          <td />
          <th scope="col">cerita</th>
          <th scope="col">jam estimasi</th>
          <th scope="col">cerita</th>
          <th scope="col">jam estimasi</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => {
          const doneH = sumEstimates(r.doneIds)
          const diff = r.doneIds.length - r.plannedIds.length
          return (
            <tr key={r.sprint}>
              <th scope="row" className="num">
                {r.sprint}
              </th>
              <td className="num">{r.plannedIds.length}</td>
              <td className="num">{r.plannedEstimate}</td>
              <td className="num">
                {r.doneIds.length}
                {diff !== 0 && (
                  <span className={`pen-note hand${diff < 0 ? ' pen-note--minus' : ''}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
              </td>
              <td className="num">{doneH}</td>
            </tr>
          )
        })}
      </tbody>
      {records.length > 1 && (
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="num">{totals.planN}</td>
            <td className="num">{totals.planH}</td>
            <td className="num">{totals.doneN}</td>
            <td className="num">{totals.doneH}</td>
          </tr>
        </tfoot>
      )}
    </table>
    </div>
  )
}

export function Review({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const record = currentSprintRecord(state)
  if (!record) return null
  const doneHere = record.doneIds.map((id) => findStory(state, id))
  const unfinished = record.plannedIds.filter((id) => !record.doneIds.includes(id)).map((id) => findStory(state, id))
  const extra = record.doneIds.filter((id) => !record.plannedIds.includes(id))

  return (
    <div className="review">
      <h1 className="page-title">
        Sprint Review <span className="stabilo">Sprint {state.sprint}</span>
      </h1>
      <p className="lede">
        Tiga hari selesai. Tinjau hanya cerita yang benar-benar DONE, bandingkan dengan Plan, lalu retrospektif sebelum
        sprint berikutnya.
      </p>

      <PlanActualTable records={[record]} />
      {extra.length > 0 && (
        <p className="hint">
          Termasuk {extra.map((id) => `#${id}`).join(', ')} yang ditarik dari Backlog di tengah sprint (di luar Plan).
        </p>
      )}

      <div className="review__cols">
        <section aria-labelledby="done-title">
          <h2 id="done-title" className="section-title">
            DONE di sprint ini
          </h2>
          {doneHere.length === 0 ? (
            <p className="empty-line">Belum ada cerita yang DONE di sprint ini.</p>
          ) : (
            <ul className="mini-grid">
              {doneHere.map((s) => (
                <StoryCard key={s.id} as="li" story={s} state={state} compact />
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="undone-title">
          <h2 id="undone-title" className="section-title">
            Belum selesai
          </h2>
          {unfinished.length === 0 ? (
            <p className="empty-line">Semua cerita di Plan sudah DONE.</p>
          ) : (
            <ul className="mini-grid">
              {unfinished.map((s) => (
                <StoryCard key={s.id} as="li" story={s} state={state} compact />
              ))}
            </ul>
          )}
          {unfinished.length > 0 && (
            <p className="hint">Jam yang sudah dikerjakan tetap terbawa; cerita ini bisa di-commit lagi di sprint berikutnya.</p>
          )}
        </section>
      </div>

      <section className="retro" aria-labelledby="retro-title">
        <h2 id="retro-title" className="section-title">
          Retrospektif
        </h2>
        <ol className="retro__list">
          <li>Bandingkan hasil Actual dengan Plan awal. Kenapa beda?</li>
          <li>Tinjau pekerjaan yang belum selesai dan diskusikan alasannya.</li>
          <li>Problem apa yang paling menghambat, dan apa padanannya di proyek nyata?</li>
          <li>Apa yang akan tim lakukan beda di sprint berikutnya supaya hasilnya lebih baik?</li>
        </ol>
      </section>

      <div className="review__foot">
        <ExportButtons state={state} />
        <button type="button" className="btn btn--go" onClick={() => dispatch({ type: 'startNextSprint' })}>
          Lanjut ke Planning Sprint {state.sprint + 1} <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
