import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Board } from './components/Board'
import { LogTable } from './components/LogTable'
import { NotebookHeader } from './components/NotebookHeader'
import { Pocket } from './components/Pocket'
import { RulesPanel } from './components/RulesPanel'
import { TurnDesk } from './components/TurnDesk'
import { usePrefersReducedMotion } from './components/useReducedMotion'
import { createInitialState, gameReducer } from './game/engine'
import { clearGame, loadGame, saveGame } from './game/persist'
import { Cover } from './screens/Cover'
import { Finished } from './screens/Finished'
import { Planning } from './screens/Planning'
import { Review } from './screens/Review'
import { TeamSetup } from './screens/TeamSetup'

function ConfirmNewGame({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className="confirm" onClose={onCancel} aria-labelledby="confirm-title">
      <h2 id="confirm-title" className="section-title">
        Mulai game baru?
      </h2>
      <p>Game yang sedang berjalan dan log-nya akan dihapus dari laptop ini. Unduh log dulu kalau masih perlu.</p>
      <div className="confirm__row">
        <button type="button" className="btn" onClick={onCancel} autoFocus>
          Batal
        </button>
        <button type="button" className="btn btn--ink" onClick={onConfirm}>
          Ya, hapus dan mulai baru
        </button>
      </div>
    </dialog>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadGame() ?? createInitialState())
  const [view, setView] = useState<'cover' | 'game'>('cover')
  const [rulesOpen, setRulesOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => saveGame(state), [state])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view, state.phase])

  const closeRules = useCallback(() => setRulesOpen(false), [])
  const hasGame = state.phase !== 'setup'

  function newGame() {
    clearGame()
    dispatch({ type: 'reset' })
    setConfirmOpen(false)
    setView('game')
  }

  const footer = (
    <footer className="frame__foot">
      <span>
        Dibuat oleh <strong>Nugraha</strong> untuk teman-teman PPL
      </span>
      <span>
        SCRUM CARD GAME © Timofey Yevgrashyn ·{' '}
        <a href="https://scrumcardgame.com" target="_blank" rel="noreferrer">
          scrumcardgame.com
        </a>
      </span>
    </footer>
  )

  let content: React.ReactNode
  if (view === 'cover') {
    content = (
      <div className="frame frame--cover">
        <Cover
          saved={hasGame ? state : null}
          onStart={() => (hasGame ? setConfirmOpen(true) : setView('game'))}
          onContinue={() => setView('game')}
          onRules={() => setRulesOpen(true)}
        />
        {footer}
      </div>
    )
  } else if (state.phase === 'setup') {
    content = (
      <div className="frame">
        <main className="sheet sheet--narrow">
          <div className="sheet__body">
            <TeamSetup
              onBack={() => setView('cover')}
              onSubmit={(teamName, names) => dispatch({ type: 'setupTeam', teamName, names })}
            />
          </div>
        </main>
        {footer}
      </div>
    )
  } else {
    content = (
      <div className="frame">
        <main className={`sheet sheet--${state.phase}`}>
          <NotebookHeader
            state={state}
            onOpenRules={() => setRulesOpen(true)}
            onNewGame={() => setConfirmOpen(true)}
            onCover={() => setView('cover')}
          />
          {state.phase === 'planning' && <Planning key={state.sprint} state={state} dispatch={dispatch} />}
          {state.phase === 'playing' && state.turn && (
            <>
              <div className="play">
                <div className="play__side">
                  <TurnDesk state={state} dispatch={dispatch} reduced={reduced} />
                </div>
                <div className="play__main">
                  <Pocket state={state} dispatch={dispatch} />
                  <Board state={state} focusStoryId={state.turn.storyId} />
                </div>
              </div>
              <LogTable state={state} />
            </>
          )}
          {state.phase === 'review' && <Review state={state} dispatch={dispatch} />}
          {state.phase === 'finished' && <Finished state={state} onNewGame={() => setConfirmOpen(true)} />}
        </main>
        {footer}
      </div>
    )
  }

  return (
    <>
      {content}
      <RulesPanel open={rulesOpen} onClose={closeRules} />
      <ConfirmNewGame open={confirmOpen} onConfirm={newGame} onCancel={() => setConfirmOpen(false)} />
    </>
  )
}
