import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Target,
  Users,
  Wand2,
} from 'lucide-react'
import ScenarioCard from '../components/ScenarioCard'
import { Badge, Modal } from '../components/ui'
import Button from '../components/Button'
import { SCENARIOS } from '../data/scenarios'

const GENRE_FILTERS = [
  { id: 'all', label: 'Все миры' },
  { id: 'Мистика', label: 'Мистика' },
  { id: 'Фэнтези', label: 'Фэнтези' },
  { id: 'Sci-Fi', label: 'Sci-Fi' },
  { id: 'Детектив', label: 'Детектив' },
  { id: 'Киберпанк', label: 'Киберпанк' },
  { id: 'Мифология', label: 'Мифология' },
]

const matchesGenre = (scenario, genre) => {
  if (genre === 'all') return true
  if (genre === 'Мистика') return /мистика|готика/i.test(scenario.genre)
  if (genre === 'Фэнтези') return /фэнтези/i.test(scenario.genre)
  return scenario.genre.toLowerCase().includes(genre.toLowerCase())
}

export default function Scenarios() {
  const [genre, setGenre] = useState('all')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SCENARIOS.filter((s) => {
      const byGenre = matchesGenre(s, genre)
      const byQuery =
        !q ||
        [s.title, s.subtitle, s.description, s.genre, ...s.tags].join(' ').toLowerCase().includes(q)
      return byGenre && byQuery
    })
  }, [genre, query])

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <Badge tone="gold">
            <Compass className="h-3 w-3" /> Каталог сценариев
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-stone-100 sm:text-5xl">
            Выберите мир, <span className="gold-text italic">в который хотите попасть</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-400 sm:text-base">
            Шесть готовых завязок с персонажами, целями и тайнами. ИИ-мастер импровизирует вокруг них, поэтому даже
            повторная игра пойдёт по другому пути.
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти приключение: особняк, космос, руны…"
              className="input pl-11"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GENRE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setGenre(f.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  genre === f.id
                    ? 'border-gold-400/50 bg-gold-400/10 text-gold-200'
                    : 'border-white/10 text-stone-400 hover:border-white/25 hover:text-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
          Найдено {filtered.length} {filtered.length === 1 ? 'приключение' : filtered.length < 5 ? 'приключения' : 'приключений'}
        </p>
        <span className="hidden items-center gap-1.5 text-[11px] text-stone-500 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-gold-400/70" /> все сценарии доступны на любом тарифе
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-28">
              <ScenarioCard scenario={s} onDetails={setActive} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <Search className="h-7 w-7 text-stone-600" />
          <h3 className="mt-4 font-display text-xl font-semibold text-stone-200">Ничего не нашлось</h3>
          <p className="mt-2 max-w-sm text-sm text-stone-500">
            Попробуйте другой запрос — или создайте собственный мир, он точно подойдёт.
          </p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setQuery(''); setGenre('all') }}>
              Сбросить фильтры
            </Button>
            <Button to="/create" size="sm">Создать свой мир</Button>
          </div>
        </div>
      )}

      <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-gold-400/25 bg-gradient-to-br from-gold-400/[0.06] to-transparent p-8 sm:p-10">
        <div className="absolute -right-10 -top-16 font-display text-[9rem] text-gold-400/[0.05]">✦</div>
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <Badge tone="violet">
              <Wand2 className="h-3 w-3" /> Свободный мир
            </Badge>
            <h2 className="mt-3 font-display text-2xl font-semibold text-stone-100 sm:text-3xl">
              Не нашли подходящую историю?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-stone-400">
              Опишите мир, героя или первую сцену одним абзацем — мастер подхватит и развернёт историю в любую сторону.
            </p>
          </div>
          <Button to="/create" size="lg" iconRight={ArrowRight}>
            Придумать свой мир
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title}
        subtitle={active?.subtitle}
        wide
        footer={
          active && (
            <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
              <p className="text-[11px] text-stone-500">Модель и цену выберете на следующем шаге</p>
              <Button to={`/create?scenario=${active.id}`} iconRight={ArrowRight}>
                Начать это приключение
              </Button>
            </div>
          )
        }
      >
        {active && (
          <div className="space-y-6">
            <div className={`relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${active.gradient}`}>
              <div className="absolute inset-0 noise" />
              <span className="relative font-display text-7xl text-white/80">{active.symbol}</span>
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2 text-[10px] text-white/70">
                <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur"><Users className="h-3 w-3" /> {active.players} игрока</span>
                <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur"><Clock className="h-3 w-3" /> {active.duration}</span>
                <span className="rounded-full bg-black/30 px-2.5 py-1 backdrop-blur">{active.difficulty}</span>
                <span className="rounded-full bg-black/30 px-2.5 py-1 backdrop-blur">{active.genre}</span>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-stone-400">{active.description}</p>

            <div className="rounded-xl border border-gold-400/20 bg-gold-400/[0.04] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-400/80">Завязка</p>
              <p className="mt-1.5 font-display text-lg italic leading-snug text-gold-100/90">{active.hook}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  <Target className="h-3.5 w-3.5 text-gold-400/80" /> Ваши цели
                </h4>
                <ul className="mt-3 space-y-2">
                  {active.objectives.map((o, i) => (
                    <li key={o} className="flex items-start gap-2 text-[12px] leading-relaxed text-stone-400">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[9px] font-semibold text-stone-400">
                        {i + 1}
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
                <h4 className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  <MapPin className="h-3.5 w-3.5 text-gold-400/80" /> Локации
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {active.locations.map((loc) => (
                    <span key={loc} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-stone-400">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  <Users className="h-3.5 w-3.5 text-gold-400/80" /> Кого вы встретите
                </h4>
                <div className="mt-3 space-y-2">
                  {active.npcs.map((npc) => (
                    <div key={npc.name} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-stone-200">{npc.name}</p>
                        <span className="text-[9px] uppercase tracking-wider text-stone-600">{npc.role}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{npc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-white/[0.07] pt-4">
              {active.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] text-stone-500">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
