import { read, write, uid, roomCode, shuffle } from './storage'
import { getScenario, getClass, getDifficulty } from '../data/scenarios'
import { getModel, turnCost } from '../data/models'
import { buildOpening, generateTurn, buildEpilogue, rollD20, resolveOutcome } from './narrative'

const GAMES_KEY = 'games'
const SEED_KEY = 'games.seeded'

const CLASS_KITS = {
  warrior: { items: ['Длинный меч', 'Кожаный доспех', 'Точильный камень'], gold: 12 },
  mage: { items: ['Посох из ясеня', 'Гримуар', 'Свеча на удачу'], gold: 8 },
  rogue: { items: ['Кинжал', 'Отмычки', 'Колода краплёных карт'], gold: 24 },
  bard: { items: ['Лютня', 'Плащ с подкладкой', 'Письмо к старому другу'], gold: 15 },
  ranger: { items: ['Короткий лук', 'Компас', 'Сухие пайки'], gold: 10 },
  cleric: { items: ['Символ веры', 'Целебная мазь', 'Молитвенник'], gold: 9 },
}

export function listGames(userId) {
  ensureSeedGames()
  return read(GAMES_KEY, [])
    .filter((g) => g.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getGame(id) {
  return read(GAMES_KEY, []).find((g) => g.id === id) || null
}

export function saveGame(game) {
  const games = read(GAMES_KEY, [])
  const next = games.some((g) => g.id === game.id)
    ? games.map((g) => (g.id === game.id ? { ...game, updatedAt: Date.now() } : g))
    : [{ ...game, updatedAt: Date.now() }, ...games]
  write(GAMES_KEY, next)
  return game
}

export function deleteGame(id) {
  write(GAMES_KEY, read(GAMES_KEY, []).filter((g) => g.id !== id))
}

export function createGame({
  userId,
  scenarioId = 'custom',
  customPrompt = '',
  modelId = 'gpt-4o',
  mode = 'solo',
  tone = 'balanced',
  difficultyId = 'medium',
  character,
  party = [],
  title,
}) {
  const scenario = scenarioId === 'custom' ? null : getScenario(scenarioId)
  const cls = getClass(character.classId)
  const kit = CLASS_KITS[character.classId] || CLASS_KITS.warrior
  const opening = buildOpening({ scenarioId, customPrompt, character, party, tone })

  const game = {
    id: uid('game'),
    userId,
    scenarioId,
    customPrompt,
    title: title || scenario?.title || 'Свободный мир',
    modelId,
    mode,
    tone,
    difficultyId,
    character: {
      ...character,
      classId: cls.id,
      className: cls.name,
      symbol: cls.symbol,
      hp: cls.hp,
      maxHp: cls.hp,
    },
    party: party.map((p) => ({ ...p, ready: true })),
    roomCode: mode === 'coop' ? roomCode() : null,
    status: 'active',
    cost: 0,
    turnsCount: 0,
    inventory: kit.items,
    gold: kit.gold,
    objectives: (scenario?.objectives || ['Исследовать мир', 'Найти свою цель', 'Дожить до финала']).map((text, i) => ({
      id: `obj_${i}`,
      text,
      done: false,
    })),
    eventOrder: shuffle(opening.scenario.events.map((_, i) => i)),
    messages: [
      {
        id: uid('msg'),
        role: 'gm',
        author: 'Мастер',
        text: opening.text,
        choices: opening.choices,
        ts: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  saveGame(game)
  return game
}

export function addMessage(game, message) {
  return { ...game, messages: [...game.messages, message] }
}

export function applyAction(game, { action, playerName, plan, isCompanion = false, alreadyAdded = false }) {
  const model = getModel(game.modelId)
  const dc = getDifficulty(game.difficultyId).dc
  const roll = rollD20()
  const outcome = resolveOutcome(roll, dc)
  const turn = game.turnsCount
  const generated = generateTurn({
    scenarioId: game.scenarioId,
    customPrompt: game.customPrompt,
    action,
    roll,
    dc,
    turn,
    eventOrder: game.eventOrder,
    modelId: game.modelId,
    plan,
    tone: game.tone,
    playerName,
  })

  const now = Date.now()
  const messages = [
    ...game.messages,
    ...(alreadyAdded
      ? []
      : [
          {
            id: uid('msg'),
            role: 'player',
            author: playerName,
            text: action,
            ts: now,
          },
        ]),
    {
      id: uid('msg'),
      role: 'roll',
      roll,
      dc,
      outcome,
      ts: now + 1,
    },
    {
      id: uid('msg'),
      role: 'gm',
      author: 'Мастер',
      text: generated.text,
      choices: generated.choices,
      outcome: generated.outcome,
      modelId: game.modelId,
      ts: now + 2,
    },
  ]

  const objectives = game.objectives.map((o, i) =>
    i === turn % game.objectives.length && Math.random() > 0.45 ? { ...o, done: true } : o,
  )

  const cost = turnCost(model, plan)
  return {
    ...game,
    messages,
    objectives,
    turnsCount: game.turnsCount + 1,
    cost: game.cost + cost,
    lastCost: cost,
    hp: Math.max(1, game.character.hp - (outcome === 'fail' ? 2 : outcome === 'partial' ? 1 : 0)),
    character: {
      ...game.character,
      hp: Math.max(1, game.character.hp - (outcome === 'fail' ? 2 : outcome === 'partial' ? 1 : 0)),
    },
    updatedAt: Date.now(),
  }
}

export function finishGame(game) {
  const epilogue = buildEpilogue({
    scenarioId: game.scenarioId,
    turnsCount: game.turnsCount,
    character: game.character,
  })
  return {
    ...game,
    status: 'finished',
    finishedAt: Date.now(),
    messages: [
      ...game.messages,
      { id: uid('msg'), role: 'epilogue', author: 'Эпилог', text: epilogue, ts: Date.now() },
    ],
  }
}

function seedGame({ userId, scenarioId, modelId, mode, character, party, turns, createdAt, finished, cost, plan = 'free' }) {
  let game = createGame({
    userId,
    scenarioId,
    modelId,
    mode,
    character,
    party,
    tone: 'balanced',
    difficultyId: 'medium',
  })
  const scenario = getScenario(scenarioId)
  for (let i = 0; i < turns; i += 1) {
    game = applyAction(game, {
      action: scenario.actions[i % scenario.actions.length],
      playerName: character.name,
      plan,
      isCompanion: false,
    })
  }
  game = {
    ...game,
    createdAt,
    startedAt: createdAt,
    updatedAt: createdAt + turns * 60_000,
    cost,
  }
  if (finished) {
    game = finishGame(game)
    game.createdAt = createdAt
    game.updatedAt = createdAt + 60 * 60 * 1000
  }
  saveGame(game)
  return game
}

function ensureSeedGames() {
  if (read(SEED_KEY, false)) return
  const games = read(GAMES_KEY, [])
  const hasDemoGames = games.some((g) => g.userId === 'usr_demo')
  if (!hasDemoGames) {
    seedGame({
      userId: 'usr_demo',
      scenarioId: 'voronovy',
      modelId: 'claude-sonnet',
      mode: 'coop',
      character: { name: 'Алексей Странник', classId: 'rogue' },
      party: [
        { name: 'Алексей Странник', classId: 'rogue', isHost: true, color: 'from-rose-500/40 to-orange-400/30' },
        { name: 'Мира', classId: 'mage', color: 'from-arcane-500/40 to-sky-400/30' },
        { name: 'Гриша', classId: 'warrior', color: 'from-emerald-500/40 to-teal-400/30' },
      ],
      turns: 4,
      createdAt: Date.now() - 1000 * 60 * 60 * 26,
      finished: false,
      cost: 32,
      plan: 'adventurer',
    })
    seedGame({
      userId: 'usr_demo',
      scenarioId: 'runy',
      modelId: 'gpt-4o',
      mode: 'solo',
      character: { name: 'Алексей Странник', classId: 'rogue' },
      party: [],
      turns: 7,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      finished: true,
      cost: 49,
      plan: 'free',
    })
  }
  write(SEED_KEY, true)
}
