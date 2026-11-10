import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  User,
  Wallet,
  X,
  ScrollText,
  Settings,
} from 'lucide-react'
import Logo from './Logo'
import Button from './Button'
import { Avatar } from './ui'
import { useAuth } from '../context/AuthContext'
import { formatMoney } from '../data/models'

const LINKS = [
  { to: '/scenarios', label: 'Сценарии' },
  { to: '/models', label: 'Модели и цены' },
  { to: '/models#plans', label: 'Тарифы' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                    isActive && !link.to.includes('#')
                      ? 'bg-white/[0.06] text-gold-200'
                      : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                to="/payment"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:border-gold-400/40 hover:text-gold-200 sm:flex"
                title="Пополнить баланс"
              >
                <Wallet className="h-3.5 w-3.5 text-gold-400" />
                {formatMoney(user.balance)}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400/15 text-gold-300">
                  <Plus className="h-3 w-3" />
                </span>
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2.5 transition hover:border-white/25"
                >
                  <Avatar name={user.name} color={user.avatarColor} size="sm" />
                  <span className="hidden max-w-[110px] truncate text-xs font-semibold text-stone-200 sm:block">{user.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-stone-500 transition ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-card animate-fade-up">
                    <div className="border-b border-white/[0.07] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-stone-100">{user.name}</p>
                      <p className="truncate text-xs text-stone-500">{user.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Баланс</span>
                        <span className="font-semibold text-gold-300">{formatMoney(user.balance)}</span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <MenuItem to="/profile" icon={User} label="Профиль" />
                      <MenuItem to="/profile#history" icon={ScrollText} label="Мои приключения" />
                      <MenuItem to="/payment" icon={Wallet} label="Пополнить баланс" />
                      <MenuItem to="/profile#settings" icon={Settings} label="Настройки" />
                    </div>
                    <div className="border-t border-white/[0.07] p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-300/90 transition hover:bg-rose-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-xs font-semibold text-stone-300 transition hover:text-gold-200 sm:block">
                Войти
              </Link>
              <Button to="/register" size="sm" className="hidden sm:inline-flex">
                Начать бесплатно
              </Button>
            </>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-300 transition hover:border-white/25 lg:hidden"
            aria-label="Меню"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.07] bg-ink-950/95 px-5 py-4 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-lg px-3 py-2.5 text-sm text-stone-300 transition hover:bg-white/[0.05] hover:text-gold-200">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-white/[0.07] pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} color={user.avatarColor} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-stone-200">{user.name}</p>
                      <p className="text-[10px] text-gold-300">{formatMoney(user.balance)}</p>
                    </div>
                  </div>
                  <Link to="/payment" className="rounded-full bg-gold-400/15 px-3 py-1.5 text-[11px] font-semibold text-gold-200">
                    Пополнить
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button to="/profile" variant="secondary" size="sm">Профиль</Button>
                  <Button onClick={handleLogout} variant="danger" size="sm">Выйти</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button to="/login" variant="secondary" size="sm">Войти</Button>
                <Button to="/register" size="sm">Регистрация</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function MenuItem({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-stone-300 transition hover:bg-white/[0.06] hover:text-gold-200"
    >
      <Icon className="h-3.5 w-3.5 text-stone-500" />
      {label}
    </Link>
  )
}
