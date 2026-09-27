import { OctagonAlert } from 'lucide-react'
import { getCard, getStoryCard } from '../game/data'
import { memberName } from '../game/engine'
import type { GameState, StoryState } from '../game/types'
import { Hours, Stamp } from './bits'

export function StoryCard({
  story,
  state,
  compact = false,
  active = false,
  fresh = false,
  showTrail = false,
  hideWorkers = false,
  as: Tag = 'article',
}: {
  story: StoryState
  state: GameState
  compact?: boolean
  active?: boolean
  fresh?: boolean
  showTrail?: boolean
  hideWorkers?: boolean
  as?: 'article' | 'div' | 'li'
}) {
  const card = getStoryCard(story.id)
  const done = story.column === 'done'
  const blocked = !done && story.problems.length > 0
  const classes = [
    'story',
    compact && 'story--compact',
    active && 'is-active',
    done && 'is-done',
    blocked && 'is-blocked',
  ]
    .filter(Boolean)
    .join(' ')
  const workers = story.workers.map((id) => memberName(state, id))

  return (
    <Tag className={classes} data-story={story.id}>
      <header className="story__head">
        <span className="story__no num">#{story.id}</span>
        {done && compact ? (
          <span className="story__done">
            <span className="story__est num">{story.estimate} jam</span>
            <Stamp fresh={fresh} inline />
          </span>
        ) : (
          <span className="story__hours">
            <span className="label">sisa</span>
            <Hours value={story.remaining} trail={showTrail ? story.trail : undefined} est={story.estimate} size={compact ? 'sm' : 'md'} />
          </span>
        )}
      </header>
      <p className="story__text">{card.text}</p>
      {story.problems.length > 0 && (
        <ul className="flags" aria-label="Problem aktif">
          {story.problems.map((p) => (
            <li key={p.uid} className="flag">
              <OctagonAlert aria-hidden="true" />
              {getCard(p.cardId).name}
            </li>
          ))}
        </ul>
      )}
      {!compact && !hideWorkers && workers.length > 0 && !done && (
        <p className="story__workers">
          <span className="label">dikerjakan</span> <span className="hand">{workers.join(', ')}</span>
        </p>
      )}
      {blocked && story.remaining === 0 && <p className="story__note">Jam sudah 0, tunggu Solution</p>}
      {done && !compact && <Stamp fresh={fresh} />}
      {done && <span className="sr-only">Status: DONE</span>}
      {blocked && <span className="sr-only">Status: diblokir Problem</span>}
    </Tag>
  )
}
