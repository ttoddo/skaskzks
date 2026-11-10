import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Sparkles, Zap } from 'lucide-react'
import { ACCENTS, formatMoney, sessionEstimate } from '../data/models'
import Button from './Button'

export function QualityDots({ value, accent = 'text-gold-300' }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Качество ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-2.5 rounded-full ${i <= value ? accent.replace('text-', 'bg-') : 'bg-white/10'}`}
        />
      ))}
    </span>
  )
}

export default function ModelCard({ model, selected = false, onSelect, compact = false, showEstimate = true, detailed = false }) {
  const a = ACCENTS[model.accent] || ACCENTS.amber

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition duration-300 ${
        selected
          ? 'border-gold-400/60 bg-gold-400/[0.05] shadow-glow'
          : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]'
      }`}
    >
      <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${a.gradient} blur-2xl transition group-hover:opacity-90`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${a.border} ${a.bg} font-display text-lg font-bold ${a.text}`}>
            {model.mark}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight text-stone-100">{model.name}</h3>
            <p className="text-[11px] text-stone-500">{model.vendor}</p>
          </div>
        </div>
        {selected ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-ink-950">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className={`hidden rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:block ${a.border} ${a.bg} ${a.text}`}>
            {model.badge}
          </span>
        )}
      </div>

      <p className={`relative mt-4 text-[13px] leading-relaxed text-stone-400 ${compact ? 'line-clamp-2' : ''}`}>
        {detailed ? model.description : model.tagline}
      </p>

      <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-ink-900/50 px-3 py-2.5">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-stone-600">Качество</div>
          <div className="mt-1.5">
            <QualityDots value={model.quality} accent={a.text} />
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-stone-600">Скорость</div>
          <div className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${a.text}`}>
            <Zap className="h-3 w-3" />
            {model.speed}/5
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-stone-600">Контекст</div>
          <div className="mt-1 text-[11px] font-semibold text-stone-300">{model.context}</div>
        </div>
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold text-stone-100">{formatMoney(model.pricePerTurn)}</span>
            <span className="text-[11px] text-stone-500">/ ход</span>
          </div>
          {showEstimate && (
            <div className="mt-0.5 text-[10px] text-stone-500">≈ {formatMoney(sessionEstimate(model))} за сессию</div>
          )}
        </div>
        {onSelect ? (
          <Button size="sm" variant={selected ? 'primary' : 'secondary'} onClick={() => onSelect(model)}>
            {selected ? 'Выбрано' : 'Выбрать'}
          </Button>
        ) : (
          <Link
            to={`/create?model=${model.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-stone-200 transition hover:border-gold-400/50 hover:text-gold-200"
          >
            Играть
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  )
}

export function ModelPill({ model, className = '' }) {
  const a = ACCENTS[model.accent] || ACCENTS.amber
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${a.border} ${a.bg} ${a.text} ${className}`}>
      <Sparkles className="h-3 w-3" />
      {model.name}
    </span>
  )
}
