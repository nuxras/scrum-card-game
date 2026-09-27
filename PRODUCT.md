# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript, built as a static site with no backend and hosted on a free static host (Vercel, Netlify or GitHub Pages; the provider is chosen at deploy time), so classmates can play from one link.

## Users

- **Primary:** Information Systems students at Telkom University doing the PPL/Agile practicum. They play in teams of 2–6, taking turns on one shared laptop. Their job is to play SCRUM CARD GAME correctly and hand in a clean game log with their report. Today they track the game by hand in a spreadsheet, which keeps going wrong: hours don't drop consistently and stories get marked DONE when they shouldn't be.
- **Secondary:** the lecturer, who may be shown the game on a tablet or phone and reads the exported log attached to the report.
- **Maker:** Nugraha (Information Systems, Telkom University), who built it for their own team and for classmates stuck on the same rules.

## Product Purpose

A digital version of SCRUM CARD GAME (Timofey Yevgrashyn, manual v3.1) that replaces spreadsheet bookkeeping. The app enforces the rules, does the math, moves days and sprints forward, and produces a log ready for the report.

Success means a team plays a full game (up to 3 sprints) without anyone correcting a number by hand, and the exported log can go straight into the assignment. Many teams will use the app for the same assignment, so getting the rules right is the top priority, above visuals.

## Positioning

This is not a generic Scrum board or a game loosely "inspired by" Scrum. It runs this exact game: the official 12 stories, 14 Events, 10 Problems and 12 Solutions, applied the way the manual says, plus what the class needs for reporting (turn log, export, Plan vs Actual). What it offers is correct rules and automatic bookkeeping.

## Operating Context

- **One device, pass-and-play.** 2–6 people sit around one laptop and take turns on the same screen. Several people read it at once, from some distance.
- **Session flow:** team setup → per sprint: Sprint Planning (commit stories) → 3 days × one turn per member → Sprint Review (Plan vs Actual) → next sprint. At most 3 sprints (9 days).
- **One turn:** pick a story (auto-suggested, can be overridden) → roll 2 dice → subtract from remaining hours (floor 0) → draw one Chance card → apply its effect.
- **End of day (class handout ritual):** the team discusses "Solusi apa yang akan Anda terapkan dalam kehidupan nyata untuk masalah yang disajikan?" before moving on.
- **Output:** the exported log is attached to the practicum report. The game may also be shown to the lecturer on a tablet or phone.
- **Terminology:** the class handout uses Cerita (Story), Masalah (Problem), Solusi (Solution) and Kartu Peluang (Chance card). Board columns are TODO / IN PROGRESS / DONE. Log columns from the brief: Sprint, Hari, Urutan, Anggota, Story, Dadu, Kartu, Efek, Jam Sisa, Status.

## Capabilities and Constraints

### Game rules (binding, from manual v3.1 and the brief; never simplify)

- Team of 2–6 members (the manual recommends 4–6, maximum 6). Team and member names are free text.
- 12 stories with fixed estimates. 1 sprint = 3 days, maximum 3 sprints. Each member gets one turn per day, so turns per day = team size.
- The dice total is subtracted from the chosen story's remaining hours, floored at 0.
- The Chance deck combines Events, Problems and Solutions and is drawn with replacement: any card can come up again at any time.
- **Event:** one-time effect, applied immediately, then discarded.
- **Problem:** attaches to the story being worked on and blocks it from DONE until a Solution closes it. Work and hour deduction on that story continue while it is blocked.
- **Solution:** belongs to the whole team. If unused, it is kept in the team's collection, with no limit and across sprints. It can close any active Problem on any story at any time, with no theme match needed. Both cards are then discarded.
- **DONE** = remaining hours 0 AND no active Problem.
- Hours and DONE status carry over between sprints and are never reset.
- The game ends when all 12 stories are DONE or when sprint 3, day 3 finishes, whichever comes first. It shows a clear "Game Selesai" message with the reason.
- Days and sprints advance on their own, based on turns played. There is no manual "next day" button.
- Effect rulings fixed by the brief: Fairy sets remaining hours to 0 but does NOT clear Problems. Hard Drive Crashed resets the story to its original estimate. Health Problem and Business Trip skip that player's next turn. Emergency Call makes every member skip their next turn (one round). Birthday gives −1 to everyone's next result. Overtime draws one more card and applies it. Extra Cost adds +6 hours to the story. Requirements Change adds +4 hours. Doing Well adds +4, Home Work +2 and Visible Effort +3 to the last roll. Good Recruit rolls 2 more dice and adds them to the last roll.

### Card data

Use exactly the 12 stories, 14 Events, 10 Problems and 12 Solutions, and their text, from `PROMPT_Scrum_Card_Game_Simulator.md` (they match the official manual). Never invent, rename or reword cards.

### Confirmed features

Landing page with credit · team setup (2–6 rows, add/remove) · TODO / IN PROGRESS / DONE task board showing remaining hours and active Problem badges · active-turn panel (sprint, day, whose turn) · story picker that suggests the lowest-numbered unfinished story and allows manual override · dice roller with rolling animation · Chance draw with 3D card flip and color by card type · team Solution collection with a "Pakai untuk tutup Problem" action that picks which active Problem to close, on any story · automatic rules engine · automatic day/sprint progression and end detection · scrollable turn log · log export (CSV or XLSX) · collapsible rules panel ("Cara Main").

**Sprint Planning + Review (confirmed 2026-09-27):** before each sprint the team commits stories to TODO, which is recorded as the Plan. At the end of the sprint the app shows Plan vs Actual, and this is included in the export. Turns and days still advance automatically within the sprint.

### Technical constraints

- Single device. No backend, database, accounts, login or multi-device sync.
- State lives in memory. Autosaving to localStorage, so a refresh doesn't lose the game, is wanted but optional.
- Responsive: laptop first, and it must still work on tablet and phone for showing the lecturer.
- Build, lint and tests must pass before work counts as done. The rules engine needs automated tests, since correctness is the product.

### Rule decisions (confirmed by the user, 2026-09-27)

- **"You may" effects** (Good Recruit, Guru, Visible Effort): the player chooses Ya/Tidak each time.
- **Extra Cost:** +6 to the story's CURRENT remaining hours (not a change to its estimate). Requirements Change works the same way with +4.
- **Hard Drive Crashed:** remaining hours reset to the story's ORIGINAL printed estimate. All progress is lost; the estimate itself never changes.
- **Birthday:** does not stack. A second Birthday before someone rolls only refreshes their pending −1; it stays −1.

### Build defaults (chosen during the first build, 2026-09-27; not yet confirmed by the user, change on request)

- Guru when the current story has no active Problem: no effect, noted in the log.
- Overtime drawing another Overtime: the chain continues, one more card each time.
- A skipped turn uses up that member's slot for the day and is logged as DILEWATI. Skip flags don't stack: several "skip next turn" cards before that turn still skip one turn.
- Stories outside the Plan may be pulled from Backlog mid-sprint; the log notes it, and they count toward Actual.
- DONE is checked at the end of every turn and whenever a Solution is used, never mid-turn for the story being worked (the Chance card can still change its hours).
- Story suggestion: lowest-numbered committed story that still has hours, so a blocked story at 0 hours is not suggested.
- Sprint Planning shows capacity (members × 3 days × 7) and earlier sprints' Plan vs DONE.
- End-of-day reflection question appears as a dismissible note during the first turn of the next day.
- Export: both XLSX (log, column legend, Plan vs Actual, story status, cards drawn, summary) and CSV (log).

### Lecturer's log format (binding, from the lecturer's "Contoh Log" sheet, 2026-09-27)

The exported log keeps the lecturer's 15 columns in this exact order and wording: Sprint, Hari, Urutan, Anggota, Story #, Dadu 1 (opsional), Dadu 2 (opsional), Total Jam Dari Dadu, Jenis Chance, Nama Chance, Jam Efektif, Jam Story Tersisa, Penyesuaian Jam Story (Jam Story − Jam Efektif), Status Setelah Giliran, Catatan. Skipped turns are rows with dice 0 and a "Kena <kartu>" note, as in the template. The app appends five marked extra columns after them (Efek Kartu ke Jam Story, Jam Story Akhir, Jejak Jam, Problem Aktif di Story, Solution di Kantong) so card effects such as Extra Cost or Hard Drive Crashed stay traceable. Jam Efektif = dice − Birthday + roll bonuses; Penyesuaian = Tersisa − Efektif, floored at 0.

### Hosting (confirmed 2026-09-27)

GitHub Pages at https://nuxras.github.io/scrum-card-game/ (public repo nuxras/scrum-card-game, code only; the manual PDF, class handout and prompt file stay local). Every push to `main` runs tests, lint and build, then deploys.

## Brand Commitments

- **Name:** Scrum Card Game Simulator.
- **Maker credit (required):** "Dibuat oleh Nugraha", clearly visible on the landing page before team setup, ideally in a footer on every screen. The cover label reads "Untuk: yang struggling sama aturan game ini 😄" (wording confirmed by the user, 2026-09-27). It must stay tidy, not tacky.
- **Original game credit:** SCRUM CARD GAME © Timofey (Tim) Yevgrashyn, scrumcardgame.com. The user confirmed (2026-09-27) that the site's terms and their lecturer allow this use as long as it is never sold. The app stays free and non-commercial, credits the author and links the site.
- **Language and voice:** the interface is in Bahasa Indonesia, casual and friendly like one student talking to another, but clear enough for graded coursework. Card and story text stays in the official English, word for word.
- **Visual constraints the user set (recorded, not expanded):** card-type colors follow the original manual: Event grey/blue, Problem red/orange, Solution light blue. The feel should be fun and playful but readable and functional, not over the top. Motion requested: dice roll before the result appears, 3D card flip, light confetti when a story reaches DONE and when the game ends.

## Evidence on Hand

- `PROMPT_Scrum_Card_Game_Simulator.md`: the full brief, rules and authoritative card tables.
- `Scrum_Card_Game_EN.pdf`: official manual v3.1 (English) with printable card artwork, © the author.
- `SCRUM Card Games.pdf` / `SCRUM Card Games.docx`: the class handout in Indonesian (planning, execution, end-of-day reflection, Sprint Review and Retrospective).
- There is no logo, no screenshots, no testimonials, no usage numbers and no lecturer endorsement. Don't make up claims such as "used by N teams".

## Product Principles

1. **Correct rules come first.** Every number on screen must follow the official rules. The rules engine is the product, and where a rule is ambiguous the app says so instead of quietly picking an answer.
2. **The app does the bookkeeping, the team plays.** Arithmetic, blocking, DONE checks and day/sprint progression are automatic. Players only make the choices the game gives them: which story, which Solution, optional effects.
3. **Every change can be explained.** After each roll or card, the team can see what changed and why (hours before → after, and which effect caused it). The log is the record and is ready to put in a report.
4. **Built for one shared screen.** With 2–6 people passing one laptop around, whose turn it is and the current sprint and day are obvious from across the table.
5. **Stay true to the game.** Official card names, text and structure are used word for word, and the original author is credited next to the maker.

## Accessibility & Inclusion

The main screen is read by a group around one laptop, so the turn state, remaining hours and blockers must be readable at a distance. Animations (dice, card flip, confetti) must never block or slow play, and reduced-motion preferences must be respected.
