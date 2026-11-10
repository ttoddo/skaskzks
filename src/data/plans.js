export const PLANS = [
  {
    id: 'free',
    name: 'Странник',
    price: 0,
    period: 'навсегда',
    tagline: 'Попробовать, как звучит история',
    discount: 0,
    badge: null,
    perks: [
      '300 ₽ приветственного бонуса',
      'Все готовые сценарии',
      'Модель Llama 3.3 70B',
      'Одна активная кампания',
      'История игр за 7 дней',
    ],
    cta: 'Начать бесплатно',
    highlight: false,
  },
  {
    id: 'adventurer',
    name: 'Искатель',
    price: 490,
    period: 'в месяц',
    tagline: 'Для регулярных кампаний с друзьями',
    discount: 10,
    badge: 'Популярный',
    perks: [
      'Скидка 10% на каждый ход',
      'Все модели, включая флагманы',
      'Три активные кампании',
      'Кооператив до 4 игроков',
      'Полная история без ограничений',
      'Приоритетная очередь генерации',
    ],
    cta: 'Выбрать «Искателя»',
    highlight: true,
  },
  {
    id: 'legend',
    name: 'Легенда',
    price: 1290,
    period: 'в месяц',
    tagline: 'Для тех, кто живёт в историях',
    discount: 20,
    badge: null,
    perks: [
      'Скидка 20% на каждый ход',
      'Неограниченное число кампаний',
      'Ранний доступ к новым сценариям',
      'Эксклюзивные миры каждый месяц',
      'Расширенная память ИИ-мастера',
      'Поддержка в течение часа',
    ],
    cta: 'Стать легендой',
    highlight: false,
  },
]

export const TOPUP_PACKAGES = [
  { amount: 300, bonus: 0, label: 'Попробовать' },
  { amount: 700, bonus: 5, label: 'Хватит на пару вечеров' },
  { amount: 1500, bonus: 10, label: 'Оптимально', popular: true },
  { amount: 3000, bonus: 15, label: 'Для большой кампании' },
]

export const getPlan = (id) => PLANS.find((p) => p.id === id) || PLANS[0]

export const PLAN_LABELS = {
  free: 'Странник',
  adventurer: 'Искатель',
  legend: 'Легенда',
}
