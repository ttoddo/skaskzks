import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
          <span className="text-xs uppercase tracking-[0.2em]">Открываем книгу…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
