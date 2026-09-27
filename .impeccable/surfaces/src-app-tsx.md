---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface: Scrum Card Game Simulator (whole app)

**Mode:** Operate. The team completes turns correctly and ends with a report-ready log. The landing is the notebook cover, part of the app, not a marketing page.

**Audience & job:** 2–6 Telkom University IS students around one laptop (50–100 cm away), passing it turn by turn; the lecturer reads the export. Must not feel like an office tool (Jira/Trello) or a casino.

**Flow:** Sampul (landing + credit) → Anggota tim (setup) → Sprint Planning → play (3 days × members) → Sprint Review (Plan vs Actual) → … → Game Selesai → export.

## Direction contract

THESIS: The whole game is one shared buku tulis the team fills in together; every number is struck through and rewritten, never silently replaced. Refuses the kanban-SaaS board with a status sidebar.

OWN-WORLD: Cool white ruled paper, pale blue rules, red margin line; navy ballpoint ink; stabilo strokes as the only emphasis (yellow = active turn); index cards with coloured top bands (Event graphite, Problem red-orange, Solution light blue); SELESAI rubber stamp in ink; hole-punch confetti; green notebook cover with a "Nama/Kelas" label. Rounded card corners, paper-lift shadows.

STORY: The team sees whose turn it is and what the roll and card did to which story, trusts the numbers because each change leaves a trace, and plays three sprints with planning and review, then exports.

FIRST VIEWPORT: Header printed like "Hari/Tgl" fields: Sprint · Hari, nine day boxes with today circled, turn order with the current name highlighted. Left ~40%: turn desk (step rail, current story card, two large dice beside the drawn card, primary action at its foot, all inside 1366x768). Right ~60%: Kantong Solusi as a strip of Solution index cards, then four ruled columns Backlog/TODO/In Progress/Done. Below: ruled log.

FORM: Indonesian school notebook + stabilo + stamps; 5th of 7 on my ordered list; seed d86aadb6.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

**Signature interaction:** a turn resolves as ink: dice tumble onto the page, the story's hours are struck through and rewritten, the index card flips out of the card box; DONE lands a SELESAI stamp with hole-punch confetti.

**Raises kept from declined challengers:** fixed desk topology during a turn (PC-98) · every number carries its label, In Progress cards show who works them (Busytown) · visible arithmetic (Alphabet storm) · tabular digits, resets and +hours as visible events (Nixie) · only the active turn at full intensity (Cracktro) · one always-visible 9-day time axis (Deep dive).

**Build path:** code-led (no image generation in this harness).

## Unresolved
- Guru with no active Problem on the current story → no effect, logged (build default; tell user).
- Overtime chaining → allowed, each extra card applied (build default; tell user).
- Mid-sprint pull from Backlog → allowed, noted in the log (not in Plan).

**Amended after finish review (2026-09-27):** Kantong Solusi moved from below the board to a strip above it, so a fresh Problem can be closed without scrolling (reviewer accepted as an adaptation).
