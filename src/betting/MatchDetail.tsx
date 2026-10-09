import { Link, useParams } from 'react-router-dom'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import OddsButton from './OddsButton'
import { MARKET_ORDER, describeOffer, formatDay, formatKickoff } from './shared'

/** Todos los mercados de un partido: ganador, goles, ambos marcan, córneres y tarjetas. */
export default function MatchDetail() {
  const { eventId } = useParams()
  const id = Number(eventId)
  const match = useApi(() => ligalyticsApi.getBettingMatch(id), [id])

  if (match.loading) {
    return <Spinner label="Cargando mercados…" />
  }
  if (match.error || !match.data) {
    return (
      <div className="space-y-3">
        <ErrorAlert message={match.error ?? 'Partido no disponible'} onRetry={match.reload} />
        <Link to="/betting" className="text-sm text-sky-300 hover:underline">
          ‹ Volver a los partidos
        </Link>
      </div>
    )
  }

  const data = match.data
  return (
    <div className="space-y-4">
      <Link to="/betting" className="text-sm text-sky-300 hover:underline">
        ‹ Todos los partidos
      </Link>
      <header className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <p className="text-xs text-slate-400">
          {formatDay(data.kickoff)} · {formatKickoff(data.kickoff)} · España - LaLiga
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">
          {data.homeTeam} <span className="text-slate-500">vs</span> {data.awayTeam}
        </h2>
        {!data.hasModel && (
          <p className="mt-1 text-xs text-slate-500">Sin predicción propia para este partido (equipo sin historial).</p>
        )}
      </header>

      {MARKET_ORDER.map((market) => {
        const offers = data.offers.filter((o) => o.market === market)
        if (offers.length === 0) {
          return null
        }
        const source = offers[0].source
        const isDouble = market !== 'WINNER'
        return (
          <section key={market} className="space-y-2 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              {offers[0].marketLabel}
              {source === 'demo' && <span className="ml-2 text-xs normal-case text-amber-300">cuotas demo del modelo</span>}
              {source === 'pinnacle' && (
                <span className="ml-2 text-xs normal-case text-emerald-300">cuotas reales de Pinnacle</span>
              )}
            </h3>
            <div className={`grid gap-2 ${isDouble ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              {offers.map((offer) => (
                <OddsButton
                  key={`${offer.selection}-${offer.line}`}
                  match={data}
                  offer={offer}
                  label={describeOffer(offer, data.homeTeam, data.awayTeam)}
                  detailed
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
