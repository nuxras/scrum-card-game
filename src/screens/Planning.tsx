import { ArrowRight, Check, Wand2 } from 'lucide-react'
import { useState, type Dispatch } from 'react'
import { getCard, getStoryCard } from '../game/data'
import { sprintCapacity, sumEstimates } from '../game/engine'
import type { Action, GameState } from '../game/types'

export function Planning({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const open = state.stories.filter((s) => s.column !== 'done')
  const capacity = sprintCapacity(state.members.length)
  const history = state.sprints.filter((r) => r.sprint < state.sprint)

  // Unfinished work from the last sprint starts ticked; the team can untick it.
  const [picked, setPicked] = useState<Set<number>>(() => {
    const last = history.at(-1)
    return new Set(last ? open.filter((s) => last.plannedIds.includes(s.id) || s.column === 'inprogress').map((s) => s.id) : [])
  })

  const chosen = open.filter((s) => picked.has(s.id))
  const remainingSum = chosen.reduce((sum, s) => sum + s.remaining, 0)
  const estimateSum = chosen.reduce((sum, s) => sum + s.estimate, 0)
  const over = remainingSum > capacity

  function toggle(id: number) {
    setPicked((p) => {
      const next = new Set(p)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function fillToCapacity() {
    const next = new Set<number>()
    let sum = 0
    for (const s of open) {
      if (next.size > 0 && sum + s.remaining > capacity) break
      next.add(s.id)
      sum += s.remaining
    }
    setPicked(next)
  }

  return (
    <div className="planning">
      <div className="planning__intro">
        <h1 className="page-title">
          Sprint Planning <span className="stabilo">Sprint {state.sprint}</span>
        </h1>
        <blockquote className="quote hand">
          “Pikirkan dan diskusikan, berapa banyak Cerita (item backlog) yang menurut kalian bisa dibuat?”
        </blockquote>
        <p className="lede">
          Centang cerita yang tim commit untuk sprint ini. Yang dicentang masuk kolom To Do dan dicatat sebagai
          <strong> Plan</strong>. Di akhir sprint, Plan dibandingkan dengan yang benar-benar DONE (Actual).
        </p>
      </div>

      <div className="planning__facts">
        <div className="fact">
          <span className="label">Perkiraan kapasitas</span>
          <p>
            <span className="num fact__big">±{capacity}</span> jam
          </p>
          <p className="fact__sub">
            {state.members.length} orang × 3 hari × rata-rata 7 jam (2 dadu)
          </p>
        </div>
        {history.length > 0 && (
          <div className="fact">
            <span className="label">Sprint sebelumnya</span>
            <ul className="fact__list">
              {history.map((r) => (
                <li key={r.sprint}>
                  Sprint {r.sprint}: Plan <span className="num">{r.plannedIds.length}</span> cerita, DONE{' '}
                  <span className="num">{r.doneIds.length}</span> (<span className="num">{sumEstimates(r.doneIds)}</span> jam
                  estimasi)
                </li>
              ))}
            </ul>
            <p className="fact__sub">Manual menyarankan planning sprint 2 dan 3 pakai data historis ini.</p>
          </div>
        )}
      </div>

      <div className="planning__tools">
        <button type="button" className="btn btn--sm" onClick={fillToCapacity}>
          <Wand2 aria-hidden="true" /> Isi sesuai kapasitas
        </button>
        {picked.size > 0 && (
          <button type="button" className="btn btn--sm btn--quiet" onClick={() => setPicked(new Set())}>
            Kosongkan pilihan
          </button>
        )}
      </div>

      <ul className="planning__grid">
        {open.map((s) => {
          const on = picked.has(s.id)
          const started = s.remaining < s.estimate || s.workers.length > 0
          return (
            <li key={s.id}>
              <label className={`pickcard${on ? ' is-on' : ''}`}>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(s.id)} />
                <span className="pickcard__box" aria-hidden="true">
                  {on && <Check />}
                </span>
                <span className="pickcard__no num">#{s.id}</span>
                <span className="pickcard__hours num">
                  {s.remaining}
                  {started && <small>/{s.estimate}</small>}
                  <span className="label"> jam</span>
                </span>
                <span className="pickcard__text">{getStoryCard(s.id).text}</span>
                {(started || s.problems.length > 0) && (
                  <span className="pickcard__meta">
                    {started && <span>sudah jalan</span>}
                    {s.problems.map((p) => (
                      <span key={p.uid} className="flag flag--inline">
                        {getCard(p.cardId).name}
                      </span>
                    ))}
                  </span>
                )}
              </label>
            </li>
          )
        })}
      </ul>

      <div className="planning__bar">
        <p className="planning__sum">
          Plan: <strong className="num">{chosen.length}</strong> cerita · <strong className="num">{remainingSum}</strong> jam
          sisa · <span className="num">{estimateSum}</span> jam estimasi
          {chosen.length > 0 && (
            <span className={over ? 'planning__warn' : 'planning__ok'}>
              {over ? ` · ${remainingSum - capacity} jam di atas kapasitas rata-rata` : ' · masih dalam kapasitas'}
            </span>
          )}
        </p>
        <button
          type="button"
          className="btn btn--go"
          disabled={chosen.length === 0}
          onClick={() => dispatch({ type: 'commitPlan', storyIds: chosen.map((s) => s.id) })}
        >
          {chosen.length === 0 ? 'Pilih minimal 1 cerita' : `Mulai Sprint ${state.sprint}`} <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
