import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Crown,
  Link2,
  LogOut,
  Play,
  Settings2,
  Sparkles,
  UserPlus,
  Users,
  Wand2,
} from 'lucide-react'
import Button from '../components/Button'
import { Avatar, Badge, Modal } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteGame, getGame, saveGame } from '../lib/gameStore'
import { buildOpening } from '../lib/narrative'
import { getClass, getScenario, getDifficulty, TONES } from '../data/scenarios'
import { ACCENTS, formatMoney, getModel, turnCost } from '../data/models'

const BOTS = [
  { name: 'Мира', classId: 'mage', color: 'from-arcane-500/40 to-sky-400/30' },
  { name: 'Гриша', classId: 'warrior', color: 'from-emerald-500/40 to-teal-400/30' },
  { name: 'Ева', classId: 'bard', color: 'from-gold-500/40 to-amber-400/30' },
]

export default function Lobby() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [game, setGame] = useState(() => getGame(id))
  const [hostReady, setHostReady] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const timers = useRef([])

  useEffect(() => {
    if (!game) return undefined
    const addBot = (index) => {
      setGame((prev) => {
        if (!prev) return prev
        if (prev.party.length >= 4) return prev
        const bot = BOTS[index]
        if (!bot || prev.party.some((p) => p.name === bot.name)) return prev
        const next = { ...prev, party: [...prev.party, { ...bot, ready: true }] }
        saveGame(next)
        return next
      })
    }
    timers.current.push(window.setTimeout(() => addBot(0), 4200))
    timers.current.push(window.setTimeout(() => addBot(1), 9500))
    return () => timers.current.forEach((t) => window.clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!game) return <Navigate to="/profile" replace />

  const scenario = getScenario(game.scenarioId)
  const model = getModel(game.modelId)
  const accent = ACCENTS[model.accent] || ACCENTS.amber
  const perTurn = turnCost(model, user?.plan || 'free')
  const difficulty = getDifficulty(game.difficultyId)
  const toneLabel = TONES.find((t) => t.id === game.tone)?.label || 'Сбалансированный'

  const inviteBot = () => {
    if (game.party.length >= 4) {
      toast('В комнате уже максимум игроков', 'info')
      return
    }
    const bot = BOTS.find((b) => !game.party.some((p) => p.name === b.name))
    if (!bot) {
      toast('Все тестовые игроки уже в комнате', 'info')
      return
    }
    const next = { ...game, party: [...game.party, { ...bot, ready: true }] }
    setGame(next)
    saveGame(next)
    toast(`${bot.name} присоединился к комнате`)
  }

  const copy = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(message)
    } catch {
      toast('Не удалось скопировать — выделите код вручную', 'error')
    }
  }

  const handleStart = () => {
    // Party can grow while the lobby is open, so refresh the opening narration
    // to mention the companions who actually joined.
    const opening = buildOpening({
      scenarioId: game.scenarioId,
      customPrompt: game.customPrompt,
      character: game.character,
      party: game.party,
      tone: game.tone,
    })
    const next = {
      ...game,
      status: 'active',
      startedAt: Date.now(),
      messages: game.messages.map((message, index) =>
        index === 0 && message.role === 'gm'
          ? { ...message, text: opening.text, choices: opening.choices }
          : message,
      ),
    }
    saveGame(next)
    toast('Партия собрана. Первый ход за вами!')
    navigate(`/game/${game.id}`)
  }

  const handleLeave = () => {
    deleteGame(game.id)
    toast('Комната закрыта', 'info')
    navigate('/profile')
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/profile" className="flex items-center gap-1.5 text-[11px] text-stone-500 transition hover:text-gold-300">
          <ArrowLeft className="h-3.5 w-3.5" /> В профиль
        </Link>
        <div className="flex items-center gap-2">
          <Badge tone="green">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" /> Комната открыта
          </Badge>
          <button
            onClick={() => setLeaveOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-stone-400 transition hover:border-rose-400/30 hover:text-rose-300"
          >
            <LogOut className="h-3 w-3" /> Покинуть
          </button>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold leading-tight text-stone-100">Сбор партии</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          Отправьте друзьям код комнаты. Когда все будут готовы — начните историю. Мастер уже ждёт.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          {/* ROOM CODE */}
          <div className="panel relative overflow-hidden p-6">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold-400/[0.08] blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Код комнаты</p>
                <div className="mt-2 flex items-center gap-2.5">
                  {game.roomCode.split('').map((ch, i) => (
                    <span
                      key={i}
                      className="flex h-11 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-950/60 font-mono text-lg font-semibold text-gold-200"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-stone-600">Друзья вводят код на странице входа в комнату</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Button size="sm" variant="secondary" icon={Copy} onClick={() => copy(game.roomCode, 'Код комнаты скопирован')}>
                  Скопировать код
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Link2}
                  onClick={() => copy(`${window.location.origin}/lobby/${game.id}`, 'Ссылка-приглашение скопирована')}
                >
                  Ссылка-приглашение
                </Button>
              </div>
            </div>
          </div>

          {/* PARTY */}
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold-400/80" />
                <h2 className="text-sm font-semibold text-stone-100">Партия</h2>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-stone-400">
                  {game.party.length}/4
                </span>
              </div>
              <Button size="sm" variant="outlineGold" icon={UserPlus} onClick={inviteBot} disabled={game.party.length >= 4}>
                Позвать игрока
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {game.party.map((p) => {
                const cls = getClass(p.classId)
                const isHost = p.isHost
                return (
                  <div key={p.name} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
                    <div className="relative">
                      <Avatar name={p.name} color={p.color || 'from-stone-500/40 to-stone-400/20'} size="md" />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-ink-900 bg-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-[13px] font-semibold text-stone-200">{p.name}</p>
                        {isHost && (
                          <span className="flex items-center gap-1 rounded-full border border-gold-400/25 bg-gold-400/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-gold-300">
                            <Crown className="h-2.5 w-2.5" /> хост
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-stone-500">
                        {cls.symbol} {cls.name} · {isHost ? 'создатель комнаты' : 'готов к игре'}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-300/90">
                      <Check className="h-3 w-3" /> Готов
                    </span>
                  </div>
                )
              })}

              {Array.from({ length: Math.max(0, 4 - game.party.length) }).map((_, i) => (
                <div key={`empty_${i}`} className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.09] px-3.5 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/15 text-stone-600">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] text-stone-500">Свободное место</p>
                    <p className="text-[10px] text-stone-600">Пригласите друга по коду или позовите тестового игрока</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-white/[0.07] bg-ink-950/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-stone-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-stone-300">Мастер подключён</p>
                  <p className="text-[10px] text-stone-600">{model.name} · готов вести историю</p>
                </div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${accent.border} ${accent.bg} ${accent.text}`}>
                {formatMoney(perTurn)} / ход
              </span>
            </div>
          </div>

          {/* SETTINGS */}
          <div className="panel p-6">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-gold-400/80" />
              <h2 className="text-sm font-semibold text-stone-100">Настройки партии</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-[11px] sm:grid-cols-4">
              {[
                { label: 'Режим', value: 'Кооператив' },
                { label: 'Сложность', value: difficulty.label },
                { label: 'Настроение', value: toneLabel },
                { label: 'Модель', value: model.name },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-stone-600">{s.label}</p>
                  <p className="mt-1 truncate font-medium text-stone-300">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-stone-600">
              Настройки выбраны при создании комнаты. Чтобы изменить их, закройте комнату и создайте новую.
            </p>
          </div>
        </div>

        {/* SIDE */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 shadow-card">
            <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${scenario?.gradient || 'from-[#1c1430] via-[#12101f] to-[#08070d]'}`}>
              <div className="absolute inset-0 noise" />
              <span className="relative font-display text-5xl text-white/80">{scenario?.symbol || '✦'}</span>
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[9px] text-white/60">
                <span>{scenario?.genre || 'Свободная история'}</span>
                <span>{scenario?.duration || '—'}</span>
              </div>
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-semibold leading-tight text-stone-100">
                {game.title}
              </h2>
              <p className="mt-1.5 text-[11px] leading-relaxed text-stone-500">
                {scenario?.subtitle || game.customPrompt || 'История, придуманная вами'}
              </p>

              <div className="my-4 h-px bg-white/[0.07]" />

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500"><Clock className="h-3 w-3" /> Длительность</span>
                  <span className="text-stone-300">{scenario?.duration || 'свободно'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500"><Wand2 className="h-3 w-3" /> Цена хода</span>
                  <span className="text-gold-300">{formatMoney(perTurn)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500"><Users className="h-3 w-3" /> Игроков</span>
                  <span className="text-stone-300">{game.party.length} из 4</span>
                </div>
              </div>

              <Button full size="lg" className="mt-5" icon={Play} onClick={handleStart}>
                Начать историю
              </Button>
              <button
                onClick={() => setHostReady((v) => !v)}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-medium transition ${
                  hostReady
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : 'border-white/10 text-stone-400 hover:border-white/25'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {hostReady ? 'Вы отмечены как готовый' : 'Отметить себя готовым'}
              </button>
              <p className="mt-3 text-center text-[9px] leading-relaxed text-stone-600">
                Можно начать и одному — друзья присоединятся позже.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <InfoIcon />
            <p className="text-[10px] leading-relaxed text-stone-500">
              Это демо: тестовые игроки присоединяются сами, чтобы показать кооперативный режим. Пригласительная ссылка
              работает только внутри этого браузера.
            </p>
          </div>
        </aside>
      </div>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Закрыть комнату?"
        subtitle="Приключение ещё не началось, поэтому прогресс не сохранится"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" full onClick={() => setLeaveOpen(false)}>
              Остаться
            </Button>
            <Button variant="danger" full onClick={handleLeave} icon={LogOut}>
              Закрыть комнату
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-stone-400">
          Вы уверены? Код комнаты перестанет действовать, а приглашённые игроки не смогут присоединиться. Начать новую
          комнату можно в любой момент.
        </p>
      </Modal>
    </div>
  )
}

function InfoIcon() {
  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15 text-[9px] text-stone-500">
      i
    </span>
  )
}
