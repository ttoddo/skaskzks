import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Calendar,
  Check,
  ChevronRight,
  Coins,
  Compass,
  Crown,
  Flame,
  Gamepad2,
  Heart,
  History,
  LogOut,
  Mail,
  Pencil,
  Play,
  Plus,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import { Avatar, Badge, EmptyState, Modal, Progress, Stat } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteGame, listGames } from '../lib/gameStore'
import { formatDate, plural } from '../lib/storage'
import { ACCENTS, formatMoney, getModel } from '../data/models'
import { getClass, getScenario } from '../data/scenarios'
import { PLAN_LABELS, getPlan } from '../data/plans'

const AVATAR_COLORS = [
  'from-rose-500/40 to-orange-400/30',
  'from-arcane-500/40 to-sky-400/30',
  'from-emerald-500/40 to-teal-400/30',
  'from-gold-500/40 to-amber-400/30',
  'from-sky-500/40 to-indigo-400/30',
  'from-fuchsia-500/40 to-rose-400/30',
]

const TABS = [
  { id: 'overview', label: 'Обзор', icon: Sparkles },
  { id: 'history', label: 'История', icon: History },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const formatDay = (ts) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ts))

export default function Profile() {
  const { user, updateUser, logout, deleteAccount, verifyPassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState('overview')
  const [games, setGames] = useState(() => (user ? listGames(user.id) : []))
  const [historyFilter, setHistoryFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountConfirm, setAccountConfirm] = useState('')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    if (user) setGames(listGames(user.id))
  }, [user])

  useEffect(() => {
    setProfileForm({ name: user?.name || '', bio: user?.bio || '' })
  }, [user?.name, user?.bio])

  useEffect(() => {
    if (location.hash === '#history') setTab('history')
    else if (location.hash === '#settings') setTab('settings')
  }, [location.hash])

  const stats = useMemo(() => {
    const turns = games.reduce((s, g) => s + (g.turnsCount || 0), 0)
    const cost = games.reduce((s, g) => s + (g.cost || 0), 0)
    const active = games.filter((g) => g.status === 'active')
    const worlds = new Set(games.map((g) => g.scenarioId)).size
    return { turns, cost, active, worlds }
  }, [games])

  if (!user) return null

  const plan = getPlan(user.plan)
  const achievements = [
    { id: 'first', title: 'Первый шаг', desc: 'Начать первое приключение', icon: Sparkles, unlocked: games.length > 0 },
    { id: 'storyteller', title: 'Рассказчик', desc: 'Сделать 10 ходов', icon: ScrollText, unlocked: stats.turns >= 10, progress: Math.min(stats.turns / 10, 1) },
    { id: 'party', title: 'Душа компании', desc: 'Сыграть в кооперативе', icon: Users, unlocked: games.some((g) => g.mode === 'coop') },
    { id: 'explorer', title: 'Исследователь', desc: 'Открыть 3 разных мира', icon: Compass, unlocked: stats.worlds >= 3, progress: Math.min(stats.worlds / 3, 1) },
    { id: 'patron', title: 'Меценат', desc: 'Пополнить баланс', icon: Coins, unlocked: (user.transactions || []).some((t) => t.type === 'topup') },
    { id: 'legend', title: 'Легенда', desc: 'Оформить тариф «Легенда»', icon: Crown, unlocked: user.plan === 'legend' },
  ]
  const unlocked = achievements.filter((a) => a.unlocked).length

  const openTab = (id) => {
    setTab(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resumeLink = (g) => (g.mode === 'coop' && !g.startedAt ? `/lobby/${g.id}` : `/game/${g.id}`)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteGame(deleteTarget.id)
    setGames(listGames(user.id))
    setDeleteTarget(null)
    toast('Приключение удалено', 'info')
  }

  const saveProfile = (e) => {
    e.preventDefault()
    if (profileForm.name.trim().length < 2) {
      toast('Имя должно быть не короче 2 символов', 'error')
      return
    }
    updateUser({ name: profileForm.name.trim(), bio: profileForm.bio.trim() })
    toast('Профиль обновлён')
  }

  const setSetting = (key, value) => {
    updateUser({ settings: { ...(user.settings || {}), [key]: value } })
  }

  const changePassword = (e) => {
    e.preventDefault()
    if (!passwordForm.current) {
      toast('Введите текущий пароль', 'error')
      return
    }
    if (!verifyPassword(passwordForm.current)) {
      toast('Текущий пароль неверен', 'error')
      return
    }
    if (passwordForm.next.length < 8) {
      toast('Новый пароль должен быть не короче 8 символов', 'error')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast('Пароли не совпадают', 'error')
      return
    }
    updateUser({ password: passwordForm.next })
    setPasswordForm({ current: '', next: '', confirm: '' })
    toast('Пароль обновлён (демо)')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccount = () => {
    if (accountConfirm !== 'УДАЛИТЬ') return
    games.forEach((g) => deleteGame(g.id))
    deleteAccount()
    navigate('/')
    toast('Аккаунт удалён. До встречи в новых историях!', 'info')
  }

  const filteredGames =
    historyFilter === 'all'
      ? games
      : games.filter((g) => (historyFilter === 'active' ? g.status === 'active' : g.status === 'finished'))

  return (
    <div className="container-page py-10 sm:py-14">
      {/* PROFILE HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#191323] via-[#110e1a] to-[#0a0810] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-arcane-500/15 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-gold-500/[0.08] blur-3xl" />
          <div className="absolute inset-0 noise" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar name={user.name} color={user.avatarColor} size="xl" className="border-2 border-white/15 shadow-card" />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-ink-900 text-gold-300">
              {user.plan === 'legend' ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold text-stone-100 sm:text-4xl">{user.name}</h1>
              <Badge tone={user.plan === 'free' ? 'default' : 'gold'}>
                {user.plan === 'legend' ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                {PLAN_LABELS[user.plan]}
              </Badge>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {user.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> с {formatDay(user.createdAt)}</span>
            </p>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone-400">
              {user.bio || 'Расскажите о себе — какие истории вам нравятся и с кем вы обычно играете.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openTab('settings')}>
              Редактировать
            </Button>
            <Button to="/payment" size="sm" icon={Plus}>
              Пополнить
            </Button>
          </div>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="Баланс" value={formatMoney(user.balance)} icon={Wallet} />
          <Stat label="Приключения" value={games.length} icon={Gamepad2} hint={`${stats.active.length} активных`} />
          <Stat label="Ходов" value={stats.turns} icon={ScrollText} hint={`${plural(stats.turns, 'ход', 'хода', 'ходов')} в историях`} />
          <Stat label="Потрачено" value={formatMoney(stats.cost)} icon={Coins} hint="на генерации" />
        </div>
      </div>

      {/* TABS */}
      <div className="mt-7 flex flex-wrap gap-1.5 border-b border-white/[0.07] pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => openTab(t.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition ${
              tab === t.id ? 'bg-gold-400/10 text-gold-200' : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.id === 'history' && <span className="rounded-full bg-white/[0.07] px-1.5 text-[9px]">{games.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.45fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-stone-100">
                  <Play className="h-4 w-4 text-gold-400" /> Продолжить
                </h2>
                <button onClick={() => openTab('history')} className="flex items-center gap-1 text-[11px] text-stone-500 transition hover:text-gold-300">
                  Вся история <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {stats.active.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {stats.active.slice(0, 4).map((g) => (
                    <ActiveGameCard key={g.id} game={g} to={resumeLink(g)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Gamepad2}
                  title="Пока ни одной активной истории"
                  description="Выберите сценарий или придумайте свой мир — мастер уже готов начать."
                  action={<Button to="/create" size="sm" icon={Sparkles}>Создать приключение</Button>}
                />
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-stone-100">
                  <Award className="h-4 w-4 text-gold-400" /> Достижения
                </h2>
                <span className="text-[11px] text-stone-500">{unlocked} из {achievements.length}</span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                      a.unlocked ? 'border-gold-400/25 bg-gold-400/[0.04]' : 'border-white/[0.07] bg-white/[0.015] opacity-70'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${a.unlocked ? 'border-gold-400/30 bg-gold-400/10 text-gold-300' : 'border-white/10 bg-white/[0.03] text-stone-600'}`}>
                      <a.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12px] font-semibold ${a.unlocked ? 'text-stone-200' : 'text-stone-500'}`}>{a.title}</p>
                      <p className="text-[10px] text-stone-600">{a.desc}</p>
                      {!a.unlocked && typeof a.progress === 'number' && (
                        <div className="mt-1.5">
                          <Progress value={a.progress * 100} barClass="bg-gradient-to-r from-gold-400/70 to-amber-300/70" className="h-1" />
                        </div>
                      )}
                    </div>
                    {a.unlocked && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold text-stone-100">
                <History className="h-4 w-4 text-gold-400" /> Последние приключения
              </h2>
              {games.length > 0 ? (
                <div className="space-y-2">
                  {games.slice(0, 3).map((g) => (
                    <HistoryRow key={g.id} game={g} to={resumeLink(g)} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">Здесь появятся ваши истории.</p>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.09] via-transparent to-transparent p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Баланс</span>
                <Wallet className="h-4 w-4 text-gold-400/80" />
              </div>
              <p className="mt-2 font-display text-4xl font-semibold text-stone-100">{formatMoney(user.balance)}</p>
              <p className="mt-1 text-[11px] text-stone-500">
                ≈ {Math.floor(user.balance / Math.max(1, getModel('gpt-4o').pricePerTurn))} ходов на GPT-4o
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button to="/payment" size="sm" icon={Plus}>Пополнить</Button>
                <Button to="/models" size="sm" variant="secondary">Тарифы</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Ваш тариф</span>
                {user.plan === 'legend' ? <Crown className="h-4 w-4 text-gold-300" /> : <Sparkles className="h-4 w-4 text-gold-300" />}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="font-display text-2xl font-semibold text-stone-100">{plan.name}</p>
                <span className="text-[11px] text-stone-500">{plan.price === 0 ? 'бесплатно' : `${formatMoney(plan.price)} / мес`}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                {plan.discount > 0 ? `Скидка ${plan.discount}% на каждый ход любой модели.` : 'Без скидки на ходы. Перейдите на тариф, чтобы платить меньше.'}
              </p>
              {user.planUntil && (
                <p className="mt-2 text-[10px] text-stone-600">Активен до {formatDay(user.planUntil)}</p>
              )}
              <Button to={`/payment?plan=${user.plan === 'legend' ? 'legend' : 'adventurer'}`} variant="secondary" size="sm" full className="mt-3">
                {user.plan === 'free' ? 'Перейти на «Искателя»' : user.plan === 'adventurer' ? 'Перейти на «Легенду»' : 'Продлить тариф'}
              </Button>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Операции</span>
                <Link to="/payment#history" className="text-[10px] text-stone-500 transition hover:text-gold-300">Все</Link>
              </div>
              <div className="mt-3 space-y-2.5">
                {(user.transactions || []).slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.amount > 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.04] text-stone-400'}`}>
                      {t.amount > 0 ? <Plus className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] text-stone-300">{t.title}</p>
                      <p className="text-[9px] text-stone-600">{formatDate(t.ts)}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold ${t.amount > 0 ? 'text-emerald-300' : 'text-stone-400'}`}>
                      {t.amount > 0 ? '+' : ''}{formatMoney(t.amount)}
                    </span>
                  </div>
                ))}
                {(!user.transactions || user.transactions.length === 0) && (
                  <p className="text-[11px] text-stone-600">Операций пока нет.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="mt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Все', count: games.length },
                { id: 'active', label: 'Активные', count: games.filter((g) => g.status === 'active').length },
                { id: 'finished', label: 'Завершённые', count: games.filter((g) => g.status === 'finished').length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setHistoryFilter(f.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-[11px] transition ${
                    historyFilter === f.id ? 'border-gold-400/50 bg-gold-400/10 text-gold-200' : 'border-white/10 text-stone-400 hover:border-white/25'
                  }`}
                >
                  {f.label} <span className="text-stone-600">{f.count}</span>
                </button>
              ))}
            </div>
            <Button to="/create" size="sm" icon={Plus}>Новое приключение</Button>
          </div>

          {filteredGames.length > 0 ? (
            <div className="mt-5 space-y-2.5">
              {filteredGames.map((g) => (
                <HistoryRow key={g.id} game={g} to={resumeLink(g)} detailed onDelete={() => setDeleteTarget(g)} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={ScrollText}
                title="Здесь пока пусто"
                description="Начните приключение — и оно появится в истории вместе с эпилогом и статистикой."
                action={<Button to="/create" size="sm" icon={Sparkles}>Начать историю</Button>}
              />
            </div>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-5">
            <form onSubmit={saveProfile} className="panel p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <User className="h-4 w-4 text-gold-400/80" /> Личные данные
              </h2>
              <div className="mt-5 flex items-center gap-4">
                <Avatar name={profileForm.name || user.name} color={user.avatarColor} size="lg" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Аватар</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateUser({ avatarColor: c })}
                        className={`h-6 w-6 rounded-full border-2 bg-gradient-to-br transition ${c} ${
                          user.avatarColor === c ? 'border-gold-300' : 'border-transparent hover:border-white/30'
                        }`}
                        aria-label="Выбрать цвет аватара"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="profile-name">Имя</label>
                  <input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="input"
                    maxLength={48}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="profile-email">Почта</label>
                  <input id="profile-email" value={user.email} disabled className="input opacity-60" />
                  <p className="mt-1 text-[9px] text-stone-600">Почту в демо-версии изменить нельзя</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="label" htmlFor="profile-bio">О себе</label>
                <textarea
                  id="profile-bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                  maxLength={280}
                  placeholder="Какие истории вам нравятся, с кем играете, кем были в прошлой кампании…"
                  className="input resize-none"
                />
                <div className="mt-1 text-right text-[9px] text-stone-600">{profileForm.bio.length}/280</div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" size="sm" icon={Check}>Сохранить изменения</Button>
              </div>
            </form>

            <form onSubmit={changePassword} className="panel p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <Shield className="h-4 w-4 text-gold-400/80" /> Безопасность
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="old-pass">Текущий пароль</label>
                  <input
                    id="old-pass"
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="new-pass">Новый пароль</label>
                  <input
                    id="new-pass"
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                    className="input"
                    placeholder="Минимум 8 символов"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="repeat-pass">Повторите</label>
                  <input
                    id="repeat-pass"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="input"
                    placeholder="Ещё раз"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" size="sm" variant="secondary">Обновить пароль</Button>
              </div>
            </form>

            <div className="panel border-rose-400/15 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-200">
                <Flame className="h-4 w-4" /> Опасная зона
              </h2>
              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[12px] font-medium text-stone-200">Удалить аккаунт</p>
                  <p className="mt-0.5 text-[11px] text-stone-500">Все кампании и история операций будут удалены безвозвратно.</p>
                </div>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => setAccountOpen(true)}>
                  Удалить
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="panel p-5">
              <h2 className="text-sm font-semibold text-stone-100">Уведомления и звук</h2>
              <div className="mt-4 space-y-1">
                {[
                  { key: 'sound', title: 'Звуки интерфейса', desc: 'Кубик, отправка хода, уведомления' },
                  { key: 'notifications', title: 'Уведомления', desc: 'Напоминания о незаконченных кампаниях' },
                  { key: 'dice', title: 'Показывать броски', desc: 'Карточки d20 и результаты проверок' },
                  { key: 'reduceMotion', title: 'Меньше анимаций', desc: 'Для комфортного чтения' },
                ].map((s) => {
                  const value = user.settings?.[s.key] ?? true
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSetting(s.key, !value)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2.5 text-left transition hover:bg-white/[0.02]"
                    >
                      <div>
                        <p className="text-[12px] text-stone-300">{s.title}</p>
                        <p className="text-[10px] text-stone-600">{s.desc}</p>
                      </div>
                      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${value ? 'bg-gold-400' : 'bg-white/15'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${value ? 'left-[18px]' : 'left-0.5'}`} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="panel p-5">
              <h2 className="text-sm font-semibold text-stone-100">Аккаунт</h2>
              <div className="mt-4 space-y-2">
                <Button to="/payment" variant="secondary" size="sm" full icon={Wallet}>История операций</Button>
                <Button onClick={handleLogout} variant="ghost" size="sm" full icon={LogOut}>Выйти из аккаунта</Button>
              </div>
              <p className="mt-3 text-[9px] leading-relaxed text-stone-600">
                ID: {user.id} · Данные хранятся локально в браузере.
              </p>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Удалить приключение?"
        subtitle={deleteTarget?.title}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" full onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <Button variant="danger" full icon={Trash2} onClick={handleDelete}>Удалить</Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-stone-400">
          История, эпилог и заметки будут удалены из профиля. Отменить это действие нельзя.
        </p>
      </Modal>

      <Modal
        open={accountOpen}
        onClose={() => {
          setAccountOpen(false)
          setAccountConfirm('')
        }}
        title="Удалить аккаунт?"
        subtitle="Это действие нельзя отменить"
      >
        <p className="text-sm leading-relaxed text-stone-400">
          Будут удалены все приключения, достижения и история операций. Чтобы подтвердить, введите слово{' '}
          <span className="font-semibold text-rose-300">УДАЛИТЬ</span>.
        </p>
        <input
          value={accountConfirm}
          onChange={(e) => setAccountConfirm(e.target.value)}
          placeholder="УДАЛИТЬ"
          className="input mt-4"
        />
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" full onClick={() => setAccountOpen(false)}>Передумал</Button>
          <Button variant="danger" full icon={Trash2} onClick={handleDeleteAccount} disabled={accountConfirm !== 'УДАЛИТЬ'}>
            Удалить аккаунт
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function ActiveGameCard({ game, to }) {
  const scenario = getScenario(game.scenarioId)
  const model = getModel(game.modelId)
  const accent = ACCENTS[model.accent] || ACCENTS.amber
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition hover:-translate-y-0.5 hover:border-gold-400/30 hover:bg-white/[0.04]"
    >
      <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${scenario?.gradient || 'from-[#1c1430] via-[#12101f] to-[#08070d]'}`}>
        <div className="absolute inset-0 noise" />
        <span className="relative font-display text-4xl text-white/80">{scenario?.symbol || '✦'}</span>
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[8px] text-white/70 backdrop-blur">
          {game.mode === 'coop' ? 'Кооператив' : 'Одиночная'}
        </span>
        <span className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[8px] font-semibold backdrop-blur ${accent.border} ${accent.bg} ${accent.text}`}>
          {model.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[13px] font-semibold text-stone-100">{game.title}</h3>
        <p className="mt-1 text-[10px] text-stone-500">Ход {game.turnsCount + 1} · {formatMoney(game.cost)} потрачено</p>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
          <span className="text-[10px] text-stone-600">{formatDate(game.updatedAt)}</span>
          <span className="flex items-center gap-1 text-[10px] font-medium text-gold-300">
            Продолжить <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function HistoryRow({ game, to, detailed = false, onDelete }) {
  const scenario = getScenario(game.scenarioId)
  const model = getModel(game.modelId)
  const accent = ACCENTS[model.accent] || ACCENTS.amber
  const finished = game.status === 'finished'

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-white/20 hover:bg-white/[0.04]">
      <Link to={to} className="flex min-w-0 flex-1 items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br ${scenario?.gradient || 'from-[#1c1430] via-[#12101f] to-[#08070d]'} text-lg`}>
          {scenario?.symbol || '✦'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[12px] font-semibold text-stone-200">{game.title}</p>
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${finished ? 'bg-white/[0.06] text-stone-500' : 'bg-emerald-400/10 text-emerald-300'}`}>
              {finished ? 'завершено' : 'активно'}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-stone-500">
            {game.mode === 'coop' ? `кооператив · ${game.party.length} ${plural(game.party.length, 'игрок', 'игрока', 'игроков')}` : 'одиночная'} · {game.turnsCount} {plural(game.turnsCount, 'ход', 'хода', 'ходов')} · {model.name}
            {detailed && ` · ${formatMoney(game.cost)}`}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[10px] text-stone-500">{formatDate(game.updatedAt)}</p>
          {!finished && <p className="mt-0.5 text-[10px] font-medium text-gold-300">Продолжить</p>}
        </div>
      </Link>
      {onDelete ? (
        <button
          onClick={onDelete}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-600 transition hover:bg-rose-500/10 hover:text-rose-300"
          aria-label="Удалить приключение"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Link to={to} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-white/[0.05] hover:text-gold-300">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
