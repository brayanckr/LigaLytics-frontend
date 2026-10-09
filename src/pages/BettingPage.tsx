import { useCallback, useState } from 'react'
import { Navigate } from 'react-router-dom'
import type { BetDto, BettingMatchDto, OfferDto, RecommendationDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useAuth } from '../auth/AuthContext'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import { formatDate } from '../lib/format'

const MARKET_ORDER = ['WINNER', 'GOALS', 'BTTS', 'CORNERS', 'CARDS']
const MIN_STAKE = 1000

/** Dinero ficticio en pesos colombianos. */
function cop(value: number): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)} COP`
}

function describeOffer(offer: OfferDto, home: string, away: string): string {
  const line = offer.line === null ? '' : ` ${offer.line}`
  switch (offer.market) {
    case 'WINNER':
      return offer.selection === 'HOME' ? `Gana ${home}` : offer.selection === 'AWAY' ? `Gana ${away}` : 'Empate'
    case 'BTTS':
      return `Ambos marcan: ${offer.selection === 'YES' ? 'Sí' : 'No'}`
    case 'GOALS':
      return `${offer.selection === 'OVER' ? 'Más' : 'Menos'} de${line} goles`
    case 'CORNERS':
      return `${offer.selection === 'OVER' ? 'Más' : 'Menos'} de${line} córneres`
    default:
      return `${offer.selection === 'OVER' ? 'Más' : 'Menos'} de${line} tarjetas`
  }
}

interface Slip {
  eventId: number
  offer: OfferDto
  title: string
  match: string
  stake: number
}

const STATUS_LABEL: Record<BetDto['status'], { text: string; tone: string }> = {
  PENDING: { text: 'Pendiente', tone: 'bg-sky-500/15 text-sky-300' },
  WON: { text: 'Ganada', tone: 'bg-emerald-500/15 text-emerald-300' },
  LOST: { text: 'Perdida', tone: 'bg-rose-500/15 text-rose-300' },
  VOID: { text: 'Anulada', tone: 'bg-slate-600/40 text-slate-300' },
}

type Tab = 'recommendations' | 'matches' | 'bets'

export default function BettingPage() {
  const { account, loading: authLoading, logout, refresh } = useAuth()
  const [tab, setTab] = useState<Tab>('recommendations')
  const [slip, setSlip] = useState<Slip | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [placing, setPlacing] = useState(false)

  const wallet = useApi(() => ligalyticsApi.getWallet(), [account?.id])
  const recommendations = useApi(() => ligalyticsApi.getRecommendations(), [account?.id])
  const matches = useApi(() => ligalyticsApi.getBettingMatches(7), [account?.id])
  const bets = useApi(() => ligalyticsApi.getBets(), [account?.id])

  const reloadAll = useCallback(() => {
    wallet.reload()
    recommendations.reload()
    bets.reload()
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.reload, recommendations.reload, bets.reload, refresh])

  if (authLoading) {
    return <Spinner label="Comprobando la sesión…" />
  }
  if (!account) {
    return <Navigate to="/login" replace />
  }

  const choose = (eventId: number, match: string, home: string, away: string, offer: OfferDto, stake = 5000) => {
    setSlip({ eventId, offer, match, title: describeOffer(offer, home, away), stake })
    setMessage(null)
  }

  const place = async () => {
    if (!slip) {
      return
    }
    setPlacing(true)
    setMessage(null)
    try {
      await ligalyticsApi.placeBet({
        eventId: slip.eventId,
        market: slip.offer.market,
        selection: slip.offer.selection,
        line: slip.offer.line,
        stake: slip.stake,
      })
      setMessage({ ok: true, text: `Apuesta registrada: ${slip.title} por ${cop(slip.stake)}.` })
      setSlip(null)
      setTab('bets')
      reloadAll()
    } catch (cause) {
      setMessage({ ok: false, text: extractApiError(cause) })
    } finally {
      setPlacing(false)
    }
  }

  const reset = async () => {
    if (!window.confirm('¿Reiniciar el saldo a 100.000 COP ficticios y borrar tus apuestas?')) {
      return
    }
    try {
      await ligalyticsApi.resetWallet()
      setSlip(null)
      setMessage({ ok: true, text: 'Saldo reiniciado.' })
      reloadAll()
    } catch (cause) {
      setMessage({ ok: false, text: extractApiError(cause) })
    }
  }

  const w = wallet.data
  const balance = w?.balance ?? account.balance

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm text-amber-200">
        <strong>Simulación educativa con dinero ficticio.</strong> No se apuesta dinero real ni hay pagos. Las
        recomendaciones salen de un modelo cuya ventaja sobre las casas de apuestas <strong>no está demostrada</strong>.
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Apuestas (demo)</h1>
          <p className="text-sm text-slate-400">
            Hola, {account.displayName}. Cuotas reales (consenso de casas) y probabilidades de nuestro modelo.
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
          value={`${(w?.profit ?? 0) >= 0 ? '+' : ''}${cop(w?.profit ?? 0)}`}
          tone={(w?.profit ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}
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

      {slip && (
        <div className="space-y-3 rounded-xl border border-sky-500/40 bg-sky-500/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-300">Cupón de apuesta</h2>
          <p className="text-sm text-slate-200">
            <strong>{slip.title}</strong> · {slip.match}
          </p>
          <p className="text-xs text-slate-400">
            Cuota {slip.offer.odds.toFixed(2)}{' '}
            {slip.offer.source === 'demo'
              ? '(cuota demo calculada por el modelo, no es de ninguna casa real)'
              : slip.offer.source === 'pinnacle'
                ? '(cuota real de Pinnacle)'
                : '(consenso de casas)'}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              Importe (COP ficticios)
              <input
                type="number"
                min={MIN_STAKE}
                step={1000}
                value={slip.stake}
                onChange={(e) => setSlip({ ...slip, stake: Math.max(0, Math.floor(Number(e.target.value))) })}
                className="w-40 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              />
            </label>
            <p className="pb-2 text-sm text-slate-300">
              Ganancia posible: <strong className="text-emerald-300">{cop(Math.round(slip.stake * slip.offer.odds))}</strong>
            </p>
            <button
              type="button"
              onClick={place}
              disabled={placing || slip.stake < MIN_STAKE || slip.stake > balance}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {placing ? 'Apostando…' : 'Apostar'}
            </button>
            <button
              type="button"
              onClick={() => setSlip(null)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
          {slip.stake > balance && <p className="text-xs text-rose-300">El importe supera tu saldo ficticio.</p>}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-800">
        {(
          [
            ['recommendations', 'Recomendaciones'],
            ['matches', 'Partidos y cuotas'],
            ['bets', 'Mis apuestas'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === id ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'recommendations' && (
        <RecommendationList
          loading={recommendations.loading}
          error={recommendations.error}
          reload={recommendations.reload}
          items={recommendations.data ?? []}
          onChoose={(r) =>
            choose(r.eventId, `${r.homeTeam} vs ${r.awayTeam}`, r.homeTeam, r.awayTeam, r.offer, r.suggestedStake)
          }
        />
      )}
      {tab === 'matches' && (
        <MatchList
          loading={matches.loading}
          error={matches.error}
          reload={matches.reload}
          items={matches.data ?? []}
          onChoose={(m, offer) => choose(m.eventId, `${m.homeTeam} vs ${m.awayTeam}`, m.homeTeam, m.awayTeam, offer)}
        />
      )}
      {tab === 'bets' && <BetList loading={bets.loading} error={bets.error} reload={bets.reload} items={bets.data ?? []} />}
    </section>
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

interface ListProps<T> {
  loading: boolean
  error: string | null
  reload: () => void
  items: T[]
}

function RecommendationList({ loading, error, reload, items, onChoose }: ListProps<RecommendationDto> & {
  onChoose: (item: RecommendationDto) => void
}) {
  if (loading) {
    return <Spinner label="Calculando recomendaciones…" />
  }
  if (error) {
    return <ErrorAlert message={error} onRetry={reload} />
  }
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-slate-800 bg-slate-800/40 px-5 py-8 text-center text-sm text-slate-400">
        Ahora mismo el modelo no ve ninguna cuota con ventaja suficiente (mínimo 5 %). Es lo habitual: las cuotas de
        las casas suelen ser difíciles de superar.
      </p>
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Se recomienda una selección cuando la probabilidad del modelo × la cuota supera en un 5 % o más el valor justo. El
        importe sugerido es ¼ de Kelly, con tope del 5 % del saldo. No es asesoría: el modelo no ha demostrado ganar a las
        casas de apuestas.
      </p>
      {items.map((item) => (
        <div
          key={`${item.eventId}-${item.offer.market}-${item.offer.selection}-${item.offer.line}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4"
        >
          <div>
            <p className="font-semibold text-white">{describeOffer(item.offer, item.homeTeam, item.awayTeam)}</p>
            <p className="text-sm text-slate-400">
              {item.homeTeam} vs {item.awayTeam} · {formatDate(item.kickoff)} · {item.offer.marketLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Modelo {Math.round((item.offer.modelProbability ?? 0) * 100)}% · mercado {Math.round((item.offer.marketProbability ?? 0) * 100)}% · cuota {item.offer.odds.toFixed(2)} · ventaja estimada{' '}
              <span className="text-emerald-300">+{((item.offer.edge ?? 0) * 100).toFixed(1)}%</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChoose(item)}
            className="rounded-lg bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/30"
          >
            Apostar {cop(item.suggestedStake)}
          </button>
        </div>
      ))}
    </div>
  )
}

function MatchList({ loading, error, reload, items, onChoose }: ListProps<BettingMatchDto> & {
  onChoose: (match: BettingMatchDto, offer: OfferDto) => void
}) {
  if (loading) {
    return <Spinner label="Cargando cuotas…" />
  }
  if (error) {
    return <ErrorAlert message={error} onRetry={reload} />
  }
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No hay partidos con cuotas en los próximos días.</p>
  }
  return (
    <div className="space-y-4">
      {items.map((match) => (
        <div key={match.eventId} className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h3>
            <span className="text-xs text-slate-400">{formatDate(match.kickoff)}</span>
          </div>
          {MARKET_ORDER.map((market) => {
            const offers = match.offers.filter((o) => o.market === market)
            if (offers.length === 0) {
              return null
            }
            return (
              <div key={market}>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">
                  {offers[0].marketLabel}
                  {offers[0].source === 'demo' && <span className="ml-2 text-amber-300">cuotas demo del modelo</span>}
                  {offers[0].source === 'pinnacle' && <span className="ml-2 text-emerald-300">cuotas reales de Pinnacle</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {offers.map((offer) => (
                    <button
                      key={`${offer.selection}-${offer.line}`}
                      type="button"
                      onClick={() => onChoose(match, offer)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-left text-sm text-slate-200 transition hover:border-sky-500"
                    >
                      <span className="block">{describeOffer(offer, match.homeTeam, match.awayTeam)}</span>
                      <span className="text-sky-300">{offer.odds.toFixed(2)}</span>
                      {offer.modelProbability !== null && (
                        <span className="ml-2 text-xs text-slate-500">
                          modelo {Math.round(offer.modelProbability * 100)}%
                          {offer.recommended && (
                            <span className="text-emerald-300"> ▲</span>
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {!match.hasModel && (
            <p className="text-xs text-slate-500">Sin predicción propia para este partido (equipo sin historial).</p>
          )}
        </div>
      ))}
    </div>
  )
}

function BetList({ loading, error, reload, items }: ListProps<BetDto>) {
  if (loading) {
    return <Spinner label="Cargando tus apuestas…" />
  }
  if (error) {
    return <ErrorAlert message={error} onRetry={reload} />
  }
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">Todavía no has hecho ninguna apuesta.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-2 text-left">Partido</th>
            <th className="px-4 py-2 text-left">Apuesta</th>
            <th className="px-4 py-2 text-center">Cuota</th>
            <th className="px-4 py-2 text-right">Importe</th>
            <th className="px-4 py-2 text-center">Estado</th>
            <th className="px-4 py-2 text-right">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {items.map((bet) => {
            const status = STATUS_LABEL[bet.status]
            const net = bet.status === 'PENDING' ? null : bet.payout - bet.stake
            return (
              <tr key={bet.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-2 text-slate-200">
                  {bet.homeTeam} vs {bet.awayTeam}
                  <span className="block text-xs text-slate-500">{formatDate(bet.kickoff)}</span>
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {bet.marketLabel}: {describeBet(bet)}
                </td>
                <td className="px-4 py-2 text-center text-sky-300">
                  {bet.odds.toFixed(2)}
                  {bet.oddsSource === 'demo' && <span className="ml-1 text-xs text-amber-300">demo</span>}
                </td>
                <td className="px-4 py-2 text-right text-slate-300">{cop(bet.stake)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.tone}`}>{status.text}</span>
                </td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    net === null ? 'text-slate-500' : net >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {net === null ? '—' : `${net >= 0 ? '+' : ''}${cop(net)}`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function describeBet(bet: BetDto): string {
  const offer: OfferDto = {
    market: bet.market,
    marketLabel: bet.marketLabel,
    selection: bet.selection,
    line: bet.line,
    odds: bet.odds,
    source: bet.oddsSource as OfferDto['source'],
    modelProbability: null,
    marketProbability: null,
    adjustedProbability: null,
    edge: null,
    recommended: false,
  }
  return describeOffer(offer, bet.homeTeam, bet.awayTeam)
}
