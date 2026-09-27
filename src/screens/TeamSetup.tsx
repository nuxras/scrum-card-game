import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { MAX_MEMBERS, MIN_MEMBERS } from '../game/data'
import { validateTeam } from '../game/engine'

export function TeamSetup({
  onSubmit,
  onBack,
}: {
  onSubmit: (teamName: string, names: string[]) => void
  onBack: () => void
}) {
  const [teamName, setTeamName] = useState('')
  const [rows, setRows] = useState<{ key: number; name: string }[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({ key: i, name: '' })),
  )
  const [errors, setErrors] = useState<string[]>([])
  const nextKey = useRef(4)
  const list = useRef<HTMLOListElement>(null)

  function update(key: number, name: string) {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, name } : row)))
    if (errors.length) setErrors([])
  }

  function add() {
    if (rows.length >= MAX_MEMBERS) return
    const key = nextKey.current++
    setRows((r) => [...r, { key, name: '' }])
    requestAnimationFrame(() => list.current?.querySelector<HTMLInputElement>(`[data-key="${key}"]`)?.focus())
  }

  function remove(key: number) {
    if (rows.length <= MIN_MEMBERS) return
    setRows((r) => r.filter((row) => row.key !== key))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const names = rows.map((r) => r.name)
    const result = validateTeam(names)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    onSubmit(teamName, names)
  }

  return (
    <form className="setup" onSubmit={submit} noValidate>
      <button type="button" className="btn btn--quiet btn--sm setup__back" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> Sampul
      </button>
      <h1 className="page-title">Anggota Tim</h1>
      <p className="lede">
        Tulis nama tiap anggota ({MIN_MEMBERS}–{MAX_MEMBERS} orang). Urutan di sini jadi urutan giliran setiap hari,
        dimulai dari nomor 1.
      </p>

      <label className="setup__team">
        <span className="label">Nama tim (opsional)</span>
        <input
          className="line-input line-input--team hand"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="mis. Kelompok 3"
          maxLength={40}
          autoComplete="off"
        />
      </label>

      <ol ref={list} className="setup__list">
        {rows.map((row, i) => (
          <li key={row.key} className="setup__row">
            <span className="setup__n num" aria-hidden="true">
              {i + 1}
            </span>
            <input
              data-key={row.key}
              className="line-input hand"
              value={row.name}
              onChange={(e) => update(row.key, e.target.value)}
              placeholder={`Nama anggota ${i + 1}`}
              aria-label={`Nama anggota ${i + 1}`}
              maxLength={24}
              autoComplete="off"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => remove(row.key)}
              disabled={rows.length <= MIN_MEMBERS}
              aria-label={`Hapus anggota ${i + 1}`}
              title={rows.length <= MIN_MEMBERS ? `Minimal ${MIN_MEMBERS} anggota` : 'Hapus baris'}
            >
              <X aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>

      <button type="button" className="btn btn--sm setup__add" onClick={add} disabled={rows.length >= MAX_MEMBERS}>
        <Plus aria-hidden="true" /> {rows.length >= MAX_MEMBERS ? `Sudah ${MAX_MEMBERS} orang (maksimal)` : 'Tambah anggota'}
      </button>

      {errors.length > 0 && (
        <ul className="error-list" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="setup__foot">
        <button type="submit" className="btn btn--go">
          Lanjut ke Sprint Planning <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
