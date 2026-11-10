import { getScenario, getClass } from '../data/scenarios'
import { getModel, turnCost } from '../data/models'
import { pick, shuffle, uid } from './storage'

const REACTIONS = {
  crit: [
    'Иногда история сама идёт вам навстречу.',
    'Мир на мгновение замирает — и принимает вашу сторону.',
    'Такое случается редко: всё складывается идеально.',
  ],
  success: [
    'Получается почти без усилий.',
    'План срабатывает.',
    'Вы находите верный тон — и мир отвечает.',
  ],
  partial: [
    'Успех приходит с ценой.',
    'Получается, но не совсем так, как вы задумали.',
    'Вы делаете шаг вперёд — и понимаете, что он стоил дороже, чем казалось.',
  ],
  fail: [
    'Что-то идёт не так.',
    'Мир отвечает тишиной, а затем — тем, чего вы меньше всего ждали.',
    'Попытка проваливается, и тишина становится гуще.',
  ],
}

const HOOKS = {
  crit: [
    'У вас появляется редкая возможность. Использовать её нужно сейчас.',
    'На секунду открывается то, что обычно скрыто. Вы успеваете это заметить.',
  ],
  success: [
    'Теперь у вас есть преимущество. Вопрос только в том, куда его направить.',
    'Путь вперёд открыт, но кто-то уже заметил, что вы им идёте.',
  ],
  partial: [
    'Что-то важное ускользает. Нужно решить, чем вы готовы пожертвовать.',
    'Вы близки к разгадке — ближе, чем безопасно.',
  ],
  fail: [
    'Ситуация ухудшается. Следующий шаг будет стоить дороже.',
    'Ошибка уже случилась. Остаётся решить, как её исправить.',
  ],
}

export const OUTCOME_LABEL = {
  crit: 'Критический успех',
  success: 'Успех',
  partial: 'Успех с осложнением',
  fail: 'Провал',
}

const CUSTOM = {
  title: 'Свободный мир',
  genre: 'Свободная история',
  events: [
    'Впереди появляется развилка: одна дорога ухожена и пуста, вторая заросла и явно короче.',
    'Из тумана выходит незнакомец и просит не называть его имени. Взамен он обещает ответ на один вопрос.',
    'На земле лежит предмет, которого здесь явно быть не должно. Он ещё тёплый.',
    'Где-то неподалёку звонит колокол. Никто, кроме вас, не обращает на это внимания.',
    'Вы находите записку, написанную вашим почерком. Почерк дрожит сильнее, чем ваш.',
    'Погода резко меняется, и вместе с ней меняется настроение места.',
    'Кто-то оставил для вас еду и воду. Ровно столько, сколько нужно на один день.',
    'Вдалеке загорается свет. Он движется к вам слишком уверенно.',
    'Вы натыкаетесь на следы короткой схватки. Следы ведут в сторону, откуда вы пришли.',
    'Мир вокруг становится тише — так тихо бывает перед важным разговором.',
  ],
  atmosphere: [
    'Воздух здесь пахнет иначе, чем минуту назад.',
    'Тишина кажется внимательной, будто кто-то ждёт вашего следующего слова.',
    'Свет падает под странным углом, и тени получаются слишком длинными.',
    'Где-то далеко слышен звук, который вы не можете опознать.',
    'Ветер приносит обрывок чужого разговора.',
    'Всё вокруг выглядит знакомым, но вы точно здесь не были.',
  ],
  npcs: [
    { speaker: 'Незнакомец', text: 'Ты уже сделал выбор, просто ещё не понял какой.' },
    { speaker: 'Голос за спиной', text: 'Не оборачивайся. Пока не оборачивайся.' },
    { speaker: 'Проводник', text: 'Дальше я не пойду. Но расскажу, что знаю.' },
  ],
  actions: [
    'Осмотреться внимательнее',
    'Пойти по короткой дороге',
    'Заговорить с незнакомцем',
    'Проверить найденный предмет',
    'Сделать привал и подумать',
  ],
  opening:
    'Вы делаете шаг — и мир вокруг становится другим. Незнакомым, но уже готовым принять вашу историю. Здесь ещё нет правил, зато есть вы, ваши решения и тот, кто будет их описывать.\n\nВпереди виднеется дорога. Над горизонтом висит странный свет, а в воздухе чувствуется напряжение, будто история ждёт первой реплики.\n\nВсё, что произойдёт дальше, зависит только от вас. Куда направитесь?',
}

export function rollD20() {
  return 1 + Math.floor(Math.random() * 20)
}

export function resolveOutcome(roll, dc) {
  if (roll === 20) return 'crit'
  if (roll >= dc) return 'success'
  if (roll >= dc - 4) return 'partial'
  return 'fail'
}

export function buildCustomScenario(prompt = '') {
  const clean = prompt.trim()
  return {
    id: 'custom',
    title: 'Свободный мир',
    subtitle: clean ? clean.slice(0, 120) : 'История, которую вы придумали сами',
    genre: 'Свободная история',
    tone: 'Сбалансированный',
    difficulty: 'Средне',
    duration: '—',
    players: '1–4',
    symbol: '✦',
    gradient: 'from-[#1c1430] via-[#12101f] to-[#08070d]',
    accent: 'text-arcane-300',
    tags: ['свободный мир', 'ваш сюжет'],
    description: clean || 'Опишите мир, героя или завязку — ИИ подхватит и развернёт историю.',
    hook: 'Полная свобода действий',
    opening: clean
      ? `Мир начинается с ваших слов: «${clean}».\n\n${CUSTOM.opening}`
      : CUSTOM.opening,
    objectives: ['Исследовать мир', 'Найти свою цель', 'Дожить до финала'],
    npcs: CUSTOM.npcs.map((n) => ({ name: n.speaker, role: 'Встреченный персонаж', desc: '' })),
    locations: ['Неизвестное место'],
    events: CUSTOM.events,
    atmosphere: CUSTOM.atmosphere,
    npcLines: CUSTOM.npcs,
    actions: CUSTOM.actions,
    finales: [
      'История заканчивается там, где вы решите остановиться. Вы уходите, унося с собой всё, что успели пережить, — и это остаётся с вами.',
      'Мир вокруг сворачивается в одну тихую точку, а затем раскрывается снова — уже другим. Вы понимаете, что можете вернуться сюда в любой момент.',
    ],
  }
}

export function buildOpening({ scenarioId, customPrompt, character, party = [], tone }) {
  const scenario = scenarioId === 'custom' ? buildCustomScenario(customPrompt) : getScenario(scenarioId)
  const cls = getClass(character.classId)
  const name = character.name || 'Безымянный герой'

  const intro = `${scenario.opening}`
  const persona = `Вы — ${name}, ${cls.name.toLowerCase()}. ${cls.desc.replace(/\.$/, '')}. ${
    party.length > 1 ? `С вами ещё ${party.length - 1} ${party.length - 1 === 1 ? 'спутник' : 'спутника'}.` : 'Вы здесь один — пока что.'
  }`

  const toneLine =
    tone === 'ironic'
      ? 'Впрочем, даже у самых мрачных историй есть место для шутки. Если что — виноват будет рассказчик.'
      : tone === 'dark'
        ? 'Свет здесь скупой, а тишина слишком внимательная. Не расслабляйтесь.'
        : ''

  const text = [intro, persona, toneLine].filter(Boolean).join('\n\n')

  return {
    scenario,
    text,
    choices: shuffle(scenario.actions).slice(0, 3),
  }
}

export function generateTurn({
  scenarioId,
  customPrompt,
  action,
  roll,
  dc,
  turn,
  eventOrder,
  modelId,
  plan = 'free',
  tone = 'balanced',
  playerName = 'Вы',
}) {
  const scenario = scenarioId === 'custom' ? buildCustomScenario(customPrompt) : getScenario(scenarioId)
  const outcome = resolveOutcome(roll, dc)
  const model = getModel(modelId)

  const order = eventOrder?.length ? eventOrder : scenario.events.map((_, i) => i)
  const eventIndex = order[turn % order.length]
  const event = scenario.events[eventIndex]
  const atmosphere = pick(scenario.atmosphere)
  const npc = pick(scenario.npcLines)

  const first = `${pick(REACTIONS[outcome])} ${event}`
  const second = `${atmosphere} ${npc.speaker}: «${npc.text}»`
  const third = pick(HOOKS[outcome])

  const toneTail =
    tone === 'ironic'
      ? '\n\nГде-то в глубине сцены рассказчик тихо добавляет: «Ну, по крайней мере, вы живы».'
      : tone === 'light'
        ? '\n\nЧто бы ни случилось дальше, у вас есть шанс всё исправить.'
        : ''

  const choices = shuffle(scenario.actions.filter((a) => a !== action)).slice(0, 3)

  return {
    text: [first, second, third].join('\n\n') + toneTail,
    choices,
    outcome,
    cost: turnCost(model, plan),
  }
}

export function companionAction(scenarioId) {
  const scenario = scenarioId === 'custom' ? buildCustomScenario() : getScenario(scenarioId)
  return pick(scenario.actions)
}

export function buildEpilogue({ scenarioId, turnsCount, character }) {
  const scenario = scenarioId === 'custom' ? buildCustomScenario() : getScenario(scenarioId)
  const finale = pick(scenario.finales)
  const name = character?.name || 'герой'
  return `${finale}\n\nВы прошли ${turnsCount} ${turnsCount === 1 ? 'ход' : turnsCount < 5 ? 'хода' : 'ходов'} — и оставили в этой истории след, который останется здесь надолго. ${name}, это была ваша история.`
}

export function makeRollMessage({ roll, dc, modifier = 0, outcome }) {
  return {
    id: uid('msg'),
    role: 'roll',
    roll,
    dc,
    modifier,
    total: roll + modifier,
    outcome,
    ts: Date.now(),
  }
}
