import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { cop } from '../betting/shared'
import Avatar from '../components/Avatar'
import { LogOutIcon, MyBetsIcon, SparkIcon } from '../components/icons'

/** Perfil de la cuenta de la demostración: datos básicos, saldo ficticio y cierre de sesión. */
export default function ProfilePage() {
  const { account, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) return null
  if (!account) return <Navigate to="/login" replace />

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5 motion-safe:animate-rise">
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-b from-slate-800 to-slate-900 p-5 shadow-card sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-sky-300 to-lime-400" />
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar name={account.displayName} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-extrabold text-white sm:text-3xl">{account.displayName}</h1>
            <p className="truncate text-sm text-slate-400">{account.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo ficticio</dt>
            <dd className="mt-1 text-2xl font-extrabold tabular-nums text-lime-400">{cop(account.balance)}</dd>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo de cuenta</dt>
            <dd className="mt-1 text-lg font-bold text-white">Demostración educativa</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/betting/mis-apuestas"
          className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-glow"
        >
          <MyBetsIcon className="text-sky-400" /> Mis apuestas
        </Link>
        <Link
          to="/predict"
          className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-glow"
        >
          <SparkIcon className="text-sky-400" /> Predicciones
        </Link>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 font-bold text-rose-200 transition-all duration-200 hover:bg-rose-500/20 active:scale-[.99]"
      >
        <LogOutIcon /> Cerrar sesión
      </button>
    </section>
  )
}
