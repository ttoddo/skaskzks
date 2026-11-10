import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Badge({ children, className = '', tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/[0.05] text-stone-300',
    gold: 'border-gold-400/30 bg-gold-400/10 text-gold-200',
    violet: 'border-arcane-400/30 bg-arcane-400/10 text-arcane-200',
    green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${tones[tone] || tones.default} ${className}`}
    >
      {children}
    </span>
  )
}

const AVATAR_SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl',
}

export function Avatar({ name = '?', color = 'from-arcane-500/40 to-sky-400/30', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br font-display font-semibold text-white/90 ${color} ${AVATAR_SIZES[size]} ${className}`}
    >
      {initials || '?'}
    </div>
  )
}

export function Progress({ value = 0, max = 100, className = '', barClass = 'bg-gradient-to-r from-rose-500 to-orange-400' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function SectionTitle({ eyebrow, title, description, align = 'center', className = '' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <div className={`mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-gold-400/50" />
          {eyebrow}
          <span className="h-px w-6 bg-gold-400/50" />
        </div>
      )}
      <h2 className="font-display text-3xl font-semibold leading-tight text-stone-100 sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {description && <p className="mt-4 text-sm leading-relaxed text-stone-400 sm:text-base">{description}</p>}
    </div>
  )
}

export function Modal({ open, onClose, title, subtitle, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-ink-900 shadow-card animate-fade-up sm:rounded-2xl ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.07] bg-ink-900/95 px-6 py-5 backdrop-blur">
          <div>
            <h3 className="font-display text-2xl font-semibold text-stone-100">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-stone-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-stone-400 transition hover:border-white/25 hover:text-stone-100"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer && <div className="sticky bottom-0 border-t border-white/[0.07] bg-ink-900/95 px-6 py-4 backdrop-blur">{footer}</div>}
      </div>
    </div>
  )
}

export function Stat({ label, value, icon: Icon, hint }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-gold-400/80" />}
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-stone-100">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-stone-500">{hint}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gold-300">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h4 className="font-display text-xl font-semibold text-stone-200">{title}</h4>
      {description && <p className="mt-2 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
