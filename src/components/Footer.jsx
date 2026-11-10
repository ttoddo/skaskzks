import { Link } from 'react-router-dom'
import { Github, Mail, Send } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-ink-950/60">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-500">
              Веб-сервис генерации интерактивных текстовых квестов на основе искусственного интеллекта.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-gold-400/40 hover:text-gold-300"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-gold-400/40 hover:text-gold-300"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@skazanie.ru"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-400 transition hover:border-gold-400/40 hover:text-gold-300"
                aria-label="Почта"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Продукт"
            links={[
              { to: '/scenarios', label: 'Сценарии' },
              { to: '/models', label: 'Модели и цены' },
              { to: '/create', label: 'Создать приключение' },
              { to: '/models#plans', label: 'Тарифы' },
            ]}
          />
          <FooterColumn
            title="Аккаунт"
            links={[
              { to: '/login', label: 'Вход' },
              { to: '/register', label: 'Регистрация' },
              { to: '/profile', label: 'Профиль' },
              { to: '/payment', label: 'Оплата' },
            ]}
          />
          <FooterColumn
            title="О проекте"
            links={[
              { to: '/#how', label: 'Как это работает' },
              { to: '/#about', label: 'О дипломном проекте' },
              { to: '/#models', label: 'Технологии' },
              { to: '/#faq', label: 'Вопросы и ответы' },
            ]}
          />
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col gap-3 text-[11px] text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 «Сказание». Дипломный проект. Все совпадения с реальными мирами случайны.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Демо-версия: платежи и ИИ имитируются</span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span>React · Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-stone-400 transition hover:text-gold-200">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
