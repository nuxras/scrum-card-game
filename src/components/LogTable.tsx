import { FileSpreadsheet, FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getCard } from '../game/data'
import { downloadCsv, downloadXlsx } from '../game/export'
import type { GameState, LogEntry } from '../game/types'

export function ExportButtons({ state, big = false }: { state: GameState; big?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const empty = state.log.length === 0
  return (
    <div className="export">
      <button
        type="button"
        className={`btn ${big ? 'btn--go' : 'btn--sm btn--ink'}`}
        disabled={empty || busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          try {
            await downloadXlsx(state)
          } catch {
            setError('File Excel gagal dibuat. Coba lagi, atau unduh CSV.')
          } finally {
            setBusy(false)
          }
        }}
      >
        <FileSpreadsheet aria-hidden="true" /> {busy ? 'Menyiapkan…' : 'Unduh Excel (.xlsx)'}
      </button>
      <button type="button" className={`btn ${big ? '' : 'btn--sm'}`} disabled={empty} onClick={() => downloadCsv(state)}>
        <FileText aria-hidden="true" /> Unduh CSV
      </button>
      {empty && <span className="export__hint">Log masih kosong.</span>}
      {error && (
        <span className="export__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

/** "24 → 17 → 23": every value the story's hours passed through in this row. */
function hoursCell(e: LogEntry): string {
  if (e.kind === 'skip') return '—'
  if (e.trail && e.trail.length > 1) return e.trail.join(' → ')
  return e.remaining != null ? String(e.remaining) : '—'
}

function CardChips({ ids }: { ids: string[] }) {
  if (!ids.length) return <>—</>
  return (
    <span className="kchips">
      {ids.map((id, i) => {
        const card = getCard(id)
        return (
          <span key={i} className={`kchip kchip--${card.kind}`}>
            {card.name}
          </span>
        )
      })}
    </span>
  )
}

export function LogTable({ state, tall = false }: { state: GameState; tall?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null)
  const count = state.log.length

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [count])

  return (
    <section className="log" aria-labelledby="log-title">
      <div className="log__head">
        <h2 id="log-title" className="section-title">
          Log Giliran <span className="log__count num">{count} baris</span>
        </h2>
        <ExportButtons state={state} />
      </div>
      <div ref={scroller} className={`log__scroll${tall ? ' log__scroll--tall' : ''}`} tabIndex={0} aria-label="Tabel log, bisa di-scroll">
        <table className="log__table">
          <thead>
            <tr>
              <th scope="col">Sprint</th>
              <th scope="col">Hari</th>
              <th scope="col">Urutan</th>
              <th scope="col">Anggota</th>
              <th scope="col">Story</th>
              <th scope="col">Dadu</th>
              <th scope="col">Chance</th>
              <th scope="col" className="is-num">
                Jam Efektif
              </th>
              <th scope="col">Jam Story</th>
              <th scope="col">Status</th>
              <th scope="col">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {count === 0 ? (
              <tr>
                <td colSpan={11} className="log__empty">
                  Belum ada giliran. Setiap giliran, lemparan dadu, kartu, dan pemakaian Solution tercatat di sini.
                </td>
              </tr>
            ) : (
              state.log.map((e) => (
                <tr key={e.id} className={`log__row log__row--${e.kind}`}>
                  <td className="num">{e.sprint}</td>
                  <td className="num">{e.day}</td>
                  <td className="num">{e.order ?? '—'}</td>
                  <td className={e.kind === 'solution' ? 'log__team' : 'hand log__member'}>{e.member}</td>
                  <td className="num">{e.storyId != null ? `#${e.storyId}` : '—'}</td>
                  <td className="num log__dice">{e.dice}</td>
                  <td className="log__cards">
                    <CardChips ids={e.cardIds} />
                  </td>
                  <td className="num is-num log__eff">{e.effective ?? '—'}</td>
                  <td className="num log__hours">{hoursCell(e)}</td>
                  <td>
                    <span className={`status status--${e.status.startsWith('DONE') ? 'done' : e.status.includes('BLOCKED') ? 'blocked' : e.kind === 'skip' ? 'skip' : 'open'}`}>
                      {e.status === 'IN PROGRESS (BLOCKED)' ? 'BLOCKED' : e.status}
                    </span>
                  </td>
                  <td className="log__effect">{e.effect}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
