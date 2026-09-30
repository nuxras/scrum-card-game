// Official card data from SCRUM CARD GAME manual v3.1 (© Timofey Yevgrashyn,
// scrumcardgame.com), as listed in PROMPT_Scrum_Card_Game_Simulator.md.
// Never add, rename or reword cards.

export interface StoryCard {
  id: number
  text: string
  estimate: number
}

export type EventEffect =
  | 'skipSelf'
  | 'goodRecruit'
  | 'guru'
  | 'visibleEffort'
  | 'doingWell'
  | 'homeWork'
  | 'birthday'
  | 'fairy'
  | 'overtime'
  | 'requirementsChange'
  | 'emergencyCall'
  | 'hardDriveCrashed'
  | 'extraCost'

export type CardKind = 'event' | 'problem' | 'solution'

export interface ChanceCard {
  id: string
  kind: CardKind
  name: string
  text: string
  effect?: EventEffect
}

export const STORIES: readonly StoryCard[] = [
  { id: 1, text: 'Users can exchange emails securely with pre-defined recipients.', estimate: 24 },
  { id: 2, text: 'Users can send large files securely.', estimate: 21 },
  { id: 3, text: 'Users can set time limits on emails for reading.', estimate: 27 },
  { id: 4, text: 'Users can send emails securely to unspecified recipients.', estimate: 30 },
  { id: 5, text: 'Administrators of organizations can monitor emails.', estimate: 16 },
  { id: 6, text: 'Each organization can set security policy and define recipients groups.', estimate: 24 },
  { id: 7, text: 'Users can manage their emails effectively.', estimate: 43 },
  { id: 8, text: 'Users and administrators can backup emails securely.', estimate: 23 },
  { id: 9, text: 'Users and administrators can delete emails completely.', estimate: 36 },
  { id: 10, text: 'Users can access emails from mobile.', estimate: 68 },
  { id: 11, text: 'Users can send short messages securely to each other.', estimate: 28 },
  { id: 12, text: "Users don't want to receive spam-letters.", estimate: 24 },
]

const EVENTS: ChanceCard[] = [
  { id: 'e-health-problem', kind: 'event', name: 'Health Problem', text: 'Skip your next turn.', effect: 'skipSelf' },
  { id: 'e-good-recruit', kind: 'event', name: 'Good Recruit', text: 'You may roll 2 dice now and add to the last roll.', effect: 'goodRecruit' },
  { id: 'e-guru', kind: 'event', name: 'Guru', text: 'You may immediately remove one Problem card from current Story.', effect: 'guru' },
  { id: 'e-visible-effort', kind: 'event', name: 'Visible Effort', text: 'You may add 3 points to the previous result.', effect: 'visibleEffort' },
  { id: 'e-doing-well', kind: 'event', name: 'Doing Well', text: 'Add 4 to the last roll.', effect: 'doingWell' },
  { id: 'e-home-work', kind: 'event', name: 'Home Work', text: 'You worked well at home, add 2 points to the last roll.', effect: 'homeWork' },
  { id: 'e-birthday', kind: 'event', name: 'Birthday', text: "It's your birthday today. Subtract 1 point from everybody's next result.", effect: 'birthday' },
  { id: 'e-fairy', kind: 'event', name: 'Fairy', text: 'A fairy helped you. A card in progress is instantly finished.', effect: 'fairy' },
  { id: 'e-overtime', kind: 'event', name: 'Overtime', text: 'You worked overtime. Draw another card and follow its instructions.', effect: 'overtime' },
  { id: 'e-requirements-change', kind: 'event', name: 'Requirements Change', text: 'Product Owner decided to make changes to the project, so this story will take 4 points more.', effect: 'requirementsChange' },
  { id: 'e-emergency-call', kind: 'event', name: 'Emergency Call', text: 'An emergency call. Everyone skips next turn.', effect: 'emergencyCall' },
  { id: 'e-hard-drive-crashed', kind: 'event', name: 'Hard Drive Crashed', text: 'Hard drive crashed. Remove all progress from a card in progress.', effect: 'hardDriveCrashed' },
  { id: 'e-business-trip', kind: 'event', name: 'Business Trip', text: 'You are sent on a business trip, skip next turn.', effect: 'skipSelf' },
  { id: 'e-extra-cost', kind: 'event', name: 'Extra Cost', text: 'Your work costs more than planned. Add 6 points to the story estimation.', effect: 'extraCost' },
]

const PROBLEMS: ChanceCard[] = [
  { id: 'p-bad-quality', kind: 'problem', name: 'Bad Quality', text: 'You cannot finish the story because the quality is inadequate.' },
  { id: 'p-bad-mood', kind: 'problem', name: 'Bad Mood', text: "Today you're upset, so you're too lazy to work." },
  { id: 'p-unclear-spec', kind: 'problem', name: 'Unclear Spec', text: 'The specification is not clear enough for you.' },
  { id: 'p-bad-communication', kind: 'problem', name: 'Bad Communication', text: "You cannot communicate well with other team members, they just don't get you." },
  { id: 'p-unsatisfied-users', kind: 'problem', name: 'Unsatisfied Users', text: 'You feel that users are not satisfied.' },
  { id: 'p-poor-skills', kind: 'problem', name: 'Poor Skills', text: "You're not skilled enough to finish the work." },
  { id: 'p-data-is-missing', kind: 'problem', name: 'Data is Missing', text: "You can't work with the story, as you don't have important data from Product Owner." },
  { id: 'p-technical-obstacle', kind: 'problem', name: 'Technical Obstacle', text: 'Your work is blocked by a technical obstacle.' },
  { id: 'p-unstable-system', kind: 'problem', name: 'Unstable System', text: 'System is very unstable. You test with major difficulties.' },
  { id: 'p-integration-issues', kind: 'problem', name: 'Integration Issues', text: "Your colleague provided you with the component, which is different from what you expected. You can't proceed." },
]

const SOLUTIONS: ChanceCard[] = [
  { id: 's-get-some-rest', kind: 'solution', name: 'Get Some Rest', text: 'Get some rest to refresh your mind.' },
  { id: 's-extra-member', kind: 'solution', name: 'Extra Member', text: 'Add another member to the team. Throw dice at any moment you want.' },
  { id: 's-specialist', kind: 'solution', name: 'Specialist', text: 'Engage a specialist.' },
  { id: 's-insight', kind: 'solution', name: 'Insight', text: 'Apply your insight.' },
  { id: 's-skilled-member', kind: 'solution', name: 'Skilled Member', text: 'Involve skilled team member from other team.' },
  { id: 's-automated-testing', kind: 'solution', name: 'Automated Testing', text: 'Introduce automated testing.' },
  { id: 's-communications', kind: 'solution', name: 'Communications', text: 'Enhance communications.' },
  { id: 's-collaboration', kind: 'solution', name: 'Collaboration', text: 'Get the team together with Product Owner and exchange important information.' },
  { id: 's-involve-boss', kind: 'solution', name: 'Involve Boss', text: 'Your boss is ready to take a part of the work.' },
  { id: 's-share-goals', kind: 'solution', name: 'Share Goals', text: 'Get the team together and share the key project goals.' },
  { id: 's-pair-programming', kind: 'solution', name: 'Pair Programming', text: 'Apply pair programming.' },
  { id: 's-enhance-skills', kind: 'solution', name: 'Enhance Skills', text: 'Training for raising the level of your skill.' },
]

/** Every Chance card once (for reference lists). */
export const CHANCE_DECK: readonly ChanceCard[] = [...EVENTS, ...PROBLEMS, ...SOLUTIONS]

/**
 * Deck rule (lecturer, 2026-09-30): the 24 Event + Problem cards form one deck for the whole
 * game. A drawn card goes to the discard pile; when the deck runs out it is reshuffled from the
 * discard pile, at any point in a sprint. The 12 Solutions never run out and keep a fixed
 * 12-in-36 (1/3) chance on every draw, independent of the deck (user's choice, 2026-09-30).
 */
export const EVENT_PROBLEM_IDS: readonly string[] = [...EVENTS, ...PROBLEMS].map((c) => c.id)
export const SOLUTION_IDS: readonly string[] = SOLUTIONS.map((c) => c.id)

const CARD_INDEX = new Map(CHANCE_DECK.map((card) => [card.id, card]))

export function getCard(id: string): ChanceCard {
  const card = CARD_INDEX.get(id)
  if (!card) throw new Error(`Unknown card: ${id}`)
  return card
}

export function getStoryCard(id: number): StoryCard {
  const story = STORIES.find((s) => s.id === id)
  if (!story) throw new Error(`Unknown story: ${id}`)
  return story
}

export const DAYS_PER_SPRINT = 3
export const MAX_SPRINTS = 3
export const MIN_MEMBERS = 2
export const MAX_MEMBERS = 6

export const KIND_LABEL: Record<CardKind, string> = {
  event: 'Event',
  problem: 'Problem',
  solution: 'Solution',
}
