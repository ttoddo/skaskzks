import { Check, Crown, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PLANS } from '../data/plans'
import { formatMoney } from '../data/models'
import Button from './Button'

export default function PlanCards({ currentPlan, compact = false, onSelect }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLANS.map((plan) => {
        const active = currentPlan === plan.id
        return (
          <div
            key={plan.id}
            className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 transition ${
              plan.highlight
                ? 'border-gold-400/40 bg-gradient-to-b from-gold-400/[0.08] to-transparent shadow-[0_20px_60px_-30px_rgba(232,185,79,0.4)]'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
            }`}
          >
            {plan.highlight && (
              <div className="absolute right-4 top-4 rounded-full bg-gold-400 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-ink-950">
                {plan.badge}
              </div>
            )}
            <div className="flex items-center gap-2">
              {plan.id === 'legend' ? (
                <Crown className="h-4 w-4 text-gold-300" />
              ) : plan.id === 'adventurer' ? (
                <Sparkles className="h-4 w-4 text-gold-300" />
              ) : (
                <span className="h-4 w-4 rounded-full border border-stone-500" />
              )}
              <h3 className="font-display text-xl font-semibold text-stone-100">{plan.name}</h3>
            </div>
            <p className="mt-1 text-[11px] text-stone-500">{plan.tagline}</p>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-semibold text-stone-100">
                {plan.price === 0 ? '0 ₽' : formatMoney(plan.price)}
              </span>
              <span className="text-[11px] text-stone-500">{plan.period}</span>
            </div>
            {plan.discount > 0 && (
              <div className="mt-1 text-[11px] font-medium text-gold-300">−{plan.discount}% на все ходы</div>
            )}

            <ul className={`mt-5 space-y-2.5 ${compact ? '' : 'flex-1'}`}>
              {plan.perks.slice(0, compact ? 4 : plan.perks.length).map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-[12px] leading-relaxed text-stone-400">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400/80" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {onSelect ? (
                <Button
                  full
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  onClick={() => onSelect(plan)}
                  disabled={active}
                >
                  {active ? 'Ваш текущий тариф' : plan.cta}
                </Button>
              ) : (
                <Link
                  to={plan.price === 0 ? '/register' : `/payment?plan=${plan.id}`}
                  className={`flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 hover:shadow-glow'
                      : 'border border-white/15 text-stone-200 hover:border-white/30 hover:bg-white/[0.05]'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
