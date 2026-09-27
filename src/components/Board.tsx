import { useEffect, useRef, useState } from 'react'
import type { Column, GameState } from '../game/types'
import { StoryCard } from './StoryCard'
import { punchFrom } from './confetti'

const COLUMNS: { id: Column; title: string; empty: string }[] = [
  { id: 'backlog', title: 'Backlog', empty: 'Semua cerita sudah masuk sprint.' },
  { id: 'todo', title: 'To Do', empty: 'Belum ada yang menunggu.' },
  { id: 'inprogress', title: 'In Progress', empty: 'Belum ada yang dikerjakan.' },
  { id: 'done', title: 'Done', empty: 'Belum ada yang selesai.' },
]

/** Story ids that turned DONE since the previous render, for the stamp + confetti moment. */
function useFreshlyDone(state: GameState): Set<number> {
  const prev = useRef<Set<number> | null>(null)
  const [fresh, setFresh] = useState<Set<number>>(new Set())
  const doneKey = state.stories
    .filter((s) => s.column === 'done')
    .map((s) => s.id)
    .join(',')

  useEffect(() => {
    const now = new Set(doneKey ? doneKey.split(',').map(Number) : [])
    if (prev.current) {
      const added = [...now].filter((id) => !prev.current!.has(id))
      if (added.length) {
        setFresh(new Set(added))
        requestAnimationFrame(() => {
          for (const id of added) punchFrom(document.querySelector(`.board [data-story="${id}"]`))
        })
        const t = setTimeout(() => setFresh(new Set()), 1400)
        prev.current = now
        return () => clearTimeout(t)
      }
    }
    prev.current = now
  }, [doneKey])

  return fresh
}

export function Board({ state, focusStoryId }: { state: GameState; focusStoryId: number | null }) {
  const fresh = useFreshlyDone(state)
  const lastSeq = state.turnSeq

  return (
    <section className="board" aria-labelledby="board-title">
      <h2 id="board-title" className="sr-only">
        Papan tugas
      </h2>
      {COLUMNS.map((col) => {
        const stories = state.stories.filter((s) => s.column === col.id)
        return (
          <div key={col.id} className={`board__col board__col--${col.id}`}>
            <h3 className="board__head">
              <span>{col.title}</span>
              <span className="board__count num">{stories.length}</span>
            </h3>
            {stories.length === 0 ? (
              <p className="board__empty">{col.empty}</p>
            ) : (
              <ul className="board__list">
                {stories.map((s) => (
                  <StoryCard
                    key={s.id}
                    as="li"
                    story={s}
                    state={state}
                    compact={col.id === 'backlog' || col.id === 'done'}
                    active={s.id === focusStoryId}
                    fresh={fresh.has(s.id)}
                    showTrail={s.trailTurn >= lastSeq - 1}
                  />
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </section>
  )
}
