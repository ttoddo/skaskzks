import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Coins,
  Dices,
  Globe,
  Heart,
  Layers,
  Lock,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wand2,
  Zap,
} from 'lucide-react'
import Button from '../components/Button'
import { Badge, SectionTitle } from '../components/ui'
import ModelCard from '../components/ModelCard'
import ScenarioCard from '../components/ScenarioCard'
import PlanCards from '../components/PlanCards'
import { MODELS } from '../data/models'
import { SCENARIOS } from '../data/scenarios'
import { useAuth } from '../context/AuthContext'

const FAQ = [
  {
    q: 'Нужно ли знать правила настольных игр?',
    a: 'Нет. ИИ-мастер сам ведёт историю, описывает последствия и подсказывает варианты действий. Вы просто пишете, что хотите сделать, — как в обычном чате.',
  },
  {
    q: 'Как формируется цена игры?',
    a: 'Вы платите за каждый ход генерации. Стоимость зависит от выбранной модели: от 1 ₽ за ход на открытых моделях до 8 ₽ на флагманах. Перед стартом показываем примерную стоимость сессии из 30 ходов.',
  },
  {
    q: 'Можно ли играть с друзьями?',
    a: 'Да. При создании приключения выберите режим «Кооператив», получите код комнаты и отправьте его друзьям. Все действия попадают в общий чат, а мастер учитывает решения каждого игрока.',
  },
  {
    q: 'Сохраняется ли прогресс?',
    a: 'Каждый ход автоматически сохраняется в вашем профиле. Можно закрыть вкладку и вернуться к кампании позже — мастер помнит, что произошло раньше.',
  },
  {
    q: 'Это настоящий ИИ?',
    a: 'Это демонстрационная версия дипломного проекта: ответы мастера имитируются локально по сценарию, а оплата не списывает реальные деньги. Архитектура готова к подключению реального API генеративной модели.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  const startLink = user ? '/create' : '/register'
  const featuredModels = MODELS.slice(0, 3)
  const featuredScenarios = SCENARIOS.slice(0, 3)

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.16),transparent_65%)]" />
          <div className="absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-gold-500/[0.07] blur-[100px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
        </div>

        <div className="container-page grid gap-16 pb-20 pt-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="animate-fade-up">
            <Badge tone="gold">
              <Sparkles className="h-3 w-3" />
              Дипломный проект · Generative AI
            </Badge>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.03] tracking-tight text-stone-100 sm:text-6xl xl:text-[4.3rem]">
              Ваша история.
              <br />
              Ваши решения.
              <br />
              <span className="gold-text italic">ИИ-мастер.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-stone-400 sm:text-base">
              «Сказание» — веб-сервис интерактивных текстовых квестов. Опишите действие — генеративная модель
              продолжит историю. Играйте в одиночку или с друзьями, выбирайте ИИ и платите только за ходы.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to={startLink} size="lg" iconRight={ArrowRight}>
                Начать приключение
              </Button>
              <Button to="/scenarios" size="lg" variant="secondary" icon={BookOpen}>
                Смотреть сценарии
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    'from-rose-500/50 to-orange-400/40',
                    'from-arcane-500/50 to-sky-400/40',
                    'from-emerald-500/50 to-teal-400/40',
                  ].map((c, i) => (
                    <span
                      key={i}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border border-ink-950 bg-gradient-to-br ${c} text-[9px] font-bold text-white/80`}
                    >
                      {['А', 'М', 'Г'][i]}
                    </span>
                  ))}
                </div>
                <span>2 340 игроков уже написали свои истории</span>
              </div>
              <span className="flex items-center gap-1 text-gold-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
                <span className="ml-1 text-stone-500">4.9</span>
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(232,185,79,0.12),transparent_65%)] blur-2xl" />
            <div className="relative mx-auto max-w-[460px]">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/90 shadow-card backdrop-blur">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/25 bg-rose-400/10 text-sm">🕯</span>
                    <div>
                      <p className="text-[11px] font-semibold leading-tight text-stone-200">Проклятие дома Вороновых</p>
                      <p className="text-[9px] text-stone-500">Кооператив · 3 игрока</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-[8px] font-semibold text-orange-300">
                    Claude 3.7
                  </span>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-[9px] font-bold text-ink-950">
                      М
                    </span>
                    <div className="rounded-xl rounded-tl-sm border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                      <p className="text-[10px] leading-relaxed text-stone-400">
                        Дворецкий замирает у лестницы. «В детскую лучше не подниматься», — говорит он, но не делает ни шага,
                        чтобы вас остановить.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl rounded-tr-sm border border-gold-400/20 bg-gold-400/[0.08] px-3 py-2">
                      <p className="text-[10px] leading-relaxed text-gold-100/90">Я поднимаюсь в детскую и прислушиваюсь.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-ink-950/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Dices className="h-3.5 w-3.5 text-arcane-300" />
                      <span className="text-[9px] uppercase tracking-wider text-stone-500">Проверка ловкости</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-stone-300">d20 = 17</span>
                      <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-300">успех</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-[9px] font-bold text-ink-950">
                      М
                    </span>
                    <div className="rounded-xl rounded-tl-sm border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                      <p className="text-[10px] leading-relaxed text-stone-400">
                        За дверью кто-то тихо считает. На третьем счёте голос сбивается и произносит ваше имя.
                        <span className="mt-1 block text-gold-200/80">— «Ты обещал остаться».</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pl-8">
                    {['Открыть дверь', 'Позвать дворецкого', 'Осмотреть замок'].map((choice) => (
                      <span key={choice} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] text-stone-400">
                        {choice}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2">
                    <span className="flex-1 text-[10px] text-stone-600">Что вы сделаете?</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400/90 text-ink-950">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -left-5 top-24 hidden animate-float rounded-xl border border-white/10 bg-ink-850/95 px-3 py-2 shadow-card backdrop-blur sm:block">
                <div className="flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 text-gold-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-stone-500">Ход</p>
                    <p className="text-[11px] font-semibold text-stone-200">8 ₽</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-20 hidden animate-float rounded-xl border border-emerald-400/20 bg-ink-850/95 px-3 py-2 shadow-card backdrop-blur [animation-delay:1.5s] sm:block">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-[10px] font-medium text-stone-300">Сохранено</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="container-page grid grid-cols-2 divide-white/[0.06] py-6 sm:grid-cols-4 sm:divide-x">
            {[
              { value: '7', label: 'генеративных моделей' },
              { value: '6', label: 'готовых сценариев' },
              { value: '4', label: 'игрока в партии' },
              { value: '1 ₽', label: 'минимальная цена хода' },
            ].map((s) => (
              <div key={s.label} className="px-4 py-3 text-center sm:py-0">
                <div className="font-display text-2xl font-semibold text-stone-100">{s.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="container-page py-20 sm:py-28">
        <SectionTitle
          eyebrow="Как это работает"
          title="Три шага до первой сцены"
          description="Никаких правил, подготовки и поиска компании. Только вы, история и мастер, который никогда не устаёт."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              num: '01',
              title: 'Выберите мир',
              text: 'Возьмите готовый сценарий — от готического особняка до орбитальной станции — или опишите собственный мир одним абзацем.',
            },
            {
              icon: Users,
              num: '02',
              title: 'Соберите партию',
              text: 'Играйте один или пригласите до трёх друзей по коду комнаты. Выберите модель ИИ — цена за ход видна сразу.',
            },
            {
              icon: Wand2,
              num: '03',
              title: 'Пишите действия',
              text: 'Мастер описывает последствия, бросает кубик и предлагает варианты. История сохраняется после каждого хода.',
            },
          ].map((step) => (
            <div key={step.num} className="group panel panel-hover relative overflow-hidden p-6">
              <span className="absolute right-5 top-4 font-display text-5xl font-semibold text-white/[0.04]">{step.num}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/[0.07] text-gold-300">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-stone-100">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-stone-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page pb-20 sm:pb-28">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="panel relative overflow-hidden p-7 lg:col-span-2">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-arcane-500/10 blur-3xl" />
            <Badge tone="violet">Кооператив</Badge>
            <h3 className="mt-4 font-display text-2xl font-semibold text-stone-100 sm:text-3xl">
              Одна история на всех
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-400">
              Соберите друзей в комнате по коду и играйте в одном чате. Мастер видит действия каждого, сталкивает
              характеры и помнит, кто что обещал.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { name: 'Алексей', cls: 'Плут', color: 'from-rose-500/40 to-orange-400/30' },
                { name: 'Мира', cls: 'Маг', color: 'from-arcane-500/40 to-sky-400/30' },
                { name: 'Гриша', cls: 'Воин', color: 'from-emerald-500/40 to-teal-400/30' },
                { name: 'Ева', cls: 'Бард', color: 'from-gold-500/40 to-amber-400/30' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${p.color} text-[10px] font-bold text-white/80`}>
                    {p.name[0]}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold leading-tight text-stone-200">{p.name}</p>
                    <p className="text-[9px] text-stone-500">{p.cls}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-1.5 rounded-full border border-dashed border-white/15 px-3 py-1.5 text-[10px] text-stone-500">
                <Users className="h-3 w-3" /> + пригласить
              </div>
            </div>
          </div>

          <div className="panel p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-stone-100">Прозрачная цена</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              Выбирайте модель под задачу и бюджет. Стоимость хода и примерная цена сессии видны до старта.
            </p>
            <div className="mt-5 space-y-2">
              {[
                { name: 'Llama 3.3', price: '1 ₽ / ход' },
                { name: 'DeepSeek V3', price: '2 ₽ / ход' },
                { name: 'GPT-4o', price: '7 ₽ / ход' },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                  <span className="text-[11px] text-stone-300">{m.name}</span>
                  <span className="text-[11px] font-semibold text-gold-300">{m.price}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            {
              icon: MessageSquare,
              title: 'Живой диалог',
              text: 'Не выбирайте из готовых реплик — пишите своими словами. Мастер понимает намерение, а не только команду.',
            },
            {
              icon: Dices,
              title: 'Кубик решает',
              text: 'Каждое рискованное действие сопровождается броском d20. Критический успех и провал меняют сюжет.',
            },
            {
              icon: Lock,
              title: 'Прогресс не теряется',
              text: 'Автосохранение после каждого хода. Вернитесь к кампании через день — мастер помнит всё.',
            },
          ].map((f) => (
            <div key={f.title} className="panel panel-hover p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gold-300">
                <f.icon className="h-[18px] w-[18px]" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-stone-100">{f.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODELS */}
      <section id="models" className="container-page pb-20 sm:pb-28">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionTitle
            eyebrow="Модели"
            title="Выберите рассказчика"
            description="От быстрых открытых моделей до флагманов с литературным стилем. Цена — за каждый ход."
            align="left"
            className="max-w-xl"
          />
          <Button to="/models" variant="secondary" size="sm" iconRight={ArrowRight}>
            Все модели и цены
          </Button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {featuredModels.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      </section>

      {/* SCENARIOS */}
      <section className="container-page pb-20 sm:pb-28">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionTitle
            eyebrow="Сценарии"
            title="Истории на любой вечер"
            description="Готовые завязки, персонажи и цели. Мастер импровизирует вокруг них — две игры не будут похожи."
            align="left"
            className="max-w-xl"
          />
          <Button to="/scenarios" variant="secondary" size="sm" iconRight={ArrowRight}>
            Все сценарии
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featuredScenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} compact />
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="container-page pb-20 sm:pb-28">
        <SectionTitle
          eyebrow="Тарифы"
          title="Играйте так, как удобно"
          description="Оплата по ходу без подписки или тариф со скидкой на каждую генерацию. Отменить можно в любой момент."
        />
        <div className="mt-12">
          <PlanCards compact />
        </div>
        <p className="mt-5 text-center text-[11px] text-stone-600">
          Демо-режим: оплата имитируется, реальные средства не списываются.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page pb-20 sm:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionTitle
            eyebrow="Вопросы"
            title="Коротко о главном"
            description="Если чего-то не хватает — напишите нам, мы допишем."
            align="left"
          />
          <div className="space-y-2.5">
            {FAQ.map((item, i) => (
              <div key={item.q} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-stone-200">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-stone-500 transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="animate-fade-in px-5 pb-5 text-[13px] leading-relaxed text-stone-400">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="container-page pb-20 sm:pb-28">
        <div className="panel relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-arcane-500/10 blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge tone="gold">
                <Globe className="h-3 w-3" /> О проекте
              </Badge>
              <h2 className="mt-4 font-display text-3xl font-semibold text-stone-100">Дипломный проект, в который хочется играть</h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-400">
                «Сказание» исследует, как генеративные модели меняют настольные истории: снимают нагрузку с мастера,
                убирают порог входа и делают кооператив доступным в любой момент. Фронтенд полностью кликабелен,
                данные хранятся в браузере, а ответы ИИ имитируются по сценарным шаблонам.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['React 18', 'Vite', 'Tailwind CSS', 'React Router', 'LocalStorage API', 'Lucide Icons'].map((tech) => (
                  <span key={tech} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-stone-400">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, value: '< 3 сек', label: 'на ответ мастера' },
                { icon: Users, value: 'до 4', label: 'игроков в комнате' },
                { icon: Layers, value: '∞', label: 'вариантов развития' },
                { icon: Heart, value: '100%', label: 'кликабельности' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.08] bg-ink-900/60 p-4">
                  <s.icon className="h-4 w-4 text-gold-400/80" />
                  <div className="mt-3 font-display text-2xl font-semibold text-stone-100">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-4">
        <div className="relative overflow-hidden rounded-3xl border border-gold-400/20 bg-gradient-to-br from-[#1a1424] via-[#120e1b] to-[#0a0810] px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-gold-400/[0.12] blur-3xl" />
            <div className="absolute inset-0 noise" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="mt-6 font-display text-3xl font-semibold leading-tight text-stone-100 sm:text-5xl">
              Первая сцена уже ждёт
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone-400">
              Зарегистрируйтесь, получите 300 ₽ на баланс и начните историю, которую никто, кроме вас, не читал.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to={startLink} size="lg" iconRight={ArrowRight}>
                {user ? 'Создать приключение' : 'Зарегистрироваться бесплатно'}
              </Button>
              <Button to="/login" size="lg" variant="secondary" icon={Play}>
                Войти в аккаунт
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-stone-500">
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Без карты</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> 300 ₽ в подарок</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Отмена в один клик</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
