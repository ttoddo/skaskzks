import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DEMO_CREDENTIALS } from '../lib/mockApi'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const wasLoggedIn = useRef(Boolean(user))

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (wasLoggedIn.current && user) {
    return <Navigate to="/profile" replace />
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Введите почту'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Похоже, в почте опечатка'
    if (!form.password) next.password = 'Введите пароль'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const doLogin = async (credentials) => {
    setServerError('')
    setLoading(true)
    try {
      const logged = await login(credentials)
      toast(`С возвращением, ${logged.name.split(' ')[0]}!`)
      const from = location.state?.from
      navigate(from && from !== '/login' ? from : '/profile', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Не удалось войти')
    } finally {
      setLoading(false)
      setDemoLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    doLogin(form)
  }

  const handleDemo = () => {
    setDemoLoading(true)
    setForm({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password })
    doLogin(DEMO_CREDENTIALS)
  }

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить кампанию с того места, где остановились."
      sideTitle="Мастер уже открыл книгу и ждёт вашего хода"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-gold-300 transition hover:text-gold-200">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-4 py-3 text-[13px] text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {serverError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">Почта</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value })
                setErrors({ ...errors, email: undefined })
              }}
              placeholder="you@example.com"
              className={`input pl-11 ${errors.email ? 'border-rose-400/50' : ''}`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-[11px] text-rose-300">{errors.email}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0" htmlFor="password">Пароль</label>
            <button type="button" className="text-[11px] text-stone-500 transition hover:text-gold-300" onClick={() => toast('В демо-версии восстановление пароля недоступно. Используйте демо-аккаунт.', 'info')}>
              Забыли пароль?
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value })
                setErrors({ ...errors, password: undefined })
              }}
              placeholder="••••••••"
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
          {errors.password && <p className="mt-1.5 text-[11px] text-rose-300">{errors.password}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-stone-400">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-ink-900 accent-gold-400" />
          Запомнить меня на этом устройстве
        </label>

        <Button type="submit" full size="lg" loading={loading} iconRight={ArrowRight}>
          Войти в аккаунт
        </Button>

        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-ink-950 px-3 text-[10px] uppercase tracking-[0.2em] text-stone-600">или</span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
        </div>

        <Button type="button" variant="secondary" full size="lg" icon={Sparkles} loading={demoLoading} onClick={handleDemo}>
          Войти в демо-аккаунт
        </Button>

        <p className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-stone-500">
          Демо-доступ: <span className="text-stone-300">{DEMO_CREDENTIALS.email}</span> · пароль{' '}
          <span className="text-stone-300">{DEMO_CREDENTIALS.password}</span>
        </p>
      </form>
    </AuthLayout>
  )
}
