import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Gift,
  History,
  Info,
  Landmark,
  Lock,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import PlanCards from '../components/PlanCards'
import { Badge, EmptyState, Modal } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { TOPUP_PACKAGES, PLAN_LABELS, getPlan } from '../data/plans'
import { formatMoney } from '../data/models'
import { formatDate } from '../lib/storage'

const METHODS = [
  { id: 'card', label: 'Банковская карта', icon: CreditCard, hint: 'Visa · Mastercard · МИР' },
  { id: 'sbp', label: 'СБП', icon: Smartphone, hint: 'По номеру телефона' },
  { id: 'yoomoney', label: 'ЮMoney', icon: Wallet, hint: 'Кошелёк ЮMoney' },
]

const emptyCard = { number: '', expiry: '', cvc: '', holder: '' }

const formatCardNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim()

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const validateCard = (card) => {
  const errors = {}
  const digits = card.number.replace(/\s/g, '')
  if (digits.length !== 16) errors.number = 'Введите 16 цифр карты'
  const [mm, yy] = card.expiry.split('/')
  if (!mm || !yy || Number(mm) < 1 || Number(mm) > 12) errors.expiry = 'ММ/ГГ'
  if (!/^\d{3}$/.test(card.cvc)) errors.cvc = '3 цифры'
  if (card.holder.trim().length < 3) errors.holder = 'Имя на карте'
  return errors
}

export default function Payment() {
  const { user, topUp, purchasePlan } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan')

  const [tab, setTab] = useState(() => {
    if (location.hash === '#history') return 'history'
    if (planParam) return 'plans'
    return 'topup'
  })
  const [amount, setAmount] = useState(1500)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState('card')
  const [card, setCard] = useState(emptyCard)
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const [planModal, setPlanModal] = useState(() => (planParam ? getPlan(planParam) : null))
  const [planCard, setPlanCard] = useState(emptyCard)
  const [planErrors, setPlanErrors] = useState({})
  const [planProcessing, setPlanProcessing] = useState(false)

  useEffect(() => {
    if (location.hash === '#history') setTab('history')
  }, [location.hash])

  if (!user) return null

  const plan = getPlan(user.plan)
  const pkg = TOPUP_PACKAGES.find((p) => p.amount === amount)
  const bonus = pkg?.bonus || 0
  const credit = Math.round(amount * (1 + bonus / 100))
  const methodLabel = METHODS.find((m) => m.id === method)?.label || 'Банковская карта'

  const chooseAmount = (value) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmount = (value) => {
    const parsed = Number(value)
    if (!Number.isNaN(parsed) && parsed > 20000) {
      setCustomAmount('20000')
      setAmount(20000)
      return
    }
    setCustomAmount(value)
    if (value === '') setAmount(0)
    else if (!Number.isNaN(parsed)) setAmount(parsed)
  }

  const handleTopUp = () => {
    setErrors({})
    if (amount < 100) {
      toast('Минимальная сумма пополнения — 100 ₽', 'error')
      return
    }
    if (method === 'card') {
      const nextErrors = validateCard(card)
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        toast('Проверьте данные карты', 'error')
        return
      }
    }
    setProcessing(true)
    window.setTimeout(() => {
      topUp(credit, { method: methodLabel, title: `Пополнение на ${formatMoney(amount)}` })
      setProcessing(false)
      setCard(emptyCard)
      setReceipt({
        kind: 'topup',
        title: 'Баланс пополнен',
        amount,
        credit,
        bonus,
        method: methodLabel,
        balance: user.balance + credit,
      })
    }, 1400)
  }

  const handlePlan = (p) => {
    if (!p) return
    if (p.price === 0) {
      toast('Тариф «Странник» доступен всем аккаунтам', 'info')
      return
    }
    setPlanCard(emptyCard)
    setPlanErrors({})
    setPlanModal(p)
  }

  const handlePlanPay = () => {
    const nextErrors = validateCard(planCard)
    if (Object.keys(nextErrors).length > 0) {
      setPlanErrors(nextErrors)
      toast('Проверьте данные карты', 'error')
      return
    }
    setPlanProcessing(true)
    window.setTimeout(() => {
      purchasePlan(planModal.id, planModal.price, {
        method: 'Карта •••• ' + planCard.number.replace(/\s/g, '').slice(-4),
        title: `Подписка «${planModal.name}»`,
      })
      setPlanProcessing(false)
      setPlanModal(null)
      setReceipt({
        kind: 'plan',
        title: `Тариф «${planModal.name}» активирован`,
        amount: planModal.price,
        credit: 0,
        bonus: planModal.discount,
        method: 'Банковская карта',
        balance: user.balance,
      })
    }, 1500)
  }

  const transactions = user.transactions || []

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge tone="gold">
          <Wallet className="h-3 w-3" /> Баланс и оплата
        </Badge>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-stone-100 sm:text-5xl">
          Пополните баланс <span className="gold-text italic">и продолжайте историю</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Деньги списываются только за ходы мастера. Никаких автопродлений без предупреждения и скрытых платежей.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-1.5 border-b border-white/[0.07] pb-3">
        {[
          { id: 'topup', label: 'Пополнение', icon: Plus },
          { id: 'plans', label: 'Подписка', icon: Sparkles },
          { id: 'history', label: 'История операций', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition ${
              tab === t.id ? 'bg-gold-400/10 text-gold-200' : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'topup' && (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
          <div className="space-y-5">
            <div className="panel p-6">
              <h2 className="text-sm font-semibold text-stone-100">Сумма пополнения</h2>
              <p className="mt-1 text-[11px] text-stone-500">Чем больше сумма — тем больше бонусных рублей</p>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {TOPUP_PACKAGES.map((p) => (
                  <button
                    key={p.amount}
                    onClick={() => chooseAmount(p.amount)}
                    className={`relative rounded-xl border p-3.5 text-left transition ${
                      amount === p.amount && !customAmount
                        ? 'border-gold-400/50 bg-gold-400/[0.06]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-ink-950">
                        Хит
                      </span>
                    )}
                    <span className="block font-display text-xl font-semibold text-stone-100">{formatMoney(p.amount)}</span>
                    <span className="mt-0.5 block text-[9px] text-stone-500">{p.label}</span>
                    {p.bonus > 0 && (
                      <span className="mt-1.5 inline-block rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                        +{p.bonus}% бонус
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="label" htmlFor="custom-amount">Или своя сумма</label>
                <div className="relative">
                  <input
                    id="custom-amount"
                    type="number"
                    min={100}
                    max={20000}
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder="Например, 900"
                    className="input pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500">₽</span>
                </div>
                <p className="mt-1 text-[9px] text-stone-600">Минимум 100 ₽ · максимум 20 000 ₽ за операцию</p>
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="text-sm font-semibold text-stone-100">Способ оплаты</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                      method === m.id ? 'border-gold-400/50 bg-gold-400/[0.05]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <m.icon className={`mt-0.5 h-4 w-4 ${method === m.id ? 'text-gold-300' : 'text-stone-500'}`} />
                    <span>
                      <span className="block text-[11px] font-medium text-stone-200">{m.label}</span>
                      <span className="mt-0.5 block text-[9px] text-stone-600">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>

              {method === 'card' ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="card-number">Номер карты</label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <input
                        id="card-number"
                        inputMode="numeric"
                        value={card.number}
                        onChange={(e) => {
                          setCard({ ...card, number: formatCardNumber(e.target.value) })
                          setErrors({ ...errors, number: undefined })
                        }}
                        placeholder="0000 0000 0000 0000"
                        className={`input pl-11 font-mono tracking-wider ${errors.number ? 'border-rose-400/50' : ''}`}
                      />
                    </div>
                    {errors.number && <p className="mt-1 text-[10px] text-rose-300">{errors.number}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="card-expiry">Срок действия</label>
                    <input
                      id="card-expiry"
                      inputMode="numeric"
                      value={card.expiry}
                      onChange={(e) => {
                        setCard({ ...card, expiry: formatExpiry(e.target.value) })
                        setErrors({ ...errors, expiry: undefined })
                      }}
                      placeholder="ММ/ГГ"
                      className={`input font-mono ${errors.expiry ? 'border-rose-400/50' : ''}`}
                    />
                    {errors.expiry && <p className="mt-1 text-[10px] text-rose-300">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="card-cvc">CVC</label>
                    <input
                      id="card-cvc"
                      inputMode="numeric"
                      type="password"
                      value={card.cvc}
                      onChange={(e) => {
                        setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })
                        setErrors({ ...errors, cvc: undefined })
                      }}
                      placeholder="•••"
                      className={`input font-mono ${errors.cvc ? 'border-rose-400/50' : ''}`}
                    />
                    {errors.cvc && <p className="mt-1 text-[10px] text-rose-300">{errors.cvc}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="card-holder">Имя владельца</label>
                    <input
                      id="card-holder"
                      value={card.holder}
                      onChange={(e) => {
                        setCard({ ...card, holder: e.target.value.toUpperCase() })
                        setErrors({ ...errors, holder: undefined })
                      }}
                      placeholder="ALEXEY STRANNIK"
                      className={`input uppercase tracking-wide ${errors.holder ? 'border-rose-400/50' : ''}`}
                    />
                    {errors.holder && <p className="mt-1 text-[10px] text-rose-300">{errors.holder}</p>}
                  </div>
                  <p className="flex items-center gap-1.5 text-[10px] text-stone-600 sm:col-span-2">
                    <Lock className="h-3 w-3" /> Демо-режим: данные не отправляются, карта не списывается.
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="flex items-center gap-2 text-[12px] font-medium text-stone-200">
                    {method === 'sbp' ? <Smartphone className="h-4 w-4 text-gold-300" /> : <Wallet className="h-4 w-4 text-gold-300" />}
                    Оплата через {methodLabel}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-stone-500">
                    В демо-версии платёж подтверждается автоматически. В реальном сервисе здесь откроется приложение
                    банка или платёжная форма.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.09] via-transparent to-transparent p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">К оплате</span>
                <CoinsIcon />
              </div>
              <p className="mt-2 font-display text-4xl font-semibold text-stone-100">{formatMoney(amount)}</p>
              {bonus > 0 && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <Gift className="h-3 w-3" /> +{bonus}% бонус · зачислим {formatMoney(credit)}
                </p>
              )}
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-ink-950/40 px-3.5 py-3 text-[11px]">
                <div className="flex justify-between text-stone-500">
                  <span>Способ</span>
                  <span className="text-stone-300">{methodLabel}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-stone-500">
                  <span>Зачислится</span>
                  <span className="font-semibold text-gold-300">{formatMoney(credit)}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-stone-500">
                  <span>Баланс после</span>
                  <span className="text-stone-300">{formatMoney(user.balance + credit)}</span>
                </div>
              </div>
              <Button full size="lg" className="mt-4" loading={processing} onClick={handleTopUp} icon={Lock}>
                {processing ? 'Обрабатываем…' : `Оплатить ${formatMoney(amount)}`}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-stone-600">
                <ShieldCheck className="h-3 w-3" /> Безопасная демо-оплата
              </p>
            </div>

            <div className="panel p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Текущий баланс</p>
              <p className="mt-2 font-display text-2xl font-semibold text-stone-100">{formatMoney(user.balance)}</p>
              <p className="mt-1 text-[10px] text-stone-500">Тариф «{PLAN_LABELS[user.plan]}» · скидка {plan.discount}%</p>
              <Link to="/models" className="mt-3 flex items-center gap-1 text-[10px] font-medium text-gold-300 transition hover:text-gold-200">
                Сравнить модели <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
              <p className="text-[10px] leading-relaxed text-stone-500">
                Оплата в демо-версии имитируется: реальные деньги не списываются, данные карты никуда не отправляются.
              </p>
            </div>
          </aside>
        </div>
      )}

      {tab === 'plans' && (
        <div className="mt-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-400/20 bg-gold-400/[0.04] px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] text-gold-100/80">
              <Sparkles className="h-3.5 w-3.5 text-gold-300" />
              Ваш текущий тариф — <span className="font-semibold text-gold-200">«{PLAN_LABELS[user.plan]}»</span>
              {user.planUntil && <span className="text-stone-500">до {formatDate(user.planUntil)}</span>}
            </p>
            <span className="text-[10px] text-stone-500">Оплата картой · отмена в любой момент</span>
          </div>
          <PlanCards currentPlan={user.plan} onSelect={handlePlan} />
          <p className="mt-5 text-center text-[10px] text-stone-600">
            Подписка не списывает деньги с баланса — это отдельный платёж. Скидка применяется к цене каждого хода.
          </p>
        </div>
      )}

      {tab === 'history' && (
        <div className="mt-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-4">
              <p className="text-[9px] uppercase tracking-wider text-stone-500">Пополнено</p>
              <p className="mt-1 font-display text-2xl font-semibold text-emerald-300">
                {formatMoney(transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-[9px] uppercase tracking-wider text-stone-500">Потрачено на игры</p>
              <p className="mt-1 font-display text-2xl font-semibold text-stone-100">
                {formatMoney(Math.abs(transactions.filter((t) => t.type === 'game').reduce((s, t) => s + t.amount, 0)))}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-[9px] uppercase tracking-wider text-stone-500">Операций</p>
              <p className="mt-1 font-display text-2xl font-semibold text-stone-100">{transactions.length}</p>
            </div>
          </div>

          {transactions.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08]">
              <div className="hidden grid-cols-[1.5fr_1fr_0.7fr_0.7fr] gap-4 border-b border-white/[0.07] bg-white/[0.02] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600 sm:grid">
                <span>Операция</span>
                <span>Способ</span>
                <span>Дата</span>
                <span className="text-right">Сумма</span>
              </div>
              {transactions.map((t) => (
                <div key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/[0.05] px-4 py-3.5 last:border-0 sm:grid-cols-[1.5fr_1fr_0.7fr_0.7fr] sm:gap-4 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.amount > 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.04] text-stone-400'}`}>
                      {t.type === 'plan' ? <Sparkles className="h-3.5 w-3.5" /> : t.amount > 0 ? <Plus className="h-3.5 w-3.5" /> : <CoinsIcon />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-stone-200">{t.title}</p>
                      <p className="truncate text-[9px] text-stone-600 sm:hidden">{t.method} · {formatDate(t.ts)}</p>
                    </div>
                  </div>
                  <span className="hidden truncate text-[10px] text-stone-500 sm:block">{t.method}</span>
                  <span className="hidden text-[10px] text-stone-500 sm:block">{formatDate(t.ts)}</span>
                  <span className={`text-right text-[11px] font-semibold ${t.amount > 0 ? 'text-emerald-300' : 'text-stone-400'}`}>
                    {t.amount > 0 ? '+' : ''}{formatMoney(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={History}
                title="Операций пока нет"
                description="Пополните баланс или оформите подписку — все платежи появятся здесь."
                action={<Button size="sm" onClick={() => setTab('topup')} icon={Plus}>Пополнить баланс</Button>}
              />
            </div>
          )}
        </div>
      )}

      {/* RECEIPT */}
      <Modal
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        title={receipt?.title}
        subtitle="Демо-платёж успешно обработан"
      >
        {receipt && (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <p className="mt-5 font-display text-4xl font-semibold text-stone-100">{formatMoney(receipt.amount)}</p>
            {receipt.kind === 'topup' && receipt.bonus > 0 && (
              <p className="mt-1 text-[12px] text-emerald-300">+{receipt.bonus}% бонус · зачислено {formatMoney(receipt.credit)}</p>
            )}
            {receipt.kind === 'plan' && (
              <p className="mt-1 text-[12px] text-emerald-300">Скидка {receipt.bonus}% на каждый ход уже действует</p>
            )}
            <div className="mt-5 space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Способ оплаты</span>
                <span className="text-stone-300">{receipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Баланс</span>
                <span className="font-semibold text-gold-300">{formatMoney(receipt.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Дата</span>
                <span className="text-stone-300">{formatDate(Date.now())}</span>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button to="/create" full icon={Sparkles}>К новой истории</Button>
              <Button variant="secondary" full onClick={() => setReceipt(null)}>Закрыть</Button>
            </div>
            <p className="mt-3 text-[9px] text-stone-600">Чек сохранён в истории операций</p>
          </div>
        )}
      </Modal>

      {/* PLAN CHECKOUT */}
      <Modal
        open={Boolean(planModal)}
        onClose={() => !planProcessing && setPlanModal(null)}
        title={planModal ? `Тариф «${planModal.name}»` : ''}
        subtitle={planModal ? `${formatMoney(planModal.price)} / месяц · скидка ${planModal.discount}% на ходы` : ''}
      >
        {planModal && (
          <div>
            <div className="rounded-xl border border-gold-400/20 bg-gold-400/[0.04] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Скидка на каждый ход</span>
                <span className="font-display text-2xl font-semibold text-gold-200">−{planModal.discount}%</span>
              </div>
              <p className="mt-1 text-[10px] text-stone-500">
                Например, ход на GPT-4o вместо 7 ₽ будет стоить {formatMoney(Math.round(7 * (1 - planModal.discount / 100)))}.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Номер карты</label>
                <input
                  value={planCard.number}
                  onChange={(e) => {
                    setPlanCard({ ...planCard, number: formatCardNumber(e.target.value) })
                    setPlanErrors({ ...planErrors, number: undefined })
                  }}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  className={`input font-mono tracking-wider ${planErrors.number ? 'border-rose-400/50' : ''}`}
                />
                {planErrors.number && <p className="mt-1 text-[10px] text-rose-300">{planErrors.number}</p>}
              </div>
              <div>
                <label className="label">Срок</label>
                <input
                  value={planCard.expiry}
                  onChange={(e) => {
                    setPlanCard({ ...planCard, expiry: formatExpiry(e.target.value) })
                    setPlanErrors({ ...planErrors, expiry: undefined })
                  }}
                  placeholder="ММ/ГГ"
                  inputMode="numeric"
                  className={`input font-mono ${planErrors.expiry ? 'border-rose-400/50' : ''}`}
                />
                {planErrors.expiry && <p className="mt-1 text-[10px] text-rose-300">{planErrors.expiry}</p>}
              </div>
              <div>
                <label className="label">CVC</label>
                <input
                  value={planCard.cvc}
                  onChange={(e) => {
                    setPlanCard({ ...planCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })
                    setPlanErrors({ ...planErrors, cvc: undefined })
                  }}
                  placeholder="•••"
                  type="password"
                  inputMode="numeric"
                  className={`input font-mono ${planErrors.cvc ? 'border-rose-400/50' : ''}`}
                />
                {planErrors.cvc && <p className="mt-1 text-[10px] text-rose-300">{planErrors.cvc}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Имя владельца</label>
                <input
                  value={planCard.holder}
                  onChange={(e) => {
                    setPlanCard({ ...planCard, holder: e.target.value.toUpperCase() })
                    setPlanErrors({ ...planErrors, holder: undefined })
                  }}
                  placeholder="ALEXEY STRANNIK"
                  className={`input uppercase ${planErrors.holder ? 'border-rose-400/50' : ''}`}
                />
                {planErrors.holder && <p className="mt-1 text-[10px] text-rose-300">{planErrors.holder}</p>}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <span className="text-[11px] text-stone-500">К оплате</span>
              <span className="font-display text-2xl font-semibold text-stone-100">{formatMoney(planModal.price)}</span>
            </div>

            <Button full size="lg" className="mt-4" loading={planProcessing} onClick={handlePlanPay} icon={Lock}>
              {planProcessing ? 'Активируем тариф…' : 'Оплатить подписку'}
            </Button>
            <p className="mt-2 text-center text-[9px] text-stone-600">
              Демо-оплата. Подписка активируется сразу, деньги не списываются.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function CoinsIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gold-400/40 text-[9px] text-gold-300">
      ₽
    </span>
  )
}
