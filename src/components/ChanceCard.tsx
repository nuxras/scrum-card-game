import { useEffect, useState } from 'react'
import { KIND_LABEL, getCard } from '../game/data'

/** A Chance card as an index card: coloured top band by kind, official English text. */
export function ChanceFace({ cardId, small = false }: { cardId: string; small?: boolean }) {
  const card = getCard(cardId)
  return (
    <div className={`chance chance--${card.kind}${small ? ' chance--sm' : ''}`}>
      <div className="chance__band" aria-hidden="true" />
      <div className="chance__head">
        <h3 className="chance__name">{card.name}</h3>
        <span className="chance__kind">{KIND_LABEL[card.kind]}</span>
      </div>
      <p className="chance__text" lang="en">
        {card.text}
      </p>
    </div>
  )
}

export function ChanceBack() {
  return (
    <div className="chance chance--back" aria-hidden="true">
      <span className="chance__back-mark">?</span>
      <span className="chance__back-label">Kartu Peluang</span>
    </div>
  )
}

/** Flips from face-down to face-up once mounted. Remount (key) for each new card. */
export function FlipCard({ cardId, instant = false }: { cardId: string; instant?: boolean }) {
  const [shown, setShown] = useState(instant)
  useEffect(() => {
    if (instant) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    return () => cancelAnimationFrame(id)
  }, [instant])
  return (
    <div className={`flip${shown ? ' is-shown' : ''}`}>
      <div className="flip__inner">
        <div className="flip__face flip__face--front">
          <ChanceFace cardId={cardId} />
        </div>
        <div className="flip__face flip__face--back">
          <ChanceBack />
        </div>
      </div>
    </div>
  )
}

/** The face-down deck on the desk. */
export function CardBox({ count = 36 }: { count?: number }) {
  return (
    <div className="deck" aria-hidden="true">
      <div className="deck__card" />
      <div className="deck__card" />
      <div className="deck__card deck__card--top">
        <ChanceBack />
      </div>
      <span className="deck__count num">{count} kartu</span>
    </div>
  )
}
