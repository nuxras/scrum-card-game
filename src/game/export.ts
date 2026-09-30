import { KIND_LABEL, getCard, getStoryCard } from './data'
import { memberName, statusLabel, sumEstimates } from './engine'
import type { GameState, LogEntry } from './types'

type Cell = string | number | null

/** The lecturer's log columns, in the lecturer's order and wording. */
export const LECTURER_COLUMNS = [
  'Sprint',
  'Hari',
  'Urutan',
  'Anggota',
  'Story #',
  'Dadu 1 (opsional)',
  'Dadu 2 (opsional)',
  'Total Jam Dari Dadu',
  'Jenis Chance',
  'Nama Chance',
  'Jam Efektif',
  'Jam Story Tersisa',
  'Penyesuaian Jam Story (Jam Story − Jam Efektif)',
  'Status Setelah Giliran',
  'Catatan',
] as const

/** Extra columns the app adds after the lecturer's, so every number can be traced. */
export const EXTRA_COLUMNS = [
  'Efek Kartu ke Jam Story',
  'Jam Story Akhir',
  'Jejak Jam',
  'Problem Aktif di Story',
  'Solution di Kantong',
  'Sisa Deck Event/Problem',
] as const

export const LOG_HEADERS = [...LECTURER_COLUMNS, ...EXTRA_COLUMNS]

/** What each column means, for the "Keterangan Kolom" sheet. */
export const COLUMN_NOTES: [string, string][] = [
  ['Sprint, Hari, Urutan', 'Kapan giliran terjadi. Urutan = posisi anggota di hari itu (1 = pertama).'],
  ['Anggota', 'Pemain yang mendapat giliran. "Tim" = Solution dipakai dari Kantong Solusi.'],
  ['Story #', 'Nomor cerita yang dikerjakan.'],
  ['Dadu 1, Dadu 2', 'Hasil tiap dadu. 0 kalau giliran dilewati.'],
  ['Total Jam Dari Dadu', 'Dadu 1 + Dadu 2, sebelum efek kartu apa pun.'],
  ['Jenis Chance, Nama Chance', 'Kartu Peluang yang diambil. Overtime bisa memberi lebih dari 1 kartu (ditulis berurutan dengan →).'],
  ['Jam Efektif', 'Jam yang benar-benar mengurangi cerita: Total dadu − 1 (Birthday) + Doing Well 4 / Home Work 2 / Visible Effort 3 (kalau Ya) + dadu Good Recruit (kalau Ya).'],
  ['Jam Story Tersisa', 'Sisa jam cerita sebelum dikerjakan di giliran ini.'],
  ['Penyesuaian Jam Story', 'Jam Story Tersisa − Jam Efektif. Tidak bisa minus; paling kecil 0.'],
  ['Status Setelah Giliran', 'Status cerita di akhir giliran. DONE hanya kalau jam 0 dan tidak ada Problem aktif.'],
  ['Catatan', 'Penjelasan efek giliran, termasuk giliran dilewati dan cerita yang ditarik dari Backlog.'],
  ['Efek Kartu ke Jam Story (tambahan)', 'Kartu yang mengubah jam cerita setelah dikerjakan: Extra Cost +6, Requirements Change +4, Hard Drive Crashed (kembali ke estimasi awal), Fairy (jadi 0).'],
  ['Jam Story Akhir (tambahan)', 'Sisa jam cerita setelah semua efek. Ini angka yang tampil di papan.'],
  ['Jejak Jam (tambahan)', 'Semua nilai yang dilewati jam cerita selama giliran ini, berurutan.'],
  ['Problem Aktif di Story (tambahan)', 'Problem yang masih memblokir cerita setelah giliran.'],
  ['Solution di Kantong (tambahan)', 'Jumlah kartu Solution yang disimpan tim setelah giliran.'],
  ['Sisa Deck Event/Problem (tambahan)', 'Kartu Event/Problem yang masih bisa ditarik (dari 24). Kartu yang sudah ditarik dibuang sampai deck habis lalu dikocok ulang; 12 Solution tidak pernah habis.'],
]

function chanceKinds(e: LogEntry): string {
  return e.cardIds.map((id) => KIND_LABEL[getCard(id).kind].toUpperCase()).join(' → ')
}

function chanceNames(e: LogEntry): string {
  return e.cardIds.map((id) => getCard(id).name).join(' → ')
}

export function logTable(state: GameState): Cell[][] {
  return state.log.map((e) => {
    if (e.kind === 'skip') {
      const reason = e.skipReason ?? e.effect.replace(/^Giliran dilewati \((.*)\)$/, '$1')
      return [e.sprint, e.day, e.order, e.member, null, 0, 0, 0, null, `Dilewati (${reason})`, 0, null, null, 'DILEWATI', `Kena ${reason}, giliran dilewati`, null, null, null, null, e.pocketAfter ?? null, e.deckAfter ?? null]
    }
    if (e.kind === 'solution') {
      const [solutionId, problemId] = e.cardIds
      return [
        e.sprint, e.day, null, 'Tim', e.storyId, null, null, null,
        'SOLUTION (dipakai)', `${getCard(solutionId).name} → menutup ${getCard(problemId).name}`,
        null, e.before ?? e.remaining, null, e.status, e.effect,
        null, e.remaining, null, e.problemsAfter ?? null, e.pocketAfter ?? null, e.deckAfter ?? null,
      ]
    }
    return [
      e.sprint, e.day, e.order, e.member, e.storyId,
      e.dice1 ?? null, e.dice2 ?? null, e.diceTotal ?? null,
      chanceKinds(e), chanceNames(e),
      e.effective ?? null, e.before ?? null, e.afterWork ?? null,
      e.status, e.effect,
      e.adjust || null, e.remaining, e.trail ? e.trail.join(' → ') : null, e.problemsAfter || null, e.pocketAfter ?? null,
      e.deckAfter ?? null,
    ]
  })
}

export function sprintTable(state: GameState): Cell[][] {
  return state.sprints.map((r) => [
    r.sprint,
    r.plannedIds.length,
    r.plannedEstimate,
    r.doneIds.length,
    sumEstimates(r.doneIds),
    r.plannedIds.map((id) => `#${id}`).join(', '),
    r.doneIds.map((id) => `#${id}`).join(', ') || '—',
  ])
}

export function storyTable(state: GameState): Cell[][] {
  return state.stories.map((s) => [
    s.id,
    getStoryCard(s.id).text,
    s.estimate,
    s.remaining,
    statusLabel(s),
    s.problems.map((p) => getCard(p.cardId).name).join(', ') || '—',
    s.doneSprint ? `Sprint ${s.doneSprint} · Hari ${s.doneDay}` : '—',
    s.workers.map((id) => memberName(state, id)).join(', ') || '—',
  ])
}

export function endReasonText(state: GameState): string {
  if (state.endReason === 'all-done') return `Semua 12 cerita DONE (Sprint ${state.sprint}, Hari ${state.day})`
  if (state.endReason === 'time-up') return 'Waktu habis: Sprint 3 sudah selesai'
  return `Masih berjalan (Sprint ${state.sprint}, Hari ${state.day})`
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'tim'
  )
}

export function exportFileName(state: GameState, ext: 'csv' | 'xlsx'): string {
  const date = new Date().toISOString().slice(0, 10)
  return `scrum-card-game_${slug(state.teamName)}_${date}.${ext}`
}

function csvCell(value: Cell): string {
  const text = value == null ? '' : String(value)
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildCsv(state: GameState): string {
  const rows: Cell[][] = [[...LOG_HEADERS], ...logTable(state)]
  // BOM so Excel reads UTF-8 names correctly.
  return '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCsv(state: GameState) {
  download(new Blob([buildCsv(state)], { type: 'text/csv;charset=utf-8' }), exportFileName(state, 'csv'))
}

const HEADER_STYLE = { fontWeight: 'bold', backgroundColor: '#E8F0FA', borderColor: '#A9C6E6' } as const

// Log sheet styled like the lecturer's template: dark header, yellow input cells, peach adjustment column.
const LECTURER_HEADER = { fontWeight: 'bold', backgroundColor: '#1F3864', textColor: '#FFFFFF', wrap: true, alignVertical: 'center' } as const
const EXTRA_HEADER = { fontWeight: 'bold', backgroundColor: '#0B7A4E', textColor: '#FFFFFF', wrap: true, alignVertical: 'center' } as const
const INPUT_COLS = new Set([4, 5, 6]) // Story #, Dadu 1, Dadu 2
const ADJUST_COL = 12 // Penyesuaian Jam Story

function logSheet(state: GameState) {
  const header = [
    ...LECTURER_COLUMNS.map((value) => ({ value, ...LECTURER_HEADER })),
    ...EXTRA_COLUMNS.map((value) => ({ value: `${value} (tambahan)`, ...EXTRA_HEADER })),
  ]
  const body = logTable(state).map((row) =>
    row.map((value, i) => ({
      value: value ?? '',
      wrap: true,
      alignVertical: 'top' as const,
      ...(INPUT_COLS.has(i) ? { backgroundColor: '#FFF6D5' } : i === ADJUST_COL ? { backgroundColor: '#FCE4D6' } : {}),
    })),
  )
  return [header, ...body]
}

function sheetRows(headers: readonly string[], rows: Cell[][]) {
  return [
    headers.map((value) => ({ value, ...HEADER_STYLE })),
    ...rows.map((r) => r.map((value) => ({ value: value ?? '', wrap: true, alignVertical: 'top' as const }))),
  ]
}

/** Every sheet of the report workbook. Shared by the browser download and any Node script. */
export function workbookSheets(state: GameState) {
  const summary: Cell[][] = [
    ['Tim', state.teamName || '—'],
    ['Anggota (urutan giliran)', state.members.map((m) => m.name).join(', ')],
    ['Status game', endReasonText(state)],
    ['Cerita DONE', `${state.stories.filter((s) => s.column === 'done').length} dari 12`],
    ['Total giliran tercatat', state.log.filter((e) => e.kind !== 'solution').length],
    ['Diekspor', new Date().toLocaleString('id-ID')],
    ['Aplikasi', 'Scrum Card Game Simulator, dibuat oleh Nugraha'],
    ['Game asli', 'SCRUM CARD GAME © Timofey Yevgrashyn, scrumcardgame.com'],
  ]
  const cardRows: Cell[][] = state.log
    .flatMap((e) => e.cardIds.map((id) => [e.id, getCard(id).name, KIND_LABEL[getCard(id).kind]]))

  return [
    {
      sheet: 'Log Giliran',
      data: logSheet(state),
      columns: [
        { width: 7 }, { width: 6 }, { width: 8 }, { width: 14 }, { width: 8 }, { width: 10 }, { width: 10 }, { width: 11 },
        { width: 22 }, { width: 30 }, { width: 10 }, { width: 11 }, { width: 18 }, { width: 22 }, { width: 58 },
        { width: 30 }, { width: 11 }, { width: 18 }, { width: 26 }, { width: 11 }, { width: 13 },
      ],
      stickyRowsCount: 1,
    },
    {
      sheet: 'Keterangan Kolom',
      data: sheetRows(['Kolom', 'Arti'], COLUMN_NOTES),
      columns: [{ width: 36 }, { width: 110 }],
    },
    {
      sheet: 'Plan vs Actual',
      data: sheetRows(
        ['Sprint', 'Plan: jumlah cerita', 'Plan: total estimasi (jam)', 'Actual: cerita DONE', 'Actual: total estimasi DONE (jam)', 'Cerita di Plan', 'Cerita DONE'],
        sprintTable(state),
      ),
      columns: [{ width: 8 }, { width: 18 }, { width: 24 }, { width: 18 }, { width: 30 }, { width: 34 }, { width: 34 }],
    },
    {
      sheet: 'Status Cerita',
      data: sheetRows(
        ['#', 'Cerita', 'Estimasi', 'Sisa Jam', 'Status', 'Problem aktif', 'Selesai', 'Dikerjakan oleh'],
        storyTable(state),
      ),
      columns: [{ width: 5 }, { width: 62 }, { width: 10 }, { width: 10 }, { width: 24 }, { width: 30 }, { width: 18 }, { width: 30 }],
    },
    {
      sheet: 'Kartu Diambil',
      data: sheetRows(['No log', 'Kartu', 'Jenis'], cardRows),
      columns: [{ width: 8 }, { width: 24 }, { width: 12 }],
    },
    {
      sheet: 'Ringkasan',
      data: summary.map((r) => [{ value: r[0] ?? '', fontWeight: 'bold' as const }, { value: r[1] ?? '' }]),
      columns: [{ width: 26 }, { width: 70 }],
    },
  ]
}

export async function downloadXlsx(state: GameState) {
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const blob = await writeExcelFile(workbookSheets(state)).toBlob()
  download(blob, exportFileName(state, 'xlsx'))
}
