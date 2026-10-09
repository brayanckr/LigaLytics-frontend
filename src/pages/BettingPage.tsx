import { useCallback, useMemo, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useAuth } from '../auth/AuthContext'
import { useApi } from '../hooks/useApi'
import Spinner from '../components/Spinner'
import BetSlip from '../betting/BetSlip'
import { BettingContext } from '../betting/BettingContext'
import type { BettingState, SlipItem } from '../betting/BettingContext'
import { cop } from '../betting/shared'

const DEFAULT_STAKE = 5000

const TABS: [string, string, boolean][] = [
  ['/betting', 'Partidos', true],
  ['/betting/recomendaciones', 'Recomendaciones', false],
  ['/betting/mis-apuestas', 'Mis apuestas', false],
]

/** Casa de apuestas de demostración: partidos con cuotas, detalle de mercados, cupón (simple o combinada) e historial. */
export default function BettingPage() {
  const { account, loading: authLoading, logout, refresh } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [items, setItems] = useState<SlipItem[]>([])
  const [stake, setStake] = useState(DEFAULT_STAKE)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const wallet = useApi(() => ligalyticsApi.getWallet(), [account?.id])
  const reloadWallet = wallet.reload

  const toggle = useCallback((item: SlipItem) => {
    setMessage(null)
    setItems((current) => {
      if (current.some((i) => i.key === item.key)) {
        return current.filter((i) => i.key !== item.key)
      }
      // Una selección por partido: la nueva sustituye a la anterior del mismo partido.
      return [...current.filter((i) => i.eventId !== item.eventId), item]
    })
  }, [])

  const selectOnly = useCallback((item: SlipItem, suggested?: number) => {
    setMessage(null)
    setItems([item])
    if (suggested) {
      setStake(suggested)
    }
  }, [])

  const onPlaced = useCallback(
    (text: string) => {
      setItems([])
      setMessage({ ok: true, text })
      reloadWallet()
      void refresh()
      navigate('/betting/mis-apuestas')
    },
    [navigate, refresh, reloadWallet],
  )

  const state = useMemo<BettingState>(
    () => ({
      items,
      stake,
      setStake,
      toggle,
      selectOnly,
      remove: (key) => setItems((current) => current.filter((i) => i.key !== key)),
      clear: () => setItems([]),
      balance: wallet.data?.balance ?? account?.balance ?? 0,
      onPlaced,
    }),
    [items, stake, toggle, selectOnly, wallet.data?.balance, account?.balance, onPlaced],
  )

  if (authLoading) {
    return <Spinner label="Comprobando la sesión…" />
  }
  if (!account) {
    return <Navigate to="/login" replace />
  }

  const reset = async () => {
    if (!window.confirm('¿Reiniciar el saldo a 100.000 COP ficticios y borrar tus apuestas?')) {
      return
    }
    try {
      await ligalyticsApi.resetWallet()
      setItems([])
      setMessage({ ok: true, text: 'Saldo reiniciado.' })
      reloadWallet()
      void refresh()
    } catch (cause) {
      setMessage({ ok: false, text: extractApiError(cause) })
    }
  }

  const w = wallet.data
  const balance = w?.balance ?? account.balance
  const profit = w?.profit ?? 0

  return (
    <BettingContext.Provider value={state}>
      <section className="space-y-5">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200">
          <strong>Simulación educativa con dinero ficticio.</strong> No se apuesta dinero real ni hay pagos. Las
          recomendaciones salen de un modelo cuya ventaja sobre las casas de apuestas <strong>no está demostrada</strong>.
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Apuestas (demo)</h1>
            <p className="text-sm text-slate-400">
              Hola, {account.displayName}. Cuotas reales de casas de apuestas y probabilidades de nuestro modelo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700"
            >
              Reiniciar saldo
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Saldo ficticio" value={cop(balance)} tone="text-amber-300" />
          <Stat label="En juego" value={cop(w?.inPlay ?? 0)} tone="text-sky-300" />
          <Stat
            label="Ganancia / pérdida"
            value={`${profit >= 0 ? '+' : ''}${cop(profit)}`}
            tone={profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}
          />
          <Stat label="Saldo inicial" value={cop(w?.initialBalance ?? 100000)} tone="text-slate-300" />
        </div>

        {message && (
          <p
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {message.text}
          </p>
        )}

        <nav className="flex gap-2 border-b border-slate-800">
          {TABS.map(([to, label, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  isActive || (to === '/betting' && pathname.startsWith('/betting/partido'))
                    ? 'border-sky-400 text-sky-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <Outlet />
          </div>
          <BetSlip />
        </div>
      </section>
    </BettingContext.Provider>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-800/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
