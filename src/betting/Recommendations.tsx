import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import { formatDate } from '../lib/format'
import { useBetting } from './BettingContext'
import { cop, describeOffer, offerKey } from './shared'

/** Selecciones donde nuestro modelo ve ventaja sobre las cuotas reales (no demostrada). */
export default function Recommendations() {
  const { selectOnly } = useBetting()
  const recommendations = useApi(() => ligalyticsApi.getRecommendations(), [])

  if (recommendations.loading) {
    return <Spinner label="Calculando recomendaciones…" />
  }
  if (recommendations.error) {
    return <ErrorAlert message={recommendations.error} onRetry={recommendations.reload} />
  }
  const items = recommendations.data ?? []
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-slate-800 bg-slate-800/40 px-5 py-8 text-center text-sm text-slate-400">
        Ahora mismo el modelo no ve ninguna cuota con ventaja suficiente (mínimo 3 %). Es lo habitual: las cuotas de las
        casas suelen ser difíciles de superar.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Se recomienda una selección cuando la probabilidad del modelo, anclada a la del mercado, × la cuota supera el
        valor justo. El importe sugerido es ¼ de Kelly, con tope del 5 % del saldo. No es asesoría: el modelo no ha
        demostrado ganar a las casas de apuestas.
      </p>
      {items.map((item) => (
        <div
          key={offerKey(item.eventId, item.offer)}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4"
        >
          <div>
            <p className="font-semibold text-white">{describeOffer(item.offer, item.homeTeam, item.awayTeam)}</p>
            <p className="text-sm text-slate-400">
              {item.homeTeam} vs {item.awayTeam} · {formatDate(item.kickoff)} · {item.offer.marketLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Modelo {Math.round((item.offer.modelProbability ?? 0) * 100)}% · mercado{' '}
              {Math.round((item.offer.marketProbability ?? 0) * 100)}% · cuota {item.offer.odds.toFixed(2)} · ventaja
              estimada <span className="text-emerald-300">+{((item.offer.edge ?? 0) * 100).toFixed(1)}%</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              selectOnly(
                {
                  key: offerKey(item.eventId, item.offer),
                  eventId: item.eventId,
                  homeTeam: item.homeTeam,
                  awayTeam: item.awayTeam,
                  kickoff: item.kickoff,
                  offer: item.offer,
                },
                item.suggestedStake,
              )
            }
            className="rounded-lg bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/30"
          >
            Apostar {cop(item.suggestedStake)}
          </button>
        </div>
      ))}
    </div>
  )
}
