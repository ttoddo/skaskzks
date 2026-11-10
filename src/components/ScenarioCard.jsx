import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Layers, Users } from 'lucide-react'

export default function ScenarioCard({ scenario, compact = false, onDetails }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-card">
      <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${scenario.gradient}`}>
        <div className="absolute inset-0 opacity-30 noise" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.12),transparent_60%)]" />
        <span className="relative select-none font-display text-6xl text-white/80 transition duration-500 group-hover:scale-110">
          {scenario.symbol}
        </span>
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
            {scenario.genre}
          </span>
        </div>
        <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-semibold text-white/80 backdrop-blur">
          {scenario.difficulty}
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white/60">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {scenario.players}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {scenario.duration}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" /> {scenario.tags.length} тега
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-tight text-stone-100">{scenario.title}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{scenario.subtitle}</p>
        <p className={`mt-3 text-[13px] leading-relaxed text-stone-400 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {scenario.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {scenario.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-stone-500">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            to={`/create?scenario=${scenario.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-4 py-2.5 text-xs font-bold text-ink-950 transition hover:shadow-glow"
          >
            Играть
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {onDetails ? (
            <button
              type="button"
              onClick={() => onDetails(scenario)}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-stone-300 transition hover:border-white/30 hover:text-stone-100"
            >
              Детали
            </button>
          ) : (
            <Link
              to={`/scenarios#${scenario.id}`}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-stone-300 transition hover:border-white/30 hover:text-stone-100"
            >
              Детали
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
