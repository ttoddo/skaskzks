const PREFIX = 'skazanie'

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(`${PREFIX}.${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(value))
  } catch {
    /* хранилище может быть недоступно — демо продолжит работать в памяти */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(`${PREFIX}.${key}`)
  } catch {
    /* noop */
  }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export function pick(list, seed = Math.random()) {
  if (!list?.length) return undefined
  return list[Math.floor(seed * list.length) % list.length]
}

export function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function formatDate(ts) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

export function plural(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
