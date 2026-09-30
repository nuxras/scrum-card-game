import { getCard } from './data'
import { sumEstimates } from './engine'
import type { GameState, LogEntry, SprintRecord } from './types'

/**
 * Report sheets built from the game log: a Sprint Review & Retrospective page per sprint
 * (facts filled in automatically, yellow boxes left for the team's own discussion) and a
 * group identity page. Nothing here is invented: every fact comes from the log.
 */

type XCell = {
  value: string | number
  fontWeight?: 'bold'
  fontSize?: number
  textColor?: string
  backgroundColor?: string
  wrap?: boolean
  alignVertical?: 'top' | 'center'
  height?: number
  borderStyle?: 'thin'
  borderColor?: string
} | null

const NAVY = '#1F3864'
const FACT_BG = '#EEF4FB'
const INPUT_BG = '#FFF6D5'
const SUB_BG = '#DCE6F2'
const BORDER = { borderStyle: 'thin' as const, borderColor: '#C9D6E8' }

const title = (text: string, side = ''): XCell[] => [
  { value: text, fontWeight: 'bold', fontSize: 14 },
  { value: side, fontWeight: 'bold', fontSize: 12 },
]
const band = (left: string, right: string): XCell[] => [
  { value: left, fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: NAVY, alignVertical: 'center', height: 22 },
  { value: right, fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: NAVY, alignVertical: 'center' },
]
const sub = (text: string): XCell[] => [
  { value: text, fontWeight: 'bold', backgroundColor: SUB_BG, ...BORDER },
  { value: '', backgroundColor: SUB_BG, ...BORDER },
]
const fact = (label: string, text: string): XCell[] => [
  { value: label, fontWeight: 'bold', wrap: true, alignVertical: 'top', ...BORDER },
  { value: text, wrap: true, alignVertical: 'top', backgroundColor: FACT_BG, ...BORDER },
]
const input = (label: string): XCell[] => [
  { value: label, fontWeight: 'bold', wrap: true, alignVertical: 'top', height: 54, ...BORDER },
  { value: '', wrap: true, alignVertical: 'top', backgroundColor: INPUT_BG, ...BORDER },
]
const blank = (): XCell[] => [null, null]

const ids = (list: number[]) => list.map((id) => `#${id}`).join(', ')

function countNames(names: string[]): string {
  const counts = new Map<string, number>()
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1)
  return [...counts].map(([n, c]) => (c > 1 ? `${n} (${c}×)` : n)).join(', ')
}

/** Where a planned story stood at the end of its sprint, from the log. */
function standing(state: GameState, sprint: number, storyId: number): string {
  const rows = state.log.filter((e) => e.storyId === storyId && e.sprint <= sprint && e.remaining != null)
  const last = rows.at(-1)
  const touched = rows.some((e) => e.sprint === sprint)
  if (!last) return `#${storyId} (belum dikerjakan)`
  const parts = [`sisa ${last.remaining} jam`]
  if (last.problemsAfter) parts.push(`diblokir ${last.problemsAfter}`)
  if (!touched) parts.push('tidak disentuh sprint ini')
  return `#${storyId} (${parts.join(', ')})`
}

function notableEvents(rows: LogEntry[]): string[] {
  const out: string[] = []
  for (const e of rows) {
    if (e.kind !== 'turn') continue
    if (e.adjust) out.push(`Hari ${e.day} · ${e.member}: ${e.adjust} di #${e.storyId}`)
    if (e.effect.includes('dikocok ulang')) out.push(`Hari ${e.day} · ${e.member}: deck Event/Problem habis dan dikocok ulang`)
    for (const id of e.cardIds) {
      const name = getCard(id).name
      if (name === 'Emergency Call') out.push(`Hari ${e.day} · ${e.member}: Emergency Call, semua anggota melewatkan giliran berikutnya`)
      if (name === 'Birthday') out.push(`Hari ${e.day} · ${e.member}: Birthday, hasil dadu berikutnya semua anggota −1`)
    }
  }
  return out
}

function sprintBlock(state: GameState, r: SprintRecord, isLast: boolean): XCell[][] {
  const rows = state.log.filter((e) => e.sprint === r.sprint)
  const turns = rows.filter((e) => e.kind === 'turn')
  const doneH = sumEstimates(r.doneIds)
  const extra = r.doneIds.filter((id) => !r.plannedIds.includes(id))
  const unfinished = r.plannedIds.filter((id) => !r.doneIds.includes(id))
  const problems = turns.flatMap((e) => e.cardIds).filter((id) => getCard(id).kind === 'problem').map((id) => getCard(id).name)
  const solutions = rows
    .filter((e) => e.kind === 'solution')
    .map((e) => `${getCard(e.cardIds[0]).name} → ${getCard(e.cardIds[1]).name} (#${e.storyId})`)
  const skips = rows.filter((e) => e.kind === 'skip').map((e) => `${e.member} (Hari ${e.day}, ${e.skipReason ?? 'dilewati'})`)
  const effective = turns.reduce((sum, e) => sum + (e.effective ?? 0), 0)
  const pocketEnd = rows.at(-1)?.pocketAfter
  const events = notableEvents(rows)
  const diffN = r.doneIds.length - r.plannedIds.length
  const diffH = doneH - r.plannedEstimate
  const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

  return [
    band(`SPRINT ${r.sprint}`, `Hari 1–3 · ${turns.length} giliran dimainkan, ${skips.length} dilewati`),
    sub('SPRINT REVIEW'),
    fact('Plan (commitment)', `${r.plannedIds.length} cerita (${ids(r.plannedIds)}) · ${r.plannedEstimate} jam estimasi`),
    fact('Actual (DONE)', r.doneIds.length ? `${r.doneIds.length} cerita (${ids(r.doneIds)}) · ${doneH} jam estimasi` : '0 cerita · 0 jam'),
    fact('Selisih Actual − Plan', `${signed(diffN)} cerita · ${signed(diffH)} jam estimasi`),
    ...(extra.length ? [fact('DONE di luar Plan', `${ids(extra)} (ditarik dari Backlog di tengah sprint)`)] : []),
    fact('Belum selesai di akhir sprint', unfinished.length ? unfinished.map((id) => standing(state, r.sprint, id)).join('; ') : 'Semua cerita di Plan DONE'),
    fact('Jam efektif tim', `${effective} jam dari ${turns.length} giliran (rata-rata ${turns.length ? (effective / turns.length).toFixed(1) : 0} jam per giliran)`),
    fact('Problem yang muncul', problems.length ? countNames(problems) : 'Tidak ada'),
    fact('Solution yang dipakai', solutions.length ? solutions.join('; ') : 'Tidak ada'),
    fact('Solution tersimpan di akhir sprint', `${pocketEnd ?? 0} kartu`),
    fact('Giliran dilewati', skips.length ? skips.join('; ') : 'Tidak ada'),
    fact('Kejadian penting', events.length ? events.join('\n') : 'Tidak ada'),
    input('Kenapa hasil beda dari Plan? (diisi kelompok)'),
    sub('SPRINT RETROSPECTIVE'),
    input('Apa yang berjalan baik? (diisi kelompok)'),
    input('Apa yang perlu diperbaiki? (diisi kelompok)'),
    input(isLast ? 'Pelajaran untuk proyek nyata (diisi kelompok)' : 'Rencana untuk sprint berikutnya (diisi kelompok)'),
    input('Solusi nyata untuk Problem yang muncul (diisi kelompok)'),
    blank(),
  ]
}

export function reviewRetroSheet(state: GameState): XCell[][] {
  const out: XCell[][] = [
    title('SPRINT REVIEW & SPRINT RETROSPECTIVE', state.teamName || ''),
    [
      { value: 'Petunjuk', fontWeight: 'bold', alignVertical: 'top' },
      {
        value:
          'Kotak biru terisi otomatis dari log permainan. Kotak kuning diisi kelompok setelah diskusi di akhir setiap sprint (Sprint Review lalu Sprint Retrospective).',
        wrap: true,
      },
    ],
    blank(),
  ]
  state.sprints.forEach((r, i) => out.push(...sprintBlock(state, r, i === state.sprints.length - 1)))

  if (state.sprints.length > 0) {
    const planN = state.sprints.reduce((s, r) => s + r.plannedIds.length, 0)
    const doneN = state.stories.filter((s) => s.column === 'done').length
    const velocity = state.sprints.map((r) => `Sprint ${r.sprint}: ${sumEstimates(r.doneIds)} jam`).join(' · ')
    out.push(
      band('KESIMPULAN GAME', state.endReason === 'all-done' ? 'Semua 12 cerita DONE' : state.endReason === 'time-up' ? 'Waktu habis setelah Sprint 3' : 'Game belum selesai'),
      fact('Total', `Plan ${planN} cerita (akumulasi per sprint) · DONE ${doneN} dari 12 cerita`),
      fact('Velocity (jam estimasi DONE)', velocity),
      input('Refleksi akhir kelompok (diisi kelompok)'),
    )
  }
  return out
}

export function identitySheet(state: GameState): XCell[][] {
  const head = (value: string): XCell => ({ value, fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: NAVY, ...BORDER })
  return [
    [{ value: 'IDENTITAS KELOMPOK', fontWeight: 'bold', fontSize: 14 }, null, null, null],
    [{ value: 'Kelompok', fontWeight: 'bold' }, state.teamName ? { value: state.teamName } : { value: '', backgroundColor: INPUT_BG }, null, null],
    [{ value: 'Kelas', fontWeight: 'bold' }, { value: '', backgroundColor: INPUT_BG }, null, null],
    [{ value: 'Tanggal ekspor', fontWeight: 'bold' }, { value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }, null, null],
    [null, null, null, null],
    [head('Urutan Giliran'), head('Nickname (di log)'), head('Nama Lengkap'), head('NIM')],
    ...state.members.map((m, i): XCell[] => [
      { value: i + 1, ...BORDER },
      { value: m.name, ...BORDER },
      { value: '', backgroundColor: INPUT_BG, ...BORDER },
      { value: '', backgroundColor: INPUT_BG, ...BORDER },
    ]),
    [null, null, null, null],
    [{ value: 'Kotak kuning diisi kelompok.', textColor: '#5D668C' }, null, null, null],
  ]
}
