import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calculator, Coins, Info, Sparkles, Wallet } from 'lucide-react'
import { Badge, SectionTitle } from '../components/ui'
import ModelCard from '../components/ModelCard'
import PlanCards from '../components/PlanCards'
import Button from '../components/Button'
import { ACCENTS, MODELS, MODEL_FILTERS, PLAN_DISCOUNTS, formatMoney, getModel, turnCost } from '../data/models'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Models() {
  const [filter, setFilter] = useState('all')
  const [calcModelId, setCalcModelId] = useState('gpt-4o')
  const [turns, setTurns] = useState(30)
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const plan = user?.plan || 'free'
  const discount = PLAN_DISCOUNTS[plan]
  const calcModel = getModel(calcModelId)
  const perTurn = turnCost(calcModel, plan)
  const total = perTurn * turns
  const accent = ACCENTS[calcModel.accent] || ACCENTS.amber

  const filtered = filter === 'all' ? MODELS : MODELS.filter((m) => m.tags.includes(filter))

  const handlePlan = (p) => {
    if (!user) {
      navigate('/register')
      return
    }
    if (p.price === 0) {
      toast('Тариф «Странник» уже доступен каждому аккаунту', 'info')
      return
    }
    navigate(`/payment?plan=${p.id}`)
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <Badge tone="gold">
          <Sparkles className="h-3 w-3" /> Модели и цены
        </Badge>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-stone-100 sm:text-5xl">
          Один мир. <span className="gold-text italic">Семь рассказчиков.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
          Каждая модель по-своему ведёт историю: одна быстрее, другая литературнее, третья дешевле. Вы платите
          только за ходы — без скрытых списаний и обязательной подписки.
        </p>
      </div>

      {/* CALCULATOR */}
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-gold-400/[0.07] blur-3xl" />
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/25 bg-gold-400/[0.08] text-gold-300">
              <Calculator className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-100">Калькулятор сессии</h2>
              <p className="text-[11px] text-stone-500">Прикиньте бюджет до начала игры</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="calc-model">Модель</label>
              <select
                id="calc-model"
                value={calcModelId}
                onChange={(e) => setCalcModelId(e.target.value)}
                className="input appearance-none bg-ink-900"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatMoney(m.pricePerTurn)} / ход
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="label mb-0" htmlFor="calc-turns">Длина сессии</label>
                <span className="text-[11px] font-semibold text-gold-300">{turns} ходов</span>
              </div>
              <input
                id="calc-turns"
                type="range"
                min="5"
                max="100"
                step="5"
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
                className="mt-3 w-full accent-gold-400"
              />
              <div className="mt-1 flex justify-between text-[9px] text-stone-600">
                <span>5 мин</span>
                <span>один вечер</span>
                <span>кампания</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-ink-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
              <div>
                <span className="text-stone-500">Цена хода: </span>
                <span className={`font-semibold ${accent.text}`}>{formatMoney(perTurn)}</span>
              </div>
              {discount > 0 && (
                <div className="text-stone-500">
                  Скидка тарифа: <span className="font-semibold text-emerald-300">−{discount}%</span>
                </div>
              )}
              <div className="text-stone-500">
                Итого: <span className="font-display text-lg font-semibold text-stone-100">{formatMoney(total)}</span>
              </div>
            </div>
            <Button
              to={`/create?model=${calcModel.id}`}
              size="sm"
              iconRight={ArrowRight}
            >
              Играть
            </Button>
          </div>

          {user && user.balance < total && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-300/90">
              <Info className="h-3.5 w-3.5" />
              На балансе {formatMoney(user.balance)} — можно пополнить или выбрать модель дешевле.
            </p>
          )}
        </div>

        <div className="panel flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              <Coins className="h-3.5 w-3.5 text-gold-400/80" /> Ваш баланс
            </div>
            <div className="mt-3 font-display text-4xl font-semibold text-stone-100">
              {user ? formatMoney(user.balance) : '300 ₽'}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
              {user
                ? `Тариф «${plan === 'free' ? 'Странник' : plan === 'adventurer' ? 'Искатель' : 'Легенда'}» даёт скидку ${discount}% на каждый ход.`
                : 'Зарегистрируйтесь — начислим 300 ₽ и дадим доступ ко всем сценариям.'}
            </p>
          </div>
          <div className="mt-5 space-y-2">
            <Button to={user ? '/payment' : '/register'} full icon={Wallet}>
              {user ? 'Пополнить баланс' : 'Получить 300 ₽'}
            </Button>
            <p className="text-center text-[9px] text-stone-600">Оплата имитируется, деньги не списываются</p>
          </div>
        </div>
      </div>

      {/* MODELS */}
      <div className="mt-14">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-display text-2xl font-semibold text-stone-100">Все модели</h2>
          <div className="flex flex-wrap gap-1.5">
            {MODEL_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition ${
                  filter === f.id
                    ? 'border-gold-400/50 bg-gold-400/10 text-gold-200'
                    : 'border-white/10 text-stone-400 hover:border-white/25 hover:text-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <ModelCard key={m.id} model={m} detailed />
          ))}
        </div>
      </div>

      {/* PLANS */}
      <div id="plans" className="mt-20 scroll-mt-24">
        <SectionTitle
          eyebrow="Тарифы"
          title="Скидка на каждый ход"
          description="Подписка не обязательна: можно играть по цене модели. Но если вы здесь надолго — выгоднее с тарифом."
        />
        <div className="mt-10">
          <PlanCards currentPlan={plan} onSelect={handlePlan} />
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-gold-300">
            <Info className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-stone-200">Как мы считаем стоимость</h3>
            <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed text-stone-500">
              Один ход — это ваше действие и ответ мастера. Цена хода зависит от модели и вашего тарифа; в демо-версии
              она фиксирована и показывается до отправки. Реальная стоимость в продакшене рассчитывается по количеству
              входных и выходных токенов. Списания отображаются в истории операций профиля.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
