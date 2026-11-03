import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from './AuthContext'

/**
 * Ruta de layout que exige sesion. Sin cuenta redirige a /login (sin recargar la pagina) recordando
 * a donde queria ir, para volver alli tras entrar. Mientras se valida el token guardado muestra un esqueleto.
 */
export default function ProtectedRoute() {
  const { account, loading, sessionExpired } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="Verificando sesión" className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (!account) {
    const from = location.pathname + location.search
    return <Navigate to="/login" replace state={{ from, expired: sessionExpired }} />
  }
  return <Outlet />
}
