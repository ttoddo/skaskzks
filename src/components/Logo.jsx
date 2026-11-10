import { Link } from 'react-router-dom'

export function StarMark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 2.5l3.2 9.1 9.3 4.4-9.3 4.4L16 29.5l-3.2-9.1L3.5 16l9.3-4.4z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M16 9.5l1.7 4.8 4.8 1.7-4.8 1.7L16 22.5l-1.7-4.8-4.8-1.7 4.8-1.7z" fill="#07060b" opacity="0.45" />
    </svg>
  )
}

export default function Logo({ compact = false, className = '' }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="Сказание — на главную">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gold-400/30 bg-gradient-to-br from-gold-400/25 via-gold-400/5 to-transparent text-gold-300 transition group-hover:border-gold-400/60 group-hover:shadow-glow">
        <StarMark className="h-[18px] w-[18px]" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.35rem] font-semibold tracking-wide text-stone-100">Сказание</span>
          <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.34em] text-gold-400/80">AI storyteller</span>
        </span>
      )}
    </Link>
  )
}
