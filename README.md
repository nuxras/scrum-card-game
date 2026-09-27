# Scrum Card Game Simulator

Web app untuk memainkan **SCRUM CARD GAME** (Timofey Yevgrashyn, manual v3.1) bareng tim di satu laptop. App mencatat semuanya: dadu, kartu Peluang, jam sisa, Problem yang memblokir, Solution yang disimpan, progres hari dan sprint, sampai log yang bisa diunduh ke Excel/CSV untuk laporan.

Dibuat oleh **Nugraha** untuk yang struggling sama aturan game ini.

**Main langsung:** https://nuxras.github.io/scrum-card-game/

## Menjalankan di laptop

Butuh [Node.js](https://nodejs.org) versi 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

## Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm test` | Menjalankan tes mesin aturan game (Vitest) |
| `npm run lint` | Cek kode (oxlint) |
| `npm run build` | Build versi produksi ke folder `dist/` |
| `npm run preview` | Menjalankan hasil build secara lokal |

## Online-kan supaya teman sekelas tinggal buka link

Hasil `npm run build` adalah situs statis biasa (folder `dist/`), tanpa backend. Pilih salah satu:

- **Vercel / Netlify:** import folder/repo ini, build command `npm run build`, output directory `dist`.
- **GitHub Pages (yang dipakai sekarang):** setiap push ke branch `main` otomatis dites, di-build, lalu dipasang oleh workflow `.github/workflows/deploy.yml`. Path aset relatif, jadi jalan di sub-path `username.github.io/nama-repo/`.

## Struktur singkat

- `src/game/data.ts`: data resmi 12 cerita dan 36 kartu Peluang (jangan diubah).
- `src/game/engine.ts`: mesin aturan (reducer murni); semua efek kartu, progres hari/sprint, dan cek DONE.
- `src/game/engine.test.ts`: tes aturan. Jalankan `npm test` setelah mengubah mesin.
- `src/game/export.ts`: ekspor log ke CSV dan XLSX.
- `src/components/`, `src/screens/`: tampilan.

Game tersimpan otomatis di browser (localStorage), jadi refresh halaman tidak menghapus permainan.

## Kredit

Aturan dan kartu dari SCRUM CARD GAME © Timofey Yevgrashyn, [scrumcardgame.com](https://scrumcardgame.com). Dipakai untuk keperluan belajar, gratis, tidak diperjualbelikan.
