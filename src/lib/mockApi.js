import { read, write, uid, delay } from './storage'

const USERS_KEY = 'users'
const SESSION_KEY = 'session'

export const DEMO_CREDENTIALS = {
  email: 'demo@skazanie.ru',
  password: 'demo1234',
}

const demoUser = () => ({
  id: 'usr_demo',
  name: 'Алексей Странник',
  email: DEMO_CREDENTIALS.email,
  password: DEMO_CREDENTIALS.password,
  bio: 'Играю по вечерам, собираю истории про дома с привидениями и северные фьорды. Веду кампанию «Проклятие дома Вороновых» уже третий вечер.',
  balance: 740,
  plan: 'adventurer',
  planUntil: Date.now() + 1000 * 60 * 60 * 24 * 24,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 34,
  avatarColor: 'from-rose-500/40 to-orange-400/30',
  settings: { sound: true, notifications: true, dice: true, reduceMotion: false },
  transactions: [
    { id: 'txn_seed_1', type: 'topup', title: 'Пополнение баланса', amount: 700, method: '•••• 4242', ts: Date.now() - 1000 * 60 * 60 * 24 * 3 },
    { id: 'txn_seed_2', type: 'plan', title: 'Подписка «Искатель»', amount: -490, method: '•••• 4242', ts: Date.now() - 1000 * 60 * 60 * 24 * 3 },
    { id: 'txn_seed_3', type: 'topup', title: 'Пополнение баланса', amount: 500, method: '•••• 4242', ts: Date.now() - 1000 * 60 * 60 * 24 * 12 },
  ],
})

function ensureSeed() {
  const users = read(USERS_KEY, null)
  if (!users) {
    write(USERS_KEY, [demoUser()])
    return [demoUser()]
  }
  return users
}

const publicUser = (user) => {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

export async function apiRegister({ name, email, password }) {
  await delay(750)
  const users = ensureSeed()
  const normalized = email.trim().toLowerCase()
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new Error('Пользователь с такой почтой уже зарегистрирован')
  }
  const user = {
    id: uid('usr'),
    name: name.trim(),
    email: normalized,
    password,
    bio: '',
    balance: 300,
    plan: 'free',
    planUntil: null,
    createdAt: Date.now(),
    avatarColor: 'from-arcane-500/40 to-sky-400/30',
    settings: { sound: true, notifications: true, dice: true, reduceMotion: false },
    transactions: [
      { id: uid('txn'), type: 'bonus', title: 'Приветственный бонус', amount: 300, method: 'Сказание', ts: Date.now() },
    ],
  }
  write(USERS_KEY, [...users, user])
  write(SESSION_KEY, user.id)
  return publicUser(user)
}

export async function apiLogin({ email, password }) {
  await delay(650)
  const users = ensureSeed()
  const normalized = email.trim().toLowerCase()
  const user = users.find((u) => u.email.toLowerCase() === normalized)
  if (!user || user.password !== password) {
    throw new Error('Неверная почта или пароль')
  }
  write(SESSION_KEY, user.id)
  return publicUser(user)
}

export function apiSession() {
  const users = ensureSeed()
  const id = read(SESSION_KEY, null)
  const user = users.find((u) => u.id === id)
  return publicUser(user)
}

export function apiLogout() {
  write(SESSION_KEY, null)
}

export function apiUpdateUser(userId, patch) {
  const users = ensureSeed()
  const next = users.map((u) => (u.id === userId ? { ...u, ...patch } : u))
  write(USERS_KEY, next)
  return publicUser(next.find((u) => u.id === userId))
}

export function apiVerifyPassword(userId, password) {
  const user = ensureSeed().find((u) => u.id === userId)
  return Boolean(user && user.password === password)
}

export function apiAddTransaction(userId, transaction) {
  const users = ensureSeed()
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  const transactions = [transaction, ...(user.transactions || [])].slice(0, 40)
  return apiUpdateUser(userId, { transactions })
}

export function apiDeleteUser(userId) {
  const users = ensureSeed().filter((u) => u.id !== userId)
  write(USERS_KEY, users)
  write(SESSION_KEY, null)
}

export { publicUser }
