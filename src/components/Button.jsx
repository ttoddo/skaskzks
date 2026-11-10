import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 shadow-[0_10px_30px_-12px_rgba(232,185,79,0.6)] hover:brightness-105 hover:shadow-glow',
  secondary:
    'border border-white/15 bg-white/[0.04] text-stone-100 hover:border-white/30 hover:bg-white/[0.08]',
  ghost: 'text-stone-300 hover:bg-white/[0.05] hover:text-gold-200',
  arcane:
    'bg-gradient-to-b from-arcane-400 to-arcane-600 text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.7)] hover:brightness-110',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  outlineGold: 'border border-gold-400/40 bg-gold-400/[0.06] text-gold-200 hover:bg-gold-400/[0.12]',
}

const SIZES = {
  sm: 'h-9 px-4 text-xs gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'px-7 text-[15px] gap-2.5 py-3.5',
  icon: 'h-10 w-10',
}

export function buttonClass({ variant = 'primary', size = 'md', full = false, className = '' } = {}) {
  return [
    'inline-flex select-none items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    full ? 'w-full' : '',
    className,
  ].join(' ')
}

export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  ...props
}) {
  const cls = buttonClass({ variant, size, full, className })
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4" /> : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {content}
      </a>
    )
  }
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {content}
    </button>
  )
}
