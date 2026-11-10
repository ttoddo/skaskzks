import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Backpack,
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Crown,
  Dices,
  Flag,
  Heart,
  Info,
  Loader2,
  ScrollText,
  Send,
  Sparkles,
  Target,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import { Avatar, Modal, Progress } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { addMessage, applyAction, finishGame, getGame, saveGame } from '../lib/gameStore'
import { companionAction } from '../lib/narrative'
import { getClass, getDifficulty, getScenario } from '../data/scenarios'
import { ACCENTS, formatMoney, getModel, turnCost } from '../data/models'
import { pick, plural } from '../lib/storage'

const OUTCOMES = {
  crit: { label: 'Критический успех', text: 'text-emerald-300', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  success: { label: 'Успех', text: 'text-emerald-300', border: 'border-emerald-400/25', bg: 'bg-emerald-400/[0.08]' },
  partial: { label: 'Осложнение', text: 'text-amber-300', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  fail: { label: 'Провал', text: 'text-rose-300', border: 'border-rose-400/30', bg: 'bg-rose-400/10' },
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Game() {
  const { id } = useParams()
  const { user, spend, topUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [game, setGame] = useState(() => getGame(id))
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [lowBalanceOpen, setLowBalanceOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const alive = useRef(true)
  const gameRef = useRef(game)

  useEffect(() => {
    gameRef.current = game
  }, [game])

  const model = getModel(game?.modelId || 'gpt-4o')
  const perTurn = turnCost(model, user?.plan || 'free')
  const balance = user?.balance ?? 0
  const scenario = game ? getScenario(game.scenarioId) : null
  const accent = ACCENTS[model.accent] || ACCENTS.amber
  const difficulty = game ? getDifficulty(game.difficultyId) : null

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [game?.messages.length, thinking])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  if (!game) return <Navigate to="/profile" replace />

  const otherPlayers = game.party.filter((p) => p.name !== game.character.name)
  const isFinished = game.status === 'finished'
  const doneObjectives = game.objectives.filter((o) => o.done).length

  const persist = (next) => {
    const resolved = typeof next === 'function' ? next(gameRef.current) : next
    gameRef.current = resolved
    saveGame(resolved)
    setGame(resolved)
  }

  const handleSend = async (raw) => {
    const text = (raw ?? input).trim()
    if (!text || thinking || isFinished) return
    if (balance < perTurn) {
      setLowBalanceOpen(true)
      return
    }

    setInput('')
    setThinking(true)

    let current = addMessage(game, {
      id: `msg_${Date.now()}_p`,
      role: 'player',
      author: game.character.name,
      text,
      ts: Date.now(),
    })
    persist(current)

    if (game.mode === 'coop' && otherPlayers.length > 0) {
      await sleep(650)
      if (!alive.current) return
      const companion = pick(otherPlayers)
      const action = companionAction(game.scenarioId)
      current = addMessage(current, {
        id: `msg_${Date.now()}_c`,
        role: 'player',
        author: companion.name,
        text: action,
        companion: true,
        ts: Date.now(),
      })
      persist(current)
      await sleep(750)
    } else {
      await sleep(1150)
    }

    if (!alive.current) return

    const next = applyAction(gameRef.current, {
      action: text,
      playerName: game.character.name,
      plan: user?.plan || 'free',
      alreadyAdded: true,
    })
    persist(next)
    spend(perTurn, { title: `Ход ${next.turnsCount} · ${game.title}`, model: model.name })
    setThinking(false)

    if (next.objectives.some((o, i) => o.done && !game.objectives[i]?.done)) {
      toast('Цель отмечена выполненной — загляните в журнал', 'info')
    }
  }

  const suggestAction = () => {
    const lastGm = [...game.messages].reverse().find((m) => m.role === 'gm')
    const pool = lastGm?.choices?.length ? lastGm.choices : scenario?.actions || ['Осмотреться внимательнее']
    setInput(pick(pool))
    textareaRef.current?.focus()
  }

  const toggleObjective = (objId) => {
    persist((prev) => ({
      ...prev,
      objectives: prev.objectives.map((o) => (o.id === objId ? { ...o, done: !o.done } : o)),
    }))
  }

  const updateNotes = (value) => {
    persist((prev) => ({ ...prev, notes: value }))
  }

  const handleFinish = () => {
    const next = finishGame(game)
    persist(next)
    setEndOpen(false)
    toast('Приключение завершено. Эпилог добавлен в историю.')
  }

  const quickTopUp = (amount) => {
    topUp(amount, { method: 'Демо-карта •••• 4242' })
    setLowBalanceOpen(false)
    toast(`Баланс пополнен на ${formatMoney(amount)}`)
  }

  const lastGmId = [...game.messages].reverse().find((m) => m.role === 'gm')?.id

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-ink-950">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-ink-950/85 px-3 backdrop-blur sm:px-5">
        <Link
          to="/profile"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-white/25 hover:text-gold-300"
          title="Сохранить и выйти в профиль"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br sm:flex ${scenario?.gradient || 'from-[#1c1430] via-[#12101f] to-[#08070d]'}`}>
          <span className="font-display text-lg text-white/80">{scenario?.symbol || '✦'}</span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-stone-100 sm:text-[13px]">{game.title}</p>
          <p className="truncate text-[9px] text-stone-500 sm:text-[10px]">
            {scenario?.genre || 'Свободная история'} · {game.mode === 'coop' ? `кооператив · ${game.party.length} ${plural(game.party.length, 'игрок', 'игрока', 'игроков')}` : 'одиночная игра'} · ход {game.turnsCount + 1}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold md:flex ${accent.border} ${accent.bg} ${accent.text}`}>
            <Sparkles className="h-3 w-3" /> {model.name}
          </span>
          <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-stone-300 sm:flex">
            <Coins className="h-3 w-3 text-gold-400/80" /> {formatMoney(perTurn)} / ход
          </span>
          <Link
            to="/payment"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold text-stone-200 transition hover:border-gold-400/40"
            title="Пополнить баланс"
          >
            <Wallet className="h-3.5 w-3.5 text-gold-400" />
            {formatMoney(balance)}
          </Link>

          <button
            onClick={() => setMobilePanel('party')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-stone-400 lg:hidden"
            aria-label="Партия"
          >
            <Users className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setMobilePanel('journal')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-stone-400 xl:hidden"
            aria-label="Журнал"
          >
            <ScrollText className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setEndOpen(true)}
            disabled={isFinished}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40"
            aria-label="Завершить приключение"
            title="Завершить приключение"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="mx-auto grid min-h-0 w-full max-w-[1560px] flex-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-white/[0.06] p-4 lg:block scrollbar-thin">
          <PartyPanel
            game={game}
            model={model}
            perTurn={perTurn}
            onOpenJournal={() => setMobilePanel('journal')}
          />
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
              {game.messages.map((msg) => (
                <Message
                  key={msg.id}
                  msg={msg}
                  isLastGm={msg.id === lastGmId}
                  thinking={thinking}
                  disabled={isFinished}
                  onChoice={handleSend}
                  modelName={model.name}
                />
              ))}

              {thinking && (
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-[10px] font-bold text-ink-950">
                    М
                  </span>
                  <div className="rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>Мастер пишет</span>
                      <span className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1 w-1 rounded-full bg-gold-400/80 animate-bounce"
                            style={{ animationDelay: `${i * 120}ms` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>
          </div>

          {/* INPUT */}
          <div className="shrink-0 border-t border-white/[0.07] bg-ink-950/85 px-3 py-3 backdrop-blur sm:px-6">
            <div className="mx-auto max-w-3xl">
              {isFinished ? (
                <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gold-400/25 bg-gold-400/[0.05] px-4 py-4 sm:flex-row">
                  <div>
                    <p className="text-[12px] font-semibold text-gold-200">История завершена</p>
                    <p className="text-[10px] text-stone-500">Эпилог сохранён в профиле. Можно начать новый мир.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button to="/profile" variant="secondary" size="sm">В профиль</Button>
                    <Button to="/create" size="sm" icon={Sparkles}>Новая история</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-900/80 p-2 transition focus-within:border-gold-400/40">
                    <button
                      onClick={suggestAction}
                      className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-stone-500 transition hover:bg-white/[0.05] hover:text-gold-300"
                      title="Подсказать действие"
                      type="button"
                    >
                      <Dices className="h-4 w-4" />
                    </button>
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder={thinking ? 'Мастер описывает последствия…' : 'Что вы сделаете? Опишите действие своими словами…'}
                      disabled={thinking}
                      className="max-h-[120px] flex-1 resize-none bg-transparent px-1 py-2 text-[13px] leading-relaxed text-stone-100 placeholder-stone-600 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || thinking}
                      className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 transition hover:shadow-glow disabled:opacity-40 disabled:shadow-none"
                      aria-label="Отправить действие"
                    >
                      {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[9px] text-stone-600">
                    <span>Enter — отправить · Shift + Enter — новая строка</span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-2.5 w-2.5" />
                      {formatMoney(perTurn)} за ход · баланс {formatMoney(balance)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-white/[0.06] p-4 xl:block scrollbar-thin">
          <JournalPanel
            game={game}
            doneObjectives={doneObjectives}
            perTurn={perTurn}
            onToggle={toggleObjective}
            onNotes={updateNotes}
          />
        </aside>
      </div>

      {/* MOBILE PANEL */}
      {mobilePanel && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setMobilePanel(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-ink-900 p-4 shadow-card animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-stone-100">
                {mobilePanel === 'party' ? 'Партия' : 'Журнал'}
              </h3>
              <button
                onClick={() => setMobilePanel(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-stone-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {mobilePanel === 'party' ? (
              <PartyPanel game={game} model={model} perTurn={perTurn} />
            ) : (
              <JournalPanel
                game={game}
                doneObjectives={doneObjectives}
                perTurn={perTurn}
                onToggle={toggleObjective}
                onNotes={updateNotes}
              />
            )}
          </div>
        </div>
      )}

      {/* LOW BALANCE */}
      <Modal
        open={lowBalanceOpen}
        onClose={() => setLowBalanceOpen(false)}
        title="Недостаточно средств"
        subtitle={`Ход стоит ${formatMoney(perTurn)}, на балансе ${formatMoney(balance)}`}
      >
        <p className="text-sm leading-relaxed text-stone-400">
          Пополните баланс, чтобы продолжить историю. В демо-версии пополнение мгновенное и не списывает реальные
          деньги.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[300, 700, 1500].map((amount) => (
            <button
              key={amount}
              onClick={() => quickTopUp(amount)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center transition hover:border-gold-400/40 hover:bg-gold-400/[0.06]"
            >
              <span className="block font-display text-lg font-semibold text-stone-100">{formatMoney(amount)}</span>
              <span className="block text-[9px] uppercase tracking-wider text-stone-500">пополнить</span>
            </button>
          ))}
        </div>
        <Button to="/payment" full variant="secondary" className="mt-3" icon={Wallet}>
          Перейти к оплате
        </Button>
      </Modal>

      {/* END GAME */}
      <Modal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        title="Завершить приключение?"
        subtitle="Мастер напишет эпилог, а кампания переместится в завершённые"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" full onClick={() => setEndOpen(false)}>
              Продолжить игру
            </Button>
            <Button variant="danger" full onClick={handleFinish} icon={Flag}>
              Завершить
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-stone-400">
          История сохранится в профиле, но продолжить её будет нельзя. Вы прошли {game.turnsCount}{' '}
          {game.turnsCount === 1 ? 'ход' : game.turnsCount < 5 ? 'хода' : 'ходов'} и потратили {formatMoney(game.cost)}.
        </p>
      </Modal>
    </div>
  )
}

function Message({ msg, isLastGm, thinking, disabled, onChoice, modelName }) {
  if (msg.role === 'roll') {
    const o = OUTCOMES[msg.outcome] || OUTCOMES.success
    return (
      <div className="flex pl-11">
        <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${o.border} ${o.bg}`}>
          <Dices className={`h-4 w-4 ${o.text}`} />
          <div>
            <p className="text-[8px] uppercase tracking-[0.14em] text-stone-500">Проверка · DC {msg.dc}</p>
            <p className="font-mono text-[11px] text-stone-300">
              d20 = <span className="font-semibold text-stone-100">{msg.roll}</span>
            </p>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${o.border} ${o.text}`}>
            {o.label}
          </span>
        </div>
      </div>
    )
  }

  if (msg.role === 'player') {
    return (
      <div className="flex justify-end gap-2.5">
        <div className="max-w-[86%]">
          <p className="mb-1 text-right text-[9px] font-semibold uppercase tracking-wider text-stone-500">
            {msg.author}
            {msg.companion && <span className="ml-1.5 rounded bg-white/[0.06] px-1 py-0.5 text-[7px] text-stone-500">спутник</span>}
          </p>
          <div className="rounded-2xl rounded-tr-sm border border-gold-400/20 bg-gold-400/[0.08] px-4 py-2.5 text-[13px] leading-relaxed text-gold-50/90">
            {msg.text}
          </div>
        </div>
        <Avatar name={msg.author} size="sm" color={msg.companion ? 'from-stone-500/40 to-stone-400/20' : 'from-gold-500/40 to-amber-400/25'} className="mt-4" />
      </div>
    )
  }

  if (msg.role === 'epilogue') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.09] via-transparent to-arcane-500/[0.05] p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">Эпилог</span>
          </div>
          <div className="narrative mt-3">
            {msg.text.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button to="/create" size="sm" icon={Sparkles}>Начать новую историю</Button>
            <Button to="/profile" size="sm" variant="secondary">Сохранить в профиль</Button>
          </div>
        </div>
      </div>
    )
  }

  if (msg.role === 'system') {
    return <p className="text-center text-[10px] uppercase tracking-[0.16em] text-stone-600">{msg.text}</p>
  }

  const o = msg.outcome ? OUTCOMES[msg.outcome] : null

  return (
    <div className="animate-fade-in">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-[10px] font-bold text-ink-950">
          М
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-gold-200">Мастер</span>
            <span className="text-[9px] text-stone-600">{modelName}</span>
            {o && (
              <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${o.border} ${o.bg} ${o.text}`}>
                {o.label}
              </span>
            )}
          </div>
          <div className="narrative rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 text-[13px]">
            {msg.text.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      {isLastGm && msg.choices?.length > 0 && !thinking && !disabled && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-11">
          {msg.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => onChoice(choice)}
              className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-stone-400 transition hover:border-gold-400/40 hover:bg-gold-400/[0.06] hover:text-gold-200"
            >
              {choice}
              <ChevronRight className="h-3 w-3 text-stone-600 transition group-hover:text-gold-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PartyPanel({ game, model, perTurn, onOpenJournal }) {
  const cls = getClass(game.character.classId)
  const accent = ACCENTS[model.accent] || ACCENTS.amber
  const hpPercent = (game.character.hp / game.character.maxHp) * 100

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <Avatar name={game.character.name} color="from-gold-500/40 to-amber-400/25" size="md" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-stone-100">{game.character.name}</p>
            <p className="text-[10px] text-stone-500">
              {cls.symbol} {cls.name} · ваш герой
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-stone-500"><Heart className="h-3 w-3 text-rose-400" /> Здоровье</span>
            <span className="font-medium text-stone-300">{game.character.hp} / {game.character.maxHp}</span>
          </div>
          <Progress value={hpPercent} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.07] bg-ink-950/40 px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-wider text-stone-600">Золото</p>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-gold-300">
              <Coins className="h-3 w-3" /> {game.gold}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-ink-950/40 px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-wider text-stone-600">Ходов</p>
            <p className="mt-0.5 text-[12px] font-semibold text-stone-300">{game.turnsCount}</p>
          </div>
        </div>
      </div>

      {game.mode === 'coop' && game.party.length > 1 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            <Users className="h-3 w-3" /> Партия
          </p>
          <div className="mt-3 space-y-2">
            {game.party.map((p) => {
              const pCls = getClass(p.classId)
              const isMe = p.name === game.character.name
              return (
                <div key={p.name} className="flex items-center gap-2">
                  <Avatar name={p.name} color={p.color || 'from-stone-500/40 to-stone-400/20'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[11px] font-medium text-stone-300">
                      {p.name}
                      {p.isHost && <Crown className="h-2.5 w-2.5 text-gold-400" />}
                    </p>
                    <p className="text-[9px] text-stone-600">{pCls.name}{isMe ? ' · вы' : ''}</p>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <Backpack className="h-3 w-3" /> Инвентарь
        </p>
        <ul className="mt-3 space-y-1.5">
          {game.inventory.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[11px] leading-snug text-stone-400">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-400/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">Рассказчик</p>
          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${accent.bg} ${accent.text}`}>{model.badge}</span>
        </div>
        <p className="mt-2 font-display text-base font-semibold text-stone-100">{model.name}</p>
        <p className="text-[10px] text-stone-500">{model.vendor}</p>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5 text-[10px]">
          <span className="text-stone-500">Цена хода</span>
          <span className="font-semibold text-gold-300">{formatMoney(perTurn)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px]">
          <span className="text-stone-500">Потрачено</span>
          <span className="text-stone-300">{formatMoney(game.cost)}</span>
        </div>
      </div>

      {onOpenJournal && (
        <button
          onClick={onOpenJournal}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-[10px] text-stone-400 transition hover:border-white/25 xl:hidden"
        >
          <ScrollText className="h-3 w-3" /> Открыть журнал
        </button>
      )}
    </div>
  )
}

function JournalPanel({ game, doneObjectives, perTurn, onToggle, onNotes }) {
  const progress = (doneObjectives / game.objectives.length) * 100

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            <Target className="h-3 w-3" /> Цели
          </p>
          <span className="text-[9px] text-stone-500">{doneObjectives}/{game.objectives.length}</span>
        </div>
        <div className="mt-2">
          <Progress value={progress} barClass="bg-gradient-to-r from-gold-400 to-amber-300" />
        </div>
        <ul className="mt-3 space-y-1.5">
          {game.objectives.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => onToggle(o.id)}
                className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-white/[0.03]"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                    o.done ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-300' : 'border-white/20 text-transparent'
                  }`}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className={`text-[11px] leading-snug ${o.done ? 'text-stone-500 line-through' : 'text-stone-300'}`}>
                  {o.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <ScrollText className="h-3 w-3" /> Заметки
        </p>
        <textarea
          value={game.notes || ''}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Кто что обещал, где спрятан ключ, кому нельзя верить…"
          rows={5}
          className="mt-2.5 w-full resize-none rounded-lg border border-white/[0.08] bg-ink-950/50 px-3 py-2 text-[11px] leading-relaxed text-stone-300 placeholder-stone-600 focus:border-gold-400/40 focus:outline-none"
        />
        <p className="mt-1 text-[9px] text-stone-600">Сохраняется автоматически</p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <Coins className="h-3 w-3" /> Сессия
        </p>
        <div className="mt-3 space-y-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-stone-500">Ходов сделано</span>
            <span className="text-stone-300">{game.turnsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Стоимость хода</span>
            <span className="text-stone-300">{formatMoney(perTurn)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Всего потрачено</span>
            <span className="font-semibold text-gold-300">{formatMoney(game.cost)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-600" />
        <p className="text-[9px] leading-relaxed text-stone-600">
          Прогресс сохраняется после каждого хода. Закрыть вкладку безопасно.
        </p>
      </div>
    </div>
  )
}
