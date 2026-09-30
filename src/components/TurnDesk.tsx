import { ArrowRight, Dices, Hand, MessageCircleQuestion, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type Dispatch } from 'react'
import { KIND_LABEL, getCard, getStoryCard } from '../game/data'
import { deckOf, findStory, gameReducer, memberName, suggestStory } from '../game/engine'
import { drawChanceCardId, rollTwoDice } from '../game/random'
import type { Action, Dice, GameState, StoryState } from '../game/types'
import { CardBox, FlipCard } from './ChanceCard'
import { DicePairView } from './Dice'
import { StoryCard } from './StoryCard'

const FLIP_MS = 760

function optionLabel(s: StoryState, suggested: boolean): string {
  const text = getStoryCard(s.id).text
  const short = text.length > 46 ? `${text.slice(0, 44).trimEnd()}…` : text
  const flags = [s.problems.length ? 'BLOCKED' : '', suggested ? 'saran' : ''].filter(Boolean).join(', ')
  return `#${s.id} · ${s.remaining} jam · ${short}${flags ? ` (${flags})` : ''}`
}

function Steps({ stage }: { stage: string }) {
  const at = stage === 'pick' ? 0 : stage === 'roll' ? 1 : stage === 'done' ? 3 : 2
  const steps = ['Pilih cerita', 'Lempar dadu', 'Ambil kartu']
  return (
    <ol className="steps">
      {steps.map((label, i) => (
        <li key={label} className={i < at ? 'is-done' : i === at ? 'is-now' : undefined} aria-current={i === at ? 'step' : undefined}>
          <span className="steps__n num">{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  )
}

export function TurnDesk({
  state,
  dispatch,
  reduced,
}: {
  state: GameState
  dispatch: Dispatch<Action>
  reduced: boolean
}) {
  const turn = state.turn!
  const member = memberName(state, turn.memberId)
  const suggestion = suggestStory(state)
  const openStories = state.stories.filter((s) => s.column !== 'done')

  const [choice, setChoice] = useState<number | null>(turn.storyId ?? suggestion)
  const [changing, setChanging] = useState(false)
  const [rollKey, setRollKey] = useState(0)
  const [pendingDice, setPendingDice] = useState<Dice | null>(null)
  const [extraKey, setExtraKey] = useState(0)
  const [pendingExtra, setPendingExtra] = useState<Dice | null>(null)
  const [pendingCard, setPendingCard] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const primary = useRef<HTMLButtonElement>(null)

  // Fresh desk for every turn.
  const seq = turn.seq
  const [deskSeq, setDeskSeq] = useState(seq)
  if (deskSeq !== seq) {
    setDeskSeq(seq)
    setChoice(suggestion)
    setChanging(false)
    setPendingDice(null)
    setPendingExtra(null)
    setPendingCard(null)
  }

  useEffect(() => {
    primary.current?.focus({ preventScroll: true })
  }, [seq, turn.stage, changing])

  const story = turn.storyId != null ? findStory(state, turn.storyId) : null
  const picking = turn.stage === 'pick' || (turn.stage === 'roll' && changing)
  const rolling = pendingDice !== null
  const drawing = pendingCard !== null
  const extraRolling = pendingExtra !== null
  const showResult = !drawing && turn.cards.length > 0
  const trailNow = story && story.trailTurn === turn.seq ? story.trail : null

  const preview = useMemo(() => (turn.stage === 'done' ? gameReducer(state, { type: 'endTurn' }) : null), [state, turn.stage])

  function endLabel(): string {
    if (!preview) return 'Selesai'
    if (preview.phase === 'finished') return 'Selesai, lihat hasil akhir'
    if (preview.phase === 'review') return `Selesai, ke Sprint Review ${state.sprint}`
    const next = preview.turn ? memberName(preview, preview.turn.memberId) : ''
    if (preview.day !== state.day) return `Selesai, lanjut Hari ${preview.day}: giliran ${next}`
    return `Selesai, giliran ${next}`
  }

  function startRoll() {
    if (rolling) return
    setPendingDice(rollTwoDice())
    setRollKey((k) => k + 1)
  }

  function settleRoll() {
    if (!pendingDice || !story) return
    const before = story.remaining
    const penalty = state.birthday[turn.memberId] ? 1 : 0
    const result = Math.max(0, pendingDice[0] + pendingDice[1] - penalty)
    dispatch({ type: 'rollDice', dice: pendingDice })
    setAnnounce(
      `${member} melempar ${pendingDice[0]} + ${pendingDice[1]}${penalty ? ' dikurangi 1' : ''} = ${result}. Sisa jam #${story.id}: ${before} menjadi ${Math.max(0, before - result)}.`,
    )
    setPendingDice(null)
  }

  function startDraw() {
    if (drawing) return
    const id = drawChanceCardId(deckOf(state))
    setPendingCard(id)
    window.setTimeout(
      () => {
        dispatch({ type: 'drawCard', cardId: id })
        const c = getCard(id)
        setAnnounce(`Kartu ${KIND_LABEL[c.kind]}: ${c.name}. ${c.text}`)
        setPendingCard(null)
      },
      reduced ? 0 : FLIP_MS,
    )
  }

  function startExtraRoll() {
    if (extraRolling) return
    setPendingExtra(rollTwoDice())
    setExtraKey((k) => k + 1)
  }

  function settleExtra() {
    if (!pendingExtra) return
    dispatch({ type: 'resolveDecision', accept: true, dice: pendingExtra })
    setAnnounce(`Good Recruit: ${pendingExtra[0]} + ${pendingExtra[1]} = ${pendingExtra[0] + pendingExtra[1]} jam tambahan.`)
    setPendingExtra(null)
  }

  const shownCards = pendingCard ? [...turn.cards, pendingCard] : turn.cards
  const earlier = shownCards.slice(0, -1)
  const current = shownCards.at(-1) ?? null

  return (
    <section className="desk" aria-labelledby="desk-title">
      <div className="desk__who">
        <h2 id="desk-title" className="desk__title">
          Giliran <span className="stabilo">{member}</span>
        </h2>
        <p className="desk__meta">
          Sprint {state.sprint} · Hari {state.day} · orang ke-{turn.order} dari {state.members.length}
        </p>
      </div>

      <Steps stage={turn.stage} />

      {state.skipNotices.length > 0 && (
        <div className="note note--event" role="status">
          <p>
            <strong>Dilewati:</strong>{' '}
            {state.skipNotices.map((n) => `${n.name} (${n.reason}, Hari ${n.day})`).join(', ')}.
          </p>
          <button type="button" className="note__x" onClick={() => dispatch({ type: 'dismissSkipNotices' })} aria-label="Tutup catatan">
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      {state.dayNote && (
        <div className="note note--day" role="status">
          <MessageCircleQuestion aria-hidden="true" className="note__icon" />
          <div>
            <p>
              <strong>Hari {state.dayNote.day} selesai.</strong> Sebelum lanjut, diskusi sebentar: solusi apa yang akan
              kalian terapkan di dunia nyata untuk masalah yang muncul?
            </p>
            {state.dayNote.problems.length > 0 && (
              <p className="note__sub">Problem hari itu: {state.dayNote.problems.join(', ')}</p>
            )}
          </div>
          <button type="button" className="note__x" onClick={() => dispatch({ type: 'dismissDayNote' })} aria-label="Tutup catatan">
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      {picking ? (
        <div className="desk__stage">
          <label className="field">
            <span>Cerita yang dikerjakan {member}</span>
            <select className="select" value={choice ?? ''} onChange={(e) => setChoice(Number(e.target.value))}>
              {(['inprogress', 'todo', 'backlog'] as const).map((col) => {
                const list = openStories.filter((s) => s.column === col)
                if (!list.length) return null
                const label = col === 'inprogress' ? 'In Progress' : col === 'todo' ? 'To Do' : 'Backlog (di luar Plan)'
                return (
                  <optgroup key={col} label={label}>
                    {list.map((s) => (
                      <option key={s.id} value={s.id}>
                        {optionLabel(s, s.id === suggestion)}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </label>
          {suggestion != null && (
            <p className="hint">
              Saran: <strong>#{suggestion}</strong>, nomor terkecil di sprint ini yang masih punya jam. Boleh diganti.
            </p>
          )}
          {choice != null && <StoryCard story={findStory(state, choice)} state={state} active />}
          <div className="desk__actions">
            <button
              ref={primary}
              type="button"
              className="btn btn--go btn--block"
              disabled={choice == null}
              onClick={() => {
                if (choice == null) return
                dispatch({ type: 'selectStory', storyId: choice })
                setChanging(false)
              }}
            >
              Kerjakan cerita #{choice} <ArrowRight aria-hidden="true" />
            </button>
            {changing && (
              <button type="button" className="btn btn--quiet btn--sm" onClick={() => setChanging(false)}>
                Batal ganti
              </button>
            )}
          </div>
        </div>
      ) : (
        story && (
          <div className="desk__stage">
            <div className="desk__story">
              <StoryCard story={story} state={state} active showTrail={story.trailTurn === turn.seq} hideWorkers />
              {turn.stage === 'roll' && !rolling && (
                <button type="button" className="btn btn--quiet btn--sm" onClick={() => setChanging(true)}>
                  Ganti cerita
                </button>
              )}
            </div>

            <div className={`desk__play${turn.stage === 'roll' ? '' : ' is-split'}`}>
              <div className="desk__dice">
                <DicePairView values={pendingDice ?? turn.roll?.dice ?? null} rollKey={rollKey} reduced={reduced} onSettled={settleRoll} />
                {!turn.roll && (
                  <p className="desk__sum desk__sum--idle">{rolling ? 'Dadu berputar…' : 'Hasil dadu = jam kerja hari ini'}</p>
                )}
              </div>

              {turn.roll && (
                <div className="desk__sums">
                  <p className="desk__sum">
                    <span className="num desk__eq">
                      {turn.roll.dice[0]} + {turn.roll.dice[1]}
                      {turn.roll.penalty ? ' − 1' : ''} = <strong>{turn.roll.result}</strong>
                    </span>{' '}
                    <span className="desk__eq">
                      jam kerja
                      {turn.roll.penalty ? <span className="desk__sum-note"> (Birthday −1)</span> : null}
                    </span>
                  </p>
                  {trailNow && trailNow.length > 1 && (
                    <p className="desk__trace num">
                      {trailNow[0] - turn.roll.result < 0 ? (
                        <>
                          #{story.id}: {trailNow[0]} − {turn.roll.result} → {trailNow[1]}{' '}
                          <span className="desk__floor">(minimal 0)</span>
                        </>
                      ) : (
                        <>
                          #{story.id}: {trailNow[0]} − {turn.roll.result} = {trailNow[1]}
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {turn.stage !== 'roll' && (
                <div className="desk__cardrow">
                  {earlier.length > 0 && (
                    <p className="desk__chain">
                      {earlier.map((id, i) => (
                        <span key={i} className={`kchip kchip--${getCard(id).kind}`}>
                          {getCard(id).name}
                        </span>
                      ))}
                      <ArrowRight aria-hidden="true" />
                    </p>
                  )}
                  {turn.stage === 'draw' && !drawing ? (
                    <CardBox deckLeft={deckOf(state).length} />
                  ) : (
                    current && (
                      <div className="desk__card" key={`${turn.seq}-${shownCards.length - 1}`}>
                        <FlipCard cardId={current} instant={reduced} />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {turn.stage === 'roll' && (
              <div className="desk__actions">
                {state.birthday[turn.memberId] && (
                  <p className="note note--event note--inline">Birthday: hasil dadu {member} kali ini dikurangi 1.</p>
                )}
                <button ref={primary} type="button" className="btn btn--go btn--block" onClick={startRoll} disabled={rolling}>
                  <Dices aria-hidden="true" /> {rolling ? 'Dadu berputar…' : 'Lempar 2 dadu'}
                </button>
              </div>
            )}

            {turn.stage === 'draw' && (
              <button ref={primary} type="button" className="btn btn--go btn--block" onClick={startDraw} disabled={drawing}>
                <Hand aria-hidden="true" />
                {drawing ? 'Membuka kartu…' : turn.cards.length ? 'Overtime: ambil 1 kartu lagi' : 'Ambil kartu Peluang'}
              </button>
            )}

            {showResult && turn.stage !== 'draw' && turn.notes.length > 0 && (
              <ul className="effects" aria-label="Efek giliran ini">
                {turn.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}

            {showResult && turn.stage === 'decide' && turn.pending === 'goodRecruit' && (
              <div className="decide">
                <p>
                  <strong>Good Recruit:</strong> mau lempar 2 dadu lagi dan tambahkan ke hasil tadi?
                </p>
                {pendingExtra && (
                  <DicePairView values={pendingExtra} rollKey={extraKey} reduced={reduced} onSettled={settleExtra} size="sm" />
                )}
                <div className="decide__row">
                  <button ref={primary} type="button" className="btn btn--go" onClick={startExtraRoll} disabled={extraRolling}>
                    <Dices aria-hidden="true" /> {extraRolling ? 'Dadu berputar…' : 'Ya, lempar lagi'}
                  </button>
                  <button type="button" className="btn" disabled={extraRolling} onClick={() => dispatch({ type: 'resolveDecision', accept: false })}>
                    Tidak
                  </button>
                </div>
              </div>
            )}

            {showResult && turn.stage === 'decide' && turn.pending === 'visibleEffort' && (
              <div className="decide">
                <p>
                  <strong>Visible Effort:</strong> tambah 3 ke hasil tadi? Sisa jam #{story.id} jadi{' '}
                  <span className="num">{Math.max(0, story.remaining - 3)}</span>.
                </p>
                <div className="decide__row">
                  <button ref={primary} type="button" className="btn btn--go" onClick={() => dispatch({ type: 'resolveDecision', accept: true })}>
                    Ya, tambah 3
                  </button>
                  <button type="button" className="btn" onClick={() => dispatch({ type: 'resolveDecision', accept: false })}>
                    Tidak
                  </button>
                </div>
              </div>
            )}

            {showResult && turn.stage === 'decide' && turn.pending === 'guru' && (
              <div className="decide">
                <p>
                  <strong>Guru:</strong> hapus satu Problem dari #{story.id}?
                </p>
                <div className="decide__row">
                  {story.problems.map((p, i) => (
                    <button
                      key={p.uid}
                      ref={i === 0 ? primary : undefined}
                      type="button"
                      className="btn btn--go"
                      onClick={() => dispatch({ type: 'resolveDecision', accept: true, problemUid: p.uid })}
                    >
                      Hapus “{getCard(p.cardId).name}”
                    </button>
                  ))}
                  <button type="button" className="btn" onClick={() => dispatch({ type: 'resolveDecision', accept: false })}>
                    Tidak
                  </button>
                </div>
              </div>
            )}

            {showResult && turn.stage === 'done' && (
              <button ref={primary} type="button" className="btn btn--go btn--block" onClick={() => dispatch({ type: 'endTurn' })}>
                {endLabel()} <ArrowRight aria-hidden="true" />
              </button>
            )}
          </div>
        )
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  )
}
