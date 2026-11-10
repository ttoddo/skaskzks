import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Check,
  Coins,
  Dices,
  Info,
  Loader2,
  Plus,
  ScrollText,
  Sparkles,
  Swords,
  Users,
  Wand2,
  Wallet,
} from 'lucide-react'
import Button from '../components/Button'
import { Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CLASSES, DIFFICULTIES, SCENARIOS, TONES, getClass, getScenario } from '../data/scenarios'
import { ACCENTS, MODELS, PLAN_DISCOUNTS, formatMoney, getModel, turnCost } from '../data/models'
import { createGame } from '../lib/gameStore'

const RANDOM_NAMES = ['Ирма', 'Кай', 'Тео', 'Ася', 'Бран', 'Лира', 'Мор', 'Нора', 'Эйнар', 'Соль', 'Рейн', 'Веста']
const RANDOM_TITLES = ['Тихая', 'Странник', 'Полуночный', 'Из-за моря', 'Совиный', 'Последний', 'Безымянный']

export default function CreateGame() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const paramScenario = params.get('scenario')
  const paramModel = params.get('model')

  const [mode, setMode] = useState('solo')
  const [scenarioId, setScenarioId] = useState(
    paramScenario && (getScenario(paramScenario) || paramScenario === 'custom') ? paramScenario : SCENARIOS[0].id,
  )
  const [customPrompt, setCustomPrompt] = useState('')
  const [modelId, setModelId] = useState(paramModel && MODELS.some((m) => m.id === paramModel) ? paramModel : 'gpt-4o')
  const [tone, setTone] = useState('balanced')
  const [difficultyId, setDifficultyId] = useState('medium')
  const [characterName, setCharacterName] = useState(user?.name?.split(' ')[0] || '')
  const [classId, setClassId] = useState('rogue')
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const scenario = getScenario(scenarioId)
  const selectedClass = getClass(classId)
  const model = getModel(modelId)
  const plan = user?.plan || 'free'
  const discount = PLAN_DISCOUNTS[plan]
  const perTurn = turnCost(model, plan)
  const estimate = perTurn * 30
  const enough = (user?.balance || 0) >= perTurn

  const accent = ACCENTS[model.accent] || ACCENTS.amber

  const previewTitle = useMemo(() => {
    if (scenarioId === 'custom') {
      return customPrompt.trim() ? 'Ваш мир' : 'Свободный мир'
    }
    return scenario?.title || 'Приключение'
  }, [scenarioId, scenario, customPrompt])

  const randomizeHero = () => {
    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
    const title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)]
    const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)]
    setCharacterName(`${name} ${title}`)
    setClassId(cls.id)
  }

  const handleStart = () => {
    setError('')
    if (characterName.trim().length < 2) {
      setError('Дайте герою имя — хотя бы два символа')
      return
    }
    if (scenarioId === 'custom' && customPrompt.trim().length < 10) {
      setError('Опишите мир хотя бы одним предложением (от 10 символов)')
      return
    }
    if (!enough) {
      setError('На балансе недостаточно средств для первого хода')
      return
    }
    setStarting(true)
    window.setTimeout(() => {
      const party =
        mode === 'coop'
          ? [{ name: characterName.trim(), classId, isHost: true, color: user.avatarColor }]
          : []
      const game = createGame({
        userId: user.id,
        scenarioId,
        customPrompt,
        modelId,
        mode,
        tone,
        difficultyId,
        character: { name: characterName.trim(), classId },
        party,
      })
      toast(mode === 'coop' ? 'Комната создана. Пригласите друзей!' : 'Приключение началось!')
      navigate(mode === 'coop' ? `/lobby/${game.id}` : `/game/${game.id}`)
    }, 650)
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge tone="gold">
          <Wand2 className="h-3 w-3" /> Новая история
        </Badge>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-stone-100 sm:text-5xl">
          Соберите приключение
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Пять решений — и мастер начнёт. Всё можно поменять до первого хода.
        </p>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.55fr_0.85fr] lg:items-start">
        <div className="space-y-6">
          {/* 1. MODE */}
          <section className="panel p-6">
            <SectionHead num="01" title="Формат игры" hint="Можно играть одному или позвать друзей" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { id: 'solo', icon: Swords, title: 'Одиночная', text: 'Вы и ИИ-мастер. Полная свобода и никаких споров.', meta: '1 игрок' },
                { id: 'coop', icon: Users, title: 'Кооператив', text: 'Комната по коду для друзей. Общий чат и решения.', meta: 'до 4 игроков' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`relative rounded-xl border p-4 text-left transition ${
                    mode === m.id
                      ? 'border-gold-400/50 bg-gold-400/[0.06]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                >
                  {mode === m.id && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-ink-950">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <m.icon className={`h-5 w-5 ${mode === m.id ? 'text-gold-300' : 'text-stone-500'}`} />
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-100">{m.title}</span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] text-stone-400">{m.meta}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-stone-500">{m.text}</p>
                </button>
              ))}
            </div>
          </section>

          {/* 2. SCENARIO */}
          <section className="panel p-6">
            <SectionHead num="02" title="Мир и завязка" hint="Готовый сценарий или собственная идея" />
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenarioId(s.id)}
                  className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    scenarioId === s.id
                      ? 'border-gold-400/50 bg-gold-400/[0.05]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br ${s.gradient} text-lg`}>
                    {s.symbol}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-stone-200">{s.title}</span>
                    <span className="mt-0.5 block text-[10px] text-stone-500">{s.genre} · {s.duration}</span>
                  </span>
                  {scenarioId === s.id && <Check className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-gold-400" />}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setScenarioId('custom')}
                className={`group flex items-start gap-3 rounded-xl border border-dashed p-3 text-left transition sm:col-span-2 ${
                  scenarioId === 'custom'
                    ? 'border-arcane-400/60 bg-arcane-400/[0.06]'
                    : 'border-white/15 bg-white/[0.01] hover:border-arcane-400/40'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-arcane-400/25 bg-arcane-400/10 text-arcane-300">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-stone-200">Свой мир</span>
                  <span className="mt-0.5 block text-[10px] text-stone-500">Опишите сеттинг, героя или первую сцену</span>
                </span>
                {scenarioId === 'custom' && <Check className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-arcane-300" />}
              </button>
            </div>

            {scenarioId === 'custom' && (
              <div className="mt-4 animate-fade-in">
                <label className="label" htmlFor="custom-prompt">Ваша завязка</label>
                <textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  placeholder="Например: заброшенный маяк на краю мира, где смотрителем работает бывший бог…"
                  className="input resize-none"
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-stone-600">
                  <span>Чем конкретнее, тем интереснее первый ход</span>
                  <span>{customPrompt.length}/400</span>
                </div>
              </div>
            )}
          </section>

          {/* 3. CHARACTER */}
          <section className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHead num="03" title="Ваш герой" hint="Имя и класс влияют на описания мастера" />
              <Button variant="ghost" size="sm" icon={Dices} onClick={randomizeHero} type="button">
                Случайный герой
              </Button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="label" htmlFor="char-name">Имя героя</label>
                <input
                  id="char-name"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Как вас будут звать в истории?"
                  maxLength={32}
                  className="input"
                />
              </div>
              <div className="flex items-end">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">Здоровье</p>
                  <p className="mt-1 font-display text-xl font-semibold text-rose-300">{selectedClass.hp}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setClassId(cls.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    classId === cls.id
                      ? 'border-gold-400/50 bg-gold-400/[0.06]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-base ${cls.color}`}>{cls.symbol}</span>
                    {classId === cls.id && <Check className="h-3 w-3 text-gold-400" />}
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-stone-200">{cls.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-stone-500">{cls.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* 4. TONE */}
          <section className="panel p-6">
            <SectionHead num="04" title="Настроение истории" hint="Как мастер будет описывать мир" />
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left transition ${
                    tone === t.id ? 'border-gold-400/50 bg-gold-400/[0.05]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div>
                    <p className="text-[12px] font-semibold text-stone-200">{t.label}</p>
                    <p className="text-[10px] text-stone-500">{t.desc}</p>
                  </div>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone === t.id ? 'bg-gold-400' : 'bg-white/15'}`} />
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="label">Сложность проверок</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficultyId(d.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-[11px] transition ${
                      difficultyId === d.id
                        ? 'border-gold-400/50 bg-gold-400/10 text-gold-200'
                        : 'border-white/10 text-stone-400 hover:border-white/25'
                    }`}
                    title={d.desc}
                  >
                    {d.label} · DC {d.dc}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 5. MODEL */}
          <section className="panel p-6">
            <SectionHead num="05" title="Рассказчик" hint="Модель определяет стиль и цену хода" />
            <div className="mt-5 space-y-2">
              {MODELS.map((m) => {
                const a = ACCENTS[m.accent] || ACCENTS.amber
                const price = turnCost(m, plan)
                const active = modelId === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelId(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active ? 'border-gold-400/50 bg-gold-400/[0.05]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${a.border} ${a.bg} font-display text-sm font-bold ${a.text}`}>
                      {m.mark}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-stone-200">{m.name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${a.bg} ${a.text}`}>
                          {m.badge}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-stone-500">{m.tagline}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[12px] font-semibold text-stone-200">{formatMoney(price)}</span>
                      <span className="block text-[9px] text-stone-600">за ход</span>
                    </span>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-gold-400 bg-gold-400' : 'border-white/20'}`}>
                      {active && <Check className="h-3 w-3 text-ink-950" />}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[10px] leading-relaxed text-stone-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-500" />
              Цена фиксированная в демо-версии. В продакшене считается по токенам: вход + выход модели.
            </div>
          </section>
        </div>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 shadow-card backdrop-blur">
            <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${scenario ? scenario.gradient : 'from-[#1c1430] via-[#12101f] to-[#08070d]'}`}>
              <div className="absolute inset-0 noise" />
              <span className="relative font-display text-4xl text-white/80">{scenario ? scenario.symbol : '✦'}</span>
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[9px] text-white/60">
                <span>{mode === 'coop' ? 'Кооператив' : 'Одиночная игра'}</span>
                <span>{scenario ? scenario.genre : 'Свободная история'}</span>
              </div>
            </div>

            <div className="p-5">
              <h2 className="font-display text-xl font-semibold leading-tight text-stone-100">{previewTitle}</h2>
              <p className="mt-1 text-[11px] text-stone-500">
                {scenario ? scenario.hook : customPrompt.trim() ? customPrompt.slice(0, 80) + '…' : 'Опишите мир слева'}
              </p>

              <div className="my-4 h-px bg-white/[0.07]" />

              <div className="space-y-2.5 text-[11px]">
                <SummaryRow label="Герой" value={characterName.trim() || '—'} sub={selectedClass.name} />
                <SummaryRow label="Рассказчик" value={model.name} sub={model.vendor} />
                <SummaryRow label="Настроение" value={TONES.find((t) => t.id === tone)?.label} />
                <SummaryRow label="Сложность" value={DIFFICULTIES.find((d) => d.id === difficultyId)?.label} />
              </div>

              <div className="my-4 h-px bg-white/[0.07]" />

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-stone-500">
                  <span>Цена хода</span>
                  <span className="text-stone-200">{formatMoney(perTurn)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-300/90">
                    <span>Скидка тарифа</span>
                    <span>−{discount}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-stone-500">
                  <span>Сессия ≈ 30 ходов</span>
                  <span className="text-stone-200">{formatMoney(estimate)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gold-400/20 bg-gold-400/[0.05] px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Первый ход</span>
                  <span className="font-display text-2xl font-semibold text-gold-200">{formatMoney(perTurn)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-stone-500">
                  <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> Баланс</span>
                  <span className={enough ? 'text-stone-300' : 'text-rose-300'}>{formatMoney(user?.balance || 0)}</span>
                </div>
              </div>

              {error && (
                <p className="mt-3 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] px-3 py-2 text-[11px] text-rose-200">
                  {error}
                </p>
              )}

              {!enough ? (
                <Button to="/payment" full size="lg" className="mt-4" icon={Coins}>
                  Пополнить баланс
                </Button>
              ) : (
                <Button full size="lg" className="mt-4" onClick={handleStart} disabled={starting} icon={starting ? undefined : Sparkles}>
                  {starting ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Открываем портал…</span>
                  ) : mode === 'coop' ? (
                    'Создать комнату'
                  ) : (
                    'Начать приключение'
                  )}
                </Button>
              )}

              <p className="mt-3 text-center text-[9px] leading-relaxed text-stone-600">
                Нажимая кнопку, вы соглашаетесь с правилами сервиса.
                <br />
                Оплата имитируется, деньги не списываются.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
            <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-gold-400/70" />
            <p className="text-[10px] leading-relaxed text-stone-500">
              Прогресс сохраняется автоматически. Можно закрыть вкладку и вернуться к истории из профиля.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SectionHead({ num, title, hint }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-mono text-[10px] text-gold-300">
        {num}
      </span>
      <div>
        <h2 className="text-sm font-semibold text-stone-100">{title}</h2>
        <p className="mt-0.5 text-[11px] text-stone-500">{hint}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, sub }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-stone-500">{label}</span>
      <span className="text-right">
        <span className="block truncate font-medium text-stone-200">{value || '—'}</span>
        {sub && <span className="block text-[9px] text-stone-600">{sub}</span>}
      </span>
    </div>
  )
}
