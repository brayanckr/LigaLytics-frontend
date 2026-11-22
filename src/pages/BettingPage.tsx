import { useCallback, useMemo, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useAuth } from '../auth/AuthContext'
import { useApi } from '../hooks/useApi'
import Spinner from '../components/Spinner'
import { useConfirmLogout } from '../components/ConfirmLogout'
import BetSlip from '../betting/BetSlip'
import { BettingContext } from '../betting/BettingContext'
import type { BettingState, SlipItem } from '../betting/BettingContext'
import { cop, describeOffer, offersConflict } from '../betting/shared'

const DEFAULT_STAKE = 5000

const TABS: [string, string, boolean][] = [
  ['/betting', 'Partidos', true],
  ['/betting/recomendaciones', 'Recomendaciones', false],
  ['/betting/mis-apuestas', 'Mis apuestas', false],
]

/** Casa de apuestas de demostración: partidos con cuotas, detalle de mercados, cupón (simple o combinada) e historial. */
export default function BettingPage() {
  const { account, loading: authLoading, refresh } = useAuth()
  const { requestLogout, dialog: logoutDialog } = useConfirmLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [items, setItems] = useState<SlipItem[]>([])
  const [stake, setStake] = useState(DEFAULT_STAKE)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const wallet = useApi(() => ligalyticsApi.getWallet(), [account?.id])
  const reloadWallet = wallet.reload

  const toggle = useCallback((item: SlipItem) => {
    setMessage(null)
    setNotice(null)
    setItems((current) => {
      if (current.some((i) => i.key === item.key)) {
        return current.filter((i) => i.key !== item.key)
      }
      // Un mismo partido admite varias selecciones salvo las incompatibles (misma regla que el servidor): las del
      // mismo mercado (Sí/No, más/menos, 1X2) y las que se contradicen o se implican (ambos marcan «sí» con menos o
      // más de 1,5 goles). Las demás se combinan y su cuota la ajusta el servidor por correlación.
      const clashing = current.filter((i) => i.eventId === item.eventId && offersConflict(i.offer, item.offer))
      if (clashing.length > 0) {
        setNotice(
          `«${describeOffer(item.offer, item.homeTeam, item.awayTeam)}» sustituye a ` +
            `«${clashing.map((c) => describeOffer(c.offer, c.homeTeam, c.awayTeam)).join('», «')}» ` +
            `porque son incompatibles en el mismo partido (${item.homeTeam} vs ${item.awayTeam}).`,
        )
      }
      return [...current.filter((i) => !clashing.includes(i)), item]
    })
  }, [])

  const selectOnly = useCallback((item: SlipItem, suggested?: number) => {
    setMessage(null)
    setNotice(null)
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
      remove: (key) => {
        setNotice(null)
        setItems((current) => current.filter((i) => i.key !== key))
      },
      clear: () => {
        setNotice(null)
        setItems([])
      },
      notice,
      balance: wallet.data?.balance ?? account?.balance ?? 0,
      onPlaced,
    }),
    [items, stake, toggle, selectOnly, notice, wallet.data?.balance, account?.balance, onPlaced],
  )

  if (authLoading) {
    return <Spinner label="Comprobando la sesión…" />
  }
  if (!account) {
    return <Navigate to="/login" replace />
  }

  const reset = async () => {
    if (!window.confirm('¿Reiniciar el saldo a 100.000 COP y borrar tus apuestas?')) {
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
      <section className="space-y-5 pb-16 lg:pb-0">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl text-white sm:text-4xl">Apuestas</h1>
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
              onClick={requestLogout}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        {logoutDialog}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Saldo" value={cop(balance)} tone="text-amber-300" />
          <Stat label="En juego" value={cop(w?.inPlay ?? 0)} tone="text-sky-300" />
          <Stat
            label="Ganancia / pérdida"
            value={`${profit >= 0 ? '+' : ''}${cop(profit)}`}
            tone={profit >= 0 ? 'text-lime-400' : 'text-rose-300'}
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

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-700/60">
          {TABS.map(([to, label, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `-mb-px min-h-[44px] whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-bold transition ${
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
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
    <div className="card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
