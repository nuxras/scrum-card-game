import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CHANCE_DECK, STORIES } from '../game/data'
import { ChanceFace } from './ChanceCard'

/** "Cara Main" side sheet. Non-modal: the board stays readable beside it. */
export function RulesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLElement>(null)
  const returnTo = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      ;(returnTo.current as HTMLElement | null)?.focus?.()
    }
  }, [open, onClose])

  return (
    <aside
      ref={panel}
      className={`rules${open ? ' is-open' : ''}`}
      aria-labelledby="rules-title"
      aria-hidden={!open}
      inert={!open}
      tabIndex={-1}
    >
      <div className="rules__head">
        <h2 id="rules-title" className="page-title">
          Cara Main
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup cara main">
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="rules__body">
        <section>
          <h3>Persiapan</h3>
          <ul>
            <li>Tim 2–6 orang (manual menyarankan 4–6). Urutan nama = urutan giliran.</li>
            <li>12 cerita di Backlog, sudah diurutkan prioritasnya (nomor) dan diestimasi (jam).</li>
            <li>1 sprint = 3 hari, maksimal 3 sprint. Tiap hari, setiap anggota dapat 1 giliran.</li>
            <li>Awal sprint: Sprint Planning, tim commit cerita ke To Do (Plan). Akhir sprint: Review, Plan vs Actual.</li>
          </ul>
        </section>

        <section>
          <h3>Satu giliran</h3>
          <ol>
            <li>
              <strong>Pilih cerita</strong> yang dikerjakan. App menyarankan nomor terkecil yang masih punya jam; boleh
              diganti, termasuk lanjut cerita yang sama.
            </li>
            <li>
              <strong>Lempar 2 dadu.</strong> Totalnya = jam kerja hari itu, dikurangi dari sisa jam cerita (tidak bisa
              minus).
            </li>
            <li>
              <strong>Ambil 1 kartu Peluang</strong> dari tumpukan (sisa deck Event/Problem + 12 Solution), lalu
              jalankan efeknya.
            </li>
          </ol>
        </section>

        <section>
          <h3>Deck kartu Peluang</h3>
          <ul>
            <li>Event (14) dan Problem (10) jadi satu deck berisi 24 kartu, dipakai sepanjang game.</li>
            <li>Kartu Event/Problem yang sudah ditarik dibuang dan tidak bisa keluar lagi sampai deck dikocok ulang.</li>
            <li>Begitu ke-24 kartu habis, semua kartu buangan otomatis dikocok ulang ke deck, kapan pun itu terjadi (tidak menunggu sprint baru).</li>
            <li>12 Solution tidak pernah habis dan selalu ikut di tumpukan. Makin tipis deck Event/Problem, makin sering Solution keluar.</li>
          </ul>
        </section>

        <section>
          <h3>Tiga jenis kartu</h3>
          <dl className="rules__kinds">
            <div>
              <dt className="kchip kchip--event">Event</dt>
              <dd>Efek sekali pakai, langsung berlaku, lalu dibuang.</dd>
            </div>
            <div>
              <dt className="kchip kchip--problem">Problem</dt>
              <dd>
                Menempel di cerita yang sedang dikerjakan dan memblokirnya dari DONE sampai ditutup Solution. Jam tetap
                boleh dikurangi terus.
              </dd>
            </div>
            <div>
              <dt className="kchip kchip--solution">Solution</dt>
              <dd>
                Milik seluruh tim. Disimpan di Kantong Solusi (boleh menumpuk, terbawa antar sprint) dan bisa dipakai kapan
                saja untuk menutup Problem di cerita mana pun. Setelah dipakai, kedua kartu dibuang.
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3>Kapan DONE</h3>
          <p>
            Cerita DONE kalau <strong>sisa jam = 0</strong> dan <strong>tidak ada Problem aktif</strong>. App mengecek ini
            di akhir setiap giliran dan setiap kali Solution dipakai.
          </p>
        </section>

        <section>
          <h3>Game selesai</h3>
          <p>Saat semua 12 cerita DONE, atau Sprint 3 (hari ke-9) selesai, mana yang duluan. Hari dan sprint maju sendiri.</p>
        </section>

        <section>
          <h3>Keputusan aturan di app ini</h3>
          <ul>
            <li>Kartu “you may” (Good Recruit, Guru, Visible Effort): pemain memilih Ya atau Tidak.</li>
            <li>Extra Cost +6 dan Requirements Change +4 ditambahkan ke sisa jam saat ini; estimasi awal tidak berubah.</li>
            <li>Hard Drive Crashed: sisa jam kembali ke estimasi awal yang tercetak di kartu.</li>
            <li>Fairy: sisa jam langsung 0, tapi Problem aktif tetap harus ditutup Solution.</li>
            <li>Birthday: hasil dadu berikutnya setiap anggota −1. Tidak menumpuk kalau muncul lagi.</li>
            <li>Health Problem, Business Trip: giliran berikutnya pemain itu dilewati. Emergency Call: giliran berikutnya semua anggota dilewati. Giliran yang dilewati tetap dihitung.</li>
            <li>Overtime: ambil 1 kartu lagi dan jalankan; kalau dapat Overtime lagi, ambil lagi.</li>
            <li>Guru saat cerita tidak punya Problem: tidak ada efek.</li>
            <li>Cerita di luar Plan boleh ditarik dari Backlog di tengah sprint; tercatat di log.</li>
          </ul>
        </section>

        <details className="rules__deck">
          <summary>Lihat semua kartu ({STORIES.length} cerita, {CHANCE_DECK.length} kartu Peluang)</summary>
          <div className="rules__cards">
            {CHANCE_DECK.map((c) => (
              <ChanceFace key={c.id} cardId={c.id} small />
            ))}
          </div>
        </details>

        <p className="rules__credit">
          Aturan dan kartu dari manual resmi SCRUM CARD GAME v3.1 © Timofey Yevgrashyn,{' '}
          <a href="https://scrumcardgame.com" target="_blank" rel="noreferrer">
            scrumcardgame.com
          </a>
          .
        </p>
      </div>
    </aside>
  )
}
