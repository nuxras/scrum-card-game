import { ArrowRight, BookOpen, Play } from 'lucide-react'
import { ChanceFace } from '../components/ChanceCard'
import { Stamp } from '../components/bits'
import type { GameState } from '../game/types'

function DieFace({ n }: { n: number }) {
  const pips: Record<number, number[]> = { 3: [0, 4, 8], 5: [0, 2, 4, 6, 8] }
  return (
    <span className="cover-die" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={pips[n].includes(i) ? 'pip' : 'pip pip--off'} />
      ))}
    </span>
  )
}

export function Cover({
  saved,
  onStart,
  onContinue,
  onRules,
}: {
  saved: GameState | null
  onStart: () => void
  onContinue: () => void
  onRules: () => void
}) {
  const savedLabel = saved
    ? saved.phase === 'finished'
      ? 'Lihat hasil game terakhir'
      : `Lanjutkan ${saved.teamName || 'game'}: Sprint ${saved.sprint}${saved.phase === 'planning' ? ', Planning' : saved.phase === 'review' ? ', Review' : ` · Hari ${saved.day}`}`
    : null

  return (
    <div className="cover">
      <main className="cover__main">
        <div className="cover__label">
          <h1 className="cover__title">
            <span className="cover__title-print">Scrum Card Game</span>
            <span className="cover__title-hand hand">Simulator</span>
          </h1>
          <dl className="cover__fields">
            <div>
              <dt>Dibuat oleh</dt>
              <dd className="hand">Nugraha</dd>
            </div>
            <div>
              <dt>Untuk</dt>
              <dd className="hand">yang struggling sama aturan game ini 😄</dd>
            </div>
            <div>
              <dt>Mapel</dt>
              <dd className="hand">PPL · Agile</dd>
            </div>
          </dl>
        </div>

        <div className="cover__intro">
          <p>
            Main SCRUM CARD GAME bareng tim di satu laptop. App ini yang mencatat: lempar dadu, ambil kartu Peluang, jam
            sisa turun sendiri, Problem memblokir, Solution disimpan, hari dan sprint maju sendiri. Di akhir, log siap
            diunduh ke Excel untuk laporan.
          </p>
          <div className="cover__actions">
            {saved && (
              <button type="button" className="btn btn--go" onClick={onContinue}>
                <Play aria-hidden="true" /> {savedLabel}
              </button>
            )}
            <button type="button" className={saved ? 'btn' : 'btn btn--go'} onClick={onStart}>
              {saved ? 'Mulai game baru' : 'Mulai main'} <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--quiet cover__rules" onClick={onRules}>
              <BookOpen aria-hidden="true" /> Cara main
            </button>
          </div>
          <p className="cover__facts">2–6 pemain · 12 cerita · 3 sprint × 3 hari · deck 24 Event/Problem + 12 Solution</p>
        </div>
      </main>

      <div className="cover__desk" aria-hidden="true">
        <div className="cover__story">
          <span className="cover__story-no num">#5</span>
          <span className="cover__story-hours num">
            <s className="hours__old">9</s>
            <span className="hours__arrow">→</span>0<small>/16</small>
          </span>
          <p>Administrators of organizations can monitor emails.</p>
          <Stamp />
        </div>
        <div className="cover__card cover__card--problem">
          <ChanceFace cardId="p-unclear-spec" small />
        </div>
        <div className="cover__card cover__card--solution">
          <ChanceFace cardId="s-pair-programming" small />
        </div>
        <div className="cover__dice">
          <DieFace n={5} />
          <DieFace n={3} />
        </div>
      </div>
    </div>
  )
}
