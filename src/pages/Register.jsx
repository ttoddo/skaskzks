import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Gift, Lock, Mail, User } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const strengthInfo = (password) => {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-ZА-Я]/.test(password) && /[a-zа-я]/.test(password)) score += 1
  if (/\d/.test(password) || /[^\w\s]/.test(password)) score += 1
  return Math.min(score, 4)
}

const STRENGTH = [
  { label: 'Слишком простой', color: 'bg-rose-500' },
  { label: 'Простой', color: 'bg-orange-500' },
  { label: 'Нормальный', color: 'bg-amber-400' },
  { label: 'Хороший', color: 'bg-emerald-400' },
  { label: 'Надёжный', color: 'bg-emerald-400' },
]

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const wasLoggedIn = useRef(Boolean(user))

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (wasLoggedIn.current && user) {
    return <Navigate to="/profile" replace />
  }

  const strength = strengthInfo(form.password)

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Имя должно быть не короче 2 символов'
    if (!form.email.trim()) next.email = 'Введите почту'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Похоже, в почте опечатка'
    if (form.password.length < 8) next.password = 'Минимум 8 символов'
    if (form.confirm !== form.password) next.confirm = 'Пароли не совпадают'
    if (!form.agree) next.agree = 'Нужно согласие с условиями'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      toast('Аккаунт создан. 300 ₽ уже на балансе!')
      const from = location.state?.from
      navigate(from && from !== '/register' ? from : '/create', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Не удалось создать аккаунт')
    } finally {
      setLoading(false)
    }
  }

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  return (
    <AuthLayout
      title="Создайте аккаунт"
      subtitle="Один аккаунт — все миры, модели и сохранённые кампании. Первые 300 ₽ за нами."
      sideTitle="Каждая великая история начинается с имени"
      sideText="Зарегистрируйтесь за минуту — и мастер предложит вам первую сцену. Без карты, без обязательств, без долгих правил."
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-semibold text-gold-300 transition hover:text-gold-200">
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex items-start gap-3 rounded-xl border border-gold-400/20 bg-gold-400/[0.05] px-4 py-3">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
          <p className="text-[12px] leading-relaxed text-gold-100/80">
            Приветственный бонус <span className="font-semibold text-gold-200">300 ₽</span> — хватит на первую сессию
            с любой моделью.
          </p>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-4 py-3 text-[13px] text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {serverError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="name">Как вас называть</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Алексей Странник"
              autoComplete="name"
              className={`input pl-11 ${errors.name ? 'border-rose-400/50' : ''}`}
            />
          </div>
          {errors.name && <p className="mt-1.5 text-[11px] text-rose-300">{errors.name}</p>}
        </div>

        <div>
          <label className="label" htmlFor="email">Почта</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={`input pl-11 ${errors.email ? 'border-rose-400/50' : ''}`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-[11px] text-rose-300">{errors.email}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">Пароль</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              className={`input pl-11 pr-11 ${errors.password ? 'border-rose-400/50' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-200"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition ${i < strength ? STRENGTH[strength].color : 'bg-white/10'}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-stone-500">{STRENGTH[strength].label}</p>
            </div>
          )}
          {errors.password && <p className="mt-1.5 text-[11px] text-rose-300">{errors.password}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirm">Повторите пароль</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
              placeholder="Ещё раз"
              autoComplete="new-password"
              className={`input pl-11 pr-11 ${errors.confirm ? 'border-rose-400/50' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-200"
              aria-label={showConfirm ? 'Скрыть повтор пароля' : 'Показать повтор пароля'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm && <p className="mt-1.5 text-[11px] text-rose-300">{errors.confirm}</p>}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-stone-400">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update('agree', e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-ink-900 accent-gold-400"
            />
            <span>
              Согласен с условиями использования и политикой конфиденциальности. Понимаю, что это демо-версия.
            </span>
          </label>
          {errors.agree && <p className="mt-1.5 text-[11px] text-rose-300">{errors.agree}</p>}
        </div>

        <Button type="submit" full size="lg" loading={loading} iconRight={ArrowRight}>
          Создать аккаунт
        </Button>

        <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-stone-600">
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-400/80" /> Без карты</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-400/80" /> 300 ₽ бонус</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-400/80" /> Отмена в любой момент</span>
        </div>
      </form>
    </AuthLayout>
  )
}
