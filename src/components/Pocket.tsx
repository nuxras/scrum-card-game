import { useState, type Dispatch } from 'react'
import { getCard } from '../game/data'
import { activeProblems, findStory } from '../game/engine'
import type { Action, GameState } from '../game/types'

/** Kantong Solusi: the team's stored Solution cards, usable on any active Problem at any time. */
export function Pocket({ state, dispatch }: { state: GameState; dispatch: Dispatch<Action> }) {
  const problems = activeProblems(state)
  const [openUid, setOpenUid] = useState<string | null>(null)
  const count = state.solutions.length
  const canUse = problems.length > 0 && state.phase === 'playing'

  // A Problem drawn this turn: point the team at the pocket instead of repeating it on the desk.
  const t = state.turn
  const lastId = t && t.stage === 'done' ? t.cards.at(-1) : undefined
  const fresh =
    lastId && getCard(lastId).kind === 'problem' && t?.storyId != null
      ? findStory(state, t.storyId).problems.findLast((p) => p.cardId === lastId) ?? null
      : null
  const freshSolutionUid = lastId && getCard(lastId).kind === 'solution' ? state.solutions.at(-1)?.uid : undefined

  return (
    <section className="pocket" aria-labelledby="pocket-title">
      <div className="pocket__head">
        <h2 id="pocket-title" className="section-title">
          Kantong Solusi
        </h2>
        <span className="pocket__count num" aria-label={`${count} Solution disimpan`}>
          {count}
        </span>
        <p className="pocket__lede">
          {fresh && count > 0 ? (
            <strong className="pocket__nudge">
              Problem baru “{getCard(fresh.cardId).name}” di #{t!.storyId}: bisa langsung ditutup dengan Solution di bawah.
            </strong>
          ) : (
            'Milik seluruh tim. Pakai kapan saja untuk menutup Problem di cerita mana pun; kedua kartu lalu dibuang.'
          )}
        </p>
      </div>

      {count === 0 ? (
        <p className="pocket__empty">
          {problems.length > 0
            ? `${problems.length} Problem masih aktif. Kartu Solution berikutnya bisa langsung menutupnya.`
            : 'Belum ada Solution. Kartu Solution yang diambil akan disimpan di sini.'}
        </p>
      ) : (
        <ul className="pocket__list">
          {state.solutions.map((sol) => {
            const card = getCard(sol.cardId)
            const open = openUid === sol.uid
            return (
              <li key={sol.uid} className={`sol${open ? ' is-open' : ''}${sol.uid === freshSolutionUid ? ' is-new' : ''}`}>
                <div className="sol__band" aria-hidden="true" />
                <div className="sol__head">
                  <strong className="sol__name">{card.name}</strong>
                  {sol.uid === freshSolutionUid && <span className="sol__new">baru</span>}
                </div>
                <span className="sol__text" lang="en">
                  {card.text}
                </span>
                {open ? (
                  <div className="sol__pick" role="group" aria-label={`Pilih Problem yang ditutup ${card.name}`}>
                    <span className="sol__ask">Tutup yang mana?</span>
                    {(fresh ? [...problems.filter((x) => x.problem.uid === fresh.uid), ...problems.filter((x) => x.problem.uid !== fresh.uid)] : problems).map(({ story, problem }) => (
                      <button
                        key={problem.uid}
                        type="button"
                        className="btn btn--sm chip-btn chip-btn--problem"
                        onClick={() => {
                          dispatch({ type: 'useSolution', solutionUid: sol.uid, problemUid: problem.uid })
                          setOpenUid(null)
                        }}
                      >
                        #{story.id} · {getCard(problem.cardId).name}
                      </button>
                    ))}
                    <button type="button" className="btn btn--sm btn--quiet" onClick={() => setOpenUid(null)}>
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="sol__foot">
                    <span className="sol__when">
                      S{sol.sprint} · H{sol.day}
                    </span>
                    <button
                      type="button"
                      className={`btn btn--sm sol__use${canUse && (fresh || freshSolutionUid === sol.uid) ? ' is-ready' : ''}`}
                      disabled={!canUse}
                      title={problems.length === 0 ? 'Belum ada Problem aktif' : undefined}
                      aria-label={`Pakai ${card.name} untuk menutup Problem`}
                      onClick={() => setOpenUid(sol.uid)}
                    >
                      Pakai
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
