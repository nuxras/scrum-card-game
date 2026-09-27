/**
 * Remaining hours written in ink: earlier values from the latest turn stay visible,
 * struck through, so every change leaves a trace.
 */
export function Hours({
  value,
  trail,
  maxPast = 1,
  size = 'md',
  est,
}: {
  value: number
  trail?: number[]
  maxPast?: number
  size?: 'sm' | 'md' | 'lg'
  est?: number
}) {
  const past = trail && trail.length > 1 ? trail.slice(0, -1).slice(-maxPast) : []
  const label = past.length
    ? `sisa ${value} jam, sebelumnya ${past.join(', lalu ')}`
    : `sisa ${value} jam`
  return (
    <span className={`hours hours--${size}`} aria-label={est != null ? `${label}, estimasi ${est}` : label}>
      {past.map((v, i) => (
        <span key={`${i}-${v}-${trail?.length}`} className="hours__step" aria-hidden="true">
          <s className="hours__old num">{v}</s>
          <span className="hours__arrow">→</span>
        </span>
      ))}
      <span key={`now-${value}-${trail?.length ?? 0}`} className={`hours__now num${past.length ? ' is-new' : ''}`} aria-hidden="true">
        {value}
      </span>
      {est != null && (
        <span className="hours__est num" aria-hidden="true">
          /{est}
        </span>
      )}
    </span>
  )
}

export function Stamp({ fresh = false, inline = false }: { fresh?: boolean; inline?: boolean }) {
  return (
    <span className={`stamp${fresh ? ' stamp--fresh' : ''}${inline ? ' stamp--inline' : ''}`} aria-hidden="true">
      Selesai
    </span>
  )
}

/** Hand-drawn pen loop, used to circle today's box. */
export function PenCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 32" fill="none" aria-hidden="true">
      <path
        d="M21 3.5C11 2.6 3.2 8 3.4 16.4 3.6 24.6 12 29 21.4 28.4 31 27.8 37 22 36.6 15 36.2 7.6 28.6 3.4 19.4 4.4 15 4.9 11.6 6.2 9.4 7.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
