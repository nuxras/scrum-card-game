---
name: Scrum Card Game Simulator
description: One shared school notebook the team fills in together, turn by turn.
colors:
  paper: "#ffffff"
  paper-shade: "#f3f7fc"
  rule: "#d3e3f4"
  rule-strong: "#a9c6e6"
  margin-line: "#f2a0a0"
  ink: "#1b2559"
  ink-2: "#414b78"
  ink-3: "#5d668c"
  cover: "#0b7a4e"
  cover-deep: "#075c3a"
  stabilo: "#ffe53d"
  stabilo-soft: "#fff3a1"
  event: "#5e6b82"
  event-ink: "#3f4a60"
  event-tint: "#eef1f6"
  problem: "#e4532a"
  problem-ink: "#b0360f"
  problem-tint: "#ffe9e1"
  solution: "#7fd0f5"
  solution-ink: "#0b5f86"
  solution-tint: "#e4f5fd"
  red-pen: "#d63b2f"
  stamp: "#0b7a4e"
typography:
  cover-print:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(34px, 4.8vw, 62px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  display:
    fontFamily: "'Shantell Sans Variable', 'Segoe Print', cursive"
    fontSize: "clamp(30px, 4.2vw, 46px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Shantell Sans Variable', 'Segoe Print', cursive"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
  title:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  card-text:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.08em"
  hand:
    fontFamily: "'Shantell Sans Variable', 'Segoe Print', cursive"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.2
  numeral:
    fontFamily: "'Atkinson Hyperlegible Mono Variable', ui-monospace, 'Cascadia Mono', monospace"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum'"
rounded:
  tick: "4px"
  chip: "6px"
  card: "10px"
  control: "12px"
  panel: "14px"
  bar: "16px"
  label: "18px"
  pill: "999px"
spacing:
  line: "32px"
  gutter: "clamp(16px, 3vw, 40px)"
  margin-x: "56px"
  card-gap: "10px"
  stack: "22px"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
    height: "44px"
  button-hover:
    backgroundColor: "{colors.paper-shade}"
  button-go:
    backgroundColor: "{colors.stabilo}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "52px"
  button-go-hover:
    backgroundColor: "#ffdc0a"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "#253275"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 10px"
    height: "44px"
  button-sm:
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "8px 12px"
    height: "44px"
  line-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "0 4px"
    height: "52px"
  story-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.card-text}"
    rounded: "{rounded.card}"
    padding: "8px 12px 12px"
  chance-card-event:
    backgroundColor: "{colors.event-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px 14px"
  chance-card-problem:
    backgroundColor: "{colors.problem-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px 14px"
  chance-card-solution:
    backgroundColor: "{colors.solution-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px 14px"
  problem-flag:
    backgroundColor: "{colors.problem-ink}"
    textColor: "{colors.paper}"
    padding: "3px 12px 3px 7px"
  kind-chip-problem:
    backgroundColor: "{colors.problem-tint}"
    textColor: "{colors.problem-ink}"
    rounded: "{rounded.chip}"
    padding: "0 8px"
  step-now:
    backgroundColor: "{colors.stabilo}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px 4px 4px"
  decide-panel:
    backgroundColor: "{colors.stabilo-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "14px 16px"
---

# Design System: Scrum Card Game Simulator

## Overview

**Creative North Star: "Buku Tulis Sprint"**

The whole app is one Indonesian school notebook that a team of students fills in together around one laptop. A green cloth-bound cover frames every screen; inside sits a single sheet of cool white ruled paper with pale blue rules every 32px and a red margin line. Everything the game does is written onto that page in navy ballpoint: story cards are index cards, Chance cards are index cards with a coloured top band, a finished story gets a rubber SELESAI stamp, and the one thing that is live right now is swiped with a yellow stabilo.

Density is working-notebook density, not dashboard density: the play screen fits the turn desk, the Kantong Solusi strip, the four-column board and the start of the log into a 1366x768 laptop, read by several people from 50 to 100 cm away. Legibility carries the system. Atkinson Hyperlegible does the printed work, Shantell Sans does the handwriting, and every number sits in tabular figures so hours can be compared at a glance.

The system's central behaviour is visible arithmetic: a number is never silently replaced. The old value stays on the page, struck through in red pen, followed by an arrow and the new value. Depth is paper lying on paper, soft and ink-tinted; nothing glows and nothing floats.

**Key Characteristics:**
- Green cover board (with faint grain) framing one ruled paper sheet with a red margin line.
- Navy ink, never black; stabilo yellow is the only emphasis colour.
- Index-card components with coloured kind bands (Event graphite, Problem red-orange, Solution light blue).
- Handwritten Shantell Sans for titles and people; printed Atkinson for rules, cards and labels; Atkinson Mono for numerals.
- Struck-through red-pen corrections, rubber stamps and hole-punch confetti as the event vocabulary.

## Colors

A cool paper-and-ballpoint palette with one highlighter, one cover green, and a fixed triad of card-kind colours.

### Primary
- **Stabilo Yellow** (stabilo): the highlighter. Marks the one live thing: the current player's name, today's day box, the current step, the active story number, the primary "do this now" button, and text selection.
- **Soft Stabilo** (stabilo-soft): the faded highlighter for something being decided right now: the Ya/Tidak decision panel, stories ticked into the Sprint Plan, and the focused line-input underlay.

### Secondary
- **Notebook Cover Green** (cover): the cover board behind every sheet, the card-deck backs, and the handwritten "Simulator" wordmark. **Deep Cover** (cover-deep) is the stitched spine tape and deck edges.
- **Stamp Green** (stamp): the SELESAI stamp ink, the DONE column count, turn-played checks, and "on track" text. Same pigment as the cover, used as ink.

### Tertiary
- **Event Graphite** (event / event-ink / event-tint): band, label ink and card tint for Event cards; also event notes and skip tags.
- **Problem Red-Orange** (problem / problem-ink / problem-tint): band, label ink and tint for Problem cards. Problem ink is also the blocking colour: the problem flag on a blocked story, a blocked story's border, blocked status, form errors and planning warnings.
- **Solution Sky** (solution / solution-ink / solution-tint): band, label ink and tint for Solution cards, the Kantong Solusi strip, its count and its "Pakai" buttons, and Solution rows in the log.

### Neutral
- **Paper** (paper): the sheet, cards, controls.
- **Shaded Paper** (paper-shade): hover fill, past day boxes, table heads, disabled controls.
- **Pale Blue Rule** (rule) and **Strong Rule** (rule-strong): the ruled lines, table row dividers, header underline, log and fact card borders, scrollbar.
- **Margin Red** (margin-line): the sheet's vertical margin line and the underline under every index card's header.
- **Ballpoint Navy** (ink), **Faded Ink** (ink-2), **Pencil Grey-Blue** (ink-3): body text, secondary text, tertiary metadata and placeholders.
- **Red Pen** (red-pen): only the diagonal strike through a replaced number.

### Named Rules
**The Stabilo Means Now Rule.** Stabilo yellow marks only what is live on this turn (current player, today, current step, active story, the primary action). It is never decoration and never marks a past or future state.

**The Kind Colour Rule.** Event, Problem and Solution colours belong to their card kind. Problem red-orange doubles only as "blocked or wrong"; Event and Solution colours never carry any other meaning.

**The Ink Not Black Rule.** Text and strokes are Ballpoint Navy (#1b2559) and its faded steps. Pure black appears only inside shadows.

## Typography

**Display Font:** Shantell Sans Variable (with Segoe Print, cursive)
**Body Font:** Atkinson Hyperlegible Next Variable (with Segoe UI, system-ui)
**Label/Mono Font:** Atkinson Hyperlegible Mono Variable (with ui-monospace, Cascadia Mono)

**Character:** A student's handwriting over printed forms. Shantell Sans is the pen, Atkinson Hyperlegible is the pre-printed notebook and the card text, both chosen to stay readable across a table. All fonts are self-hosted via @fontsource-variable.

### Hierarchy
- **Cover Print** (800, clamp(34px, 4.8vw, 62px), 0.95, uppercase): only the printed title on the cover label ("SCRUM CARD GAME"), paired with a handwritten green line beneath it.
- **Display** (Shantell 700, clamp(30px, 4.2vw, 46px), 1.1): page titles such as "Giliran Citra", "Sprint Planning", "Game selesai!"; the turn desk title uses clamp(28px, 2.6vw, 34px).
- **Headline** (Shantell 700, 24px, 32px line): section titles sitting exactly on one ruled line (Kantong Solusi, Log Giliran).
- **Title** (Atkinson 800, 22px, 1.15): Chance card names; 17px on small cards.
- **Body** (Atkinson 400, 16px, 1.5): running text; ledes at 17px/1.6 capped at 64ch; card text at 14.5px/1.4.
- **Label** (Atkinson 700 to 800, 11 to 13px, 0.08 to 0.1em, uppercase): printed field names ("TIM", "SPRINT", "HARI", "SISA", "DIKERJAKAN"), board column heads, table heads, card kind tags.
- **Hand** (Shantell 500 to 700, 17 to 23px): anything a person writes: member names, team name, turn order, pen notes in the review.
- **Numeral** (Atkinson Mono, tabular): hours, dice, counts, sprint and day values, log cells. Body text also sets tabular-nums globally.

### Named Rules
**The Hand Is for People Rule.** Shantell Sans writes titles and anything a player wrote (names, team, pen notes). Rules text, card text and field labels stay in printed Atkinson.

**The Printed Field Rule.** An uppercase label always names a field, a column, or the value next to it, like a pre-printed "Nama/Kelas" field. It never sits above a title as a kicker.

## Layout

The page model is the notebook: a green frame (12px padding, 6px under 720px) holding one paper sheet with a 14px corner radius. The sheet is ruled with a 32px line rhythm, and a 2px red margin line sits 56px from the left edge (14px on phones); content starts 16px right of the margin line. Horizontal gutter is clamp(16px, 3vw, 40px). A thin footer in white text on the cover carries the credit.

The sheet opens with a printed "Hari/Tgl" style header: brand, TIM, SPRINT, HARI fields with dotted underlines, nine day boxes grouped S1 to S3 with today circled and highlighted, then the turn order. The play screen below is a two-column grid: a turn desk of minmax(360px, 410px) and a main column, 30px apart, stacked vertically with a 22px gap. The main column puts the Kantong Solusi strip (auto-fill cards, min 196px) above a four-column board (0.9fr 1fr 1fr 0.9fr) separated by hand-ruled 1.5px lines. The ruled log follows 40px below.

Section titles and empty states align to the 32px line. Card lists use a 10px gap; screen stacks use 18 to 28px.

Responsive steps: header text tightens at 1400px; the play grid stacks to one column at 1180px (desk capped at 640px); cover and review columns stack at 900px; the board drops to two columns at 860px and one at 540px; the frame and margin tighten at 720px; the cover label compacts at 520px. The log table scrolls horizontally (min 1000px) instead of reflowing.

## Elevation & Depth

Depth is paper on paper: cards lie on the sheet with soft, ink-tinted drop shadows that read as a slight lift, and the sheet itself sits on the cover with one deeper shadow. There are no glows and no hard offset shadows. State changes add lift: the active story gains an ink ring and the higher lift. Pressing a button pushes it down 2px and flattens its shadow.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 0 rgb(27 37 89 / 0.05), 0 6px 14px -6px rgb(27 37 89 / 0.28)`): resting index cards, buttons, Solution cards, plan pick cards.
- **High Lift** (`box-shadow: 0 2px 0 rgb(27 37 89 / 0.05), 0 16px 30px -12px rgb(27 37 89 / 0.38)`): the active story, the sticky planning bar, the confirm dialog, cards scattered on the cover.
- **Active Ring** (`box-shadow: 0 0 0 2.5px #1b2559, <High Lift>`): the story being worked this turn.
- **Sheet on Cover** (`box-shadow: 0 1px 0 rgb(255 255 255 / 0.6) inset, 0 18px 40px -18px rgb(0 0 0 / 0.45)`): the paper sheet on the green board.
- **Side Sheet** (`box-shadow: -24px 0 48px -24px rgb(0 0 0 / 0.5)`): the Cara Main rules panel sliding in from the right.

### Named Rules
**The Paper Lift Rule.** Shadows are soft, ink-tinted and downward, only on things that are physically paper or plastic on the page (cards, dice, buttons, dialogs). Flat ruled areas (board columns, log, header) carry no shadow.

## Shapes

Soft index-card corners throughout: 10px for story cards, inputs and Solution cards; 12px for controls, Chance cards and notes; 14px for the sheet and inked panels; 16px for the sticky bar and dialog; 18px for the cover label. Pills (999px) are reserved for counts, the step rail and status tags; small chips use 6px and day boxes 4px. The Problem flag has a pennant shape (3px 12px 12px 3px).

Borders are pen strokes: 2px navy for controls, inked panels and the Plan vs Actual table; 1.5px for small buttons, day boxes and ruled dividers; 1px hairlines (ink at 14%) around cards. Dotted 1.5px underlines mark fill-in fields; dashed borders mark notes and pickers.

Rotation is reserved for things placed by hand: the SELESAI stamp (-9deg; -5deg inline), review pen notes (-6deg), the cover label (-0.6deg), and the cards and dice scattered on the cover. Cards in play on the board and desk are never tilted.

## Components

### Buttons
Pen-outlined paper buttons that press into the page.
- **Shape:** gently rounded (12px), 2px navy border, 44px minimum height, weight 700.
- **Default:** paper fill, navy text, Lift shadow; hover shifts to shaded paper.
- **Go:** the one "do this now" action per view, filled stabilo yellow, 18px text, 52px tall (e.g. "Selesai, giliran Dimas", "Mulai main").
- **Ink:** navy fill with white text for secondary commitments such as export; hover lightens to #253275.
- **Quiet:** borderless and shadowless, for header tools and back links; hover tints with 6% ink.
- **Small:** 36px, 1.5px border, 14.5px text; the Solution "Pakai" button uses Solution ink and fills when a Problem is ready to close.
- **Active / Focus / Disabled:** active moves down 2px with a flattened shadow; focus is a 3px navy outline offset 2px; disabled is shaded paper with a pale rule border and pencil text.

### Chips
- **Kind chips:** 6px corners, card-kind tint with kind ink, 12.5px bold, used in the log's Kartu column.
- **Status tags:** pill, 12px 800 letterspaced; DONE green on mint, BLOCKED Problem ink on Problem tint, skip in Event colours, open in faded ink.
- **Problem flag:** a pennant in Problem ink with white text and an alert icon, pinned under a blocked story's text.

### Cards / Containers
- **Story card:** paper index card, 10px corners, 1px ink hairline, Lift; header row (number, "SISA" label, hours) underlined by a 1.5px margin-red line. Active: navy ring, High Lift, raised 2px, story number highlighted in stabilo. Blocked: Problem red-orange border. Done: text faded to 62% with a SELESAI stamp.
- **Chance card:** index card with a 10px coloured top band (7px on small cards), tinted by kind, an outlined uppercase kind tag, 22px 800 name, 15px text. The back is cover green with diagonal stripes and a handwritten mark; it flips over in 3D when drawn.
- **Inked panels:** decision panel (stabilo-soft with 2px ink border, 14px corners), finish export panel and planning bar (paper, 2px ink border).
- **Fact card:** paper with a 1.5px strong-rule border, 12px corners, printed label over a big numeral.

### Inputs / Fields
- **Boxed input and select:** paper, 2px navy border, 10px corners, 44px tall; the select uses an inline navy chevron.
- **Line input:** the notebook's fill-in line: no box, a 2px faded-ink underline, 23px 600 text (handwritten for names). Focus darkens the underline and swipes soft stabilo behind the lower 60% of the line.
- **Errors:** a Problem-tint block with Problem ink text.

### Navigation
The notebook header is the navigation: a printed brand (uppercase with a handwritten green "Simulator"), fill-in fields for TIM, SPRINT and HARI, the nine day boxes, and quiet tool buttons (Cara main, Game baru) pushed right. Below it, the turn order is written by hand: played names get a green check, skipped names are struck through, the current name is larger and highlighted in stabilo. Under 720px the brand hides and the field values shrink.

### Hours in Ink (signature)
Every changed number shows its history: the old value in pencil grey-blue with a 2px red-pen stroke at -14deg drawn left to right (0.32s), an arrow, then the new value written in (fades down 5px, 0.34s after a 0.22s delay). Current hours are Atkinson Mono 800 at 20px (16px small, 40px large), followed by the "/estimate" in pencil.

### SELESAI Stamp (signature)
A rubber stamp in Stamp Green: uppercase 19px 800 at 0.16em tracking, a 3px border with an inner double rule, rotated -9deg, multiply blend and a noise mask for uneven ink. It lands by scaling from 1.6x (0.5s, stamp easing) together with a burst of round hole-punch confetti in rule blue, stabilo, Solution sky and white.

### Dice
Two white 3D cubes (74px; 64px on the desk; 46px small) with navy pips, 16% corner radius and a soft elliptical contact shadow. They tumble onto the page (1.1s), bouncing before settling, the second die 60ms behind.

## Do's and Don'ts

### Do:
- **Do** keep every screen inside the notebook: green cover frame, one ruled paper sheet on a 32px line, red margin line 56px from the left.
- **Do** strike through the old number in red pen and write the new one beside it; never swap a value silently.
- **Do** reserve stabilo yellow (#ffe53d) for the current turn, today, the current step, the active story and the single Go button per view.
- **Do** set every number in Atkinson Hyperlegible Mono with tabular figures, and give every number a printed label ("SISA", "/24", "jam").
- **Do** use Shantell Sans for titles and people's names, and Atkinson Hyperlegible Next for rules, card text and labels.
- **Do** use the soft Lift and High Lift shadows for cards, buttons and dialogs, and a 3px navy focus outline everywhere.
- **Do** use Lucide line icons at 16 to 22px next to text labels.

### Don't:
- **Don't** use stabilo yellow as decoration, a brand fill, or for past or upcoming states.
- **Don't** reuse Event graphite or Solution sky for anything but their card kind; Problem red-orange means only a Problem, a block, or an error.
- **Don't** use pure black text or hard offset shadows; ink is navy and shadows are soft paper lift.
- **Don't** tilt cards that are in play; rotation belongs to stamps, pen notes and the cover's scattered objects.
- **Don't** put an uppercase label above a title as a kicker; labels name a field, a column, or the value beside them.
- **Don't** use emoji or Unicode symbols as icons.
