import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Dices, Quote, Sparkles, Star, Users } from 'lucide-react'
import Logo from './Logo'

export default function AuthLayout({ title, subtitle, children, footer, sideTitle, sideText }) {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-8 flex items-center justify-end lg:hidden">
            <Link to="/" className="flex items-center gap-1.5 text-[11px] text-stone-500 transition hover:text-gold-300">
              <ArrowLeft className="h-3.5 w-3.5" /> На главную
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-semibold leading-tight text-stone-100">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="mt-7 text-center text-[13px] text-stone-500">{footer}</div>}
        </div>

        <div className="relative hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#181223] via-[#100d19] to-[#0a0810] p-9 lg:block">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-arcane-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="absolute inset-0 noise" />
          </div>

          <div className="relative flex h-full min-h-[560px] flex-col">
            <Logo />

            <div className="mt-auto pt-12">
              <div className="mb-5 flex items-center gap-1 text-gold-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight text-stone-100">
                {sideTitle || 'История начинается там, где вы решаете сделать шаг'}
              </h2>
              <p className="mt-4 text-[13px] leading-relaxed text-stone-400">
                {sideText ||
                  '«Сказание» помнит каждое ваше решение, описывает последствия и никогда не спорит с тем, что вы придумали. Даже если это очень плохая идея.'}
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-ink-950/50 p-4 backdrop-blur">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-[10px] font-bold text-ink-950">
                    М
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">Мастер · Claude 3.7</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-stone-300">
                      «Дверь открывается без скрипа. За ней темно, и кто-то очень тихо считает ваши шаги. Начинает с
                      третьего».
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Dices className="h-3 w-3 text-arcane-300" /> d20 = 17 · успех
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> 3 игрока
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { icon: Sparkles, label: '7 моделей' },
                  { icon: Quote, label: '6 миров' },
                  { icon: Check, label: '300 ₽ бонус' },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-2.5 text-center">
                    <f.icon className="mx-auto h-3.5 w-3.5 text-gold-400/80" />
                    <p className="mt-1.5 text-[9px] uppercase tracking-wider text-stone-500">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
