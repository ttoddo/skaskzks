export const MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    vendor: 'OpenAI',
    tagline: 'Универсальный рассказчик с отличным чувством ритма',
    description:
      'Лучший баланс качества и скорости. Уверенно держит сюжет, помнит детали на десятки ходов вперёд и мастерски описывает диалоги персонажей.',
    quality: 5,
    speed: 4,
    context: '128K',
    pricePerTurn: 7,
    pricePer1k: 4.4,
    badge: 'Выбор редакции',
    accent: 'emerald',
    tags: ['flagship'],
    mark: 'G',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.7 Sonnet',
    vendor: 'Anthropic',
    tagline: 'Самый литературный стиль и глубокие персонажи',
    description:
      'Пишет плотную атмосферную прозу, бережно относится к вашим решениям и почти не теряет нить истории даже в очень длинных сессиях.',
    quality: 5,
    speed: 3,
    context: '200K',
    pricePerTurn: 8,
    pricePer1k: 5.1,
    badge: 'Лучший сюжет',
    accent: 'orange',
    tags: ['flagship'],
    mark: 'C',
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    vendor: 'Google',
    tagline: 'Мгновенные ответы и огромная память',
    description:
      'Отвечает почти без задержки и удерживает в контексте всю вашу кампанию целиком. Хороший выбор, если хочется играть без пауз.',
    quality: 4,
    speed: 5,
    context: '1M',
    pricePerTurn: 3,
    pricePer1k: 1.9,
    badge: 'Самый быстрый',
    accent: 'blue',
    tags: ['fast'],
    mark: 'G',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    vendor: 'DeepSeek',
    tagline: 'Максимум истории за разумные деньги',
    description:
      'Открытая модель с неожиданно сильным сюжетным мышлением. Отличный вариант для долгих кампаний, где важна цена каждого хода.',
    quality: 4,
    speed: 4,
    context: '128K',
    pricePerTurn: 2,
    pricePer1k: 1.2,
    badge: 'Выгодный',
    accent: 'indigo',
    tags: ['fast', 'open'],
    mark: 'D',
  },
  {
    id: 'gigachat-max',
    name: 'GigaChat Max',
    vendor: 'Сбер',
    tagline: 'Российская модель с живым русским языком',
    description:
      'Создана специально для русского языка: естественные формулировки, точные склонения и хорошее чувство культурного контекста.',
    quality: 4,
    speed: 4,
    context: '32K',
    pricePerTurn: 4,
    pricePer1k: 2.6,
    badge: 'Российская',
    accent: 'teal',
    tags: ['ru'],
    mark: 'S',
  },
  {
    id: 'yandexgpt-pro',
    name: 'YandexGPT 5 Pro',
    vendor: 'Яндекс',
    tagline: 'Быстрый и точный мастер на русском',
    description:
      'Аккуратно следует правилам мира и сеттинга, хорошо справляется с загадками и логическими развилками. Работает без задержек.',
    quality: 4,
    speed: 4,
    context: '32K',
    pricePerTurn: 4,
    pricePer1k: 2.4,
    badge: 'Российская',
    accent: 'amber',
    tags: ['ru', 'fast'],
    mark: 'Y',
  },
  {
    id: 'llama-70b',
    name: 'Llama 3.3 70B',
    vendor: 'Meta · Open Source',
    tagline: 'Открытая модель для экспериментов',
    description:
      'Бесплатная основа, которую можно дообучить под свой мир. В демо-режиме отвечает проще, но стоит копейки.',
    quality: 3,
    speed: 4,
    context: '128K',
    pricePerTurn: 1,
    pricePer1k: 0.6,
    badge: 'Open Source',
    accent: 'sky',
    tags: ['open', 'fast'],
    mark: 'L',
  },
]

export const MODEL_FILTERS = [
  { id: 'all', label: 'Все модели' },
  { id: 'flagship', label: 'Флагманы' },
  { id: 'fast', label: 'Быстрые' },
  { id: 'ru', label: 'Российские' },
  { id: 'open', label: 'Open Source' },
]

export const AVG_TURNS_PER_SESSION = 30

export const getModel = (id) => MODELS.find((m) => m.id === id) || MODELS[0]

export const sessionEstimate = (model, turns = AVG_TURNS_PER_SESSION) =>
  Math.round(model.pricePerTurn * turns)

export const PLAN_DISCOUNTS = {
  free: 0,
  adventurer: 10,
  legend: 20,
}

export const turnCost = (model, plan = 'free') => {
  const discount = PLAN_DISCOUNTS[plan] || 0
  return Math.max(1, Math.round(model.pricePerTurn * (1 - discount / 100)))
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(value)) + ' ₽'

export const ACCENTS = {
  emerald: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    ring: 'ring-emerald-400/40',
    gradient: 'from-emerald-400/20 to-teal-500/5',
    dot: 'bg-emerald-400',
  },
  orange: {
    text: 'text-orange-300',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    ring: 'ring-orange-400/40',
    gradient: 'from-orange-400/20 to-amber-500/5',
    dot: 'bg-orange-400',
  },
  blue: {
    text: 'text-sky-300',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    ring: 'ring-sky-400/40',
    gradient: 'from-sky-400/20 to-blue-500/5',
    dot: 'bg-sky-400',
  },
  indigo: {
    text: 'text-indigo-300',
    bg: 'bg-indigo-400/10',
    border: 'border-indigo-400/30',
    ring: 'ring-indigo-400/40',
    gradient: 'from-indigo-400/20 to-violet-500/5',
    dot: 'bg-indigo-400',
  },
  teal: {
    text: 'text-teal-300',
    bg: 'bg-teal-400/10',
    border: 'border-teal-400/30',
    ring: 'ring-teal-400/40',
    gradient: 'from-teal-400/20 to-emerald-500/5',
    dot: 'bg-teal-400',
  },
  amber: {
    text: 'text-amber-300',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    ring: 'ring-amber-400/40',
    gradient: 'from-amber-400/20 to-yellow-500/5',
    dot: 'bg-amber-400',
  },
  sky: {
    text: 'text-sky-300',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    ring: 'ring-sky-400/40',
    gradient: 'from-sky-400/20 to-cyan-500/5',
    dot: 'bg-sky-400',
  },
}
