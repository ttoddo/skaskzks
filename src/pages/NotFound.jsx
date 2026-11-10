import { Compass, Home, Map, Sparkles } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative">
        <span className="font-display text-[9rem] font-semibold leading-none text-white/[0.06] sm:text-[12rem]">404</span>
        <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-gold-300/80">
          <Compass className="h-16 w-16 animate-float" />
        </span>
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold text-stone-100 sm:text-4xl">Эта тропа никуда не ведёт</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-400">
        Похоже, мастер ещё не описал этот уголок мира. Вернитесь на главную или выберите готовую историю.
      </p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button to="/" size="lg" icon={Home}>На главную</Button>
        <Button to="/scenarios" size="lg" variant="secondary" icon={Map}>К сценариям</Button>
        <Button to="/create" size="lg" variant="ghost" icon={Sparkles}>Создать свой мир</Button>
      </div>
    </div>
  )
}
