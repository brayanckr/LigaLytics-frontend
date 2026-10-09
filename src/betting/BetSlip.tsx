import { useState } from 'react'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useBetting } from './BettingContext'
import { MAX_LEGS, MAX_TOTAL_ODDS, MIN_STAKE, cop, describeOffer, formatKickoff, sourceLabel } from './shared'

/** Cupón: una selección es una apuesta simple; dos o más forman una combinada (parlay) con la cuota multiplicada. */
export default function BetSlip() {
  const { items, stake, setStake, remove, clear, notice, balance, onPlaced } = useBetting()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isParlay = items.length >= 2
  const totalOdds = Math.round(items.reduce((acc, item) => acc * item.offer.odds, 1) * 100) / 100
  const potential = Math.round(stake * totalOdds)
  const tooManyLegs = items.length > MAX_LEGS
  const tooHighOdds = totalOdds > MAX_TOTAL_ODDS
  const invalid = stake < MIN_STAKE || stake > balance || tooManyLegs || tooHighOdds

  const place = async () => {
    setPlacing(true)
    setError(null)
    try {
      if (isParlay) {
        await ligalyticsApi.placeParlay({
          stake,
          legs: items.map((i) => ({
            eventId: i.eventId,
            market: i.offer.market,
            selection: i.offer.selection,
            line: i.offer.line,
          })),
        })
        onPlaced(`Combinada registrada: ${items.length} selecciones, cuota ${totalOdds.toFixed(2)}, ${cop(stake)}.`)
      } else {
        const item = items[0]
        await ligalyticsApi.placeBet({
          eventId: item.eventId,
          market: item.offer.market,
          selection: item.offer.selection,
          line: item.offer.line,
          stake,
        })
        onPlaced(`Apuesta registrada: ${describeOffer(item.offer, item.homeTeam, item.awayTeam)} por ${cop(stake)}.`)
      }
    } catch (cause) {
      setError(extractApiError(cause))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <aside className="space-y-3 rounded-xl border border-sky-500/40 bg-sky-500/5 p-4 lg:sticky lg:top-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-300">
          {items.length === 0 ? 'Cupón' : isParlay ? `Combinada (${items.length})` : 'Apuesta simple'}
        </h2>
        {items.length > 0 && (
          <button type="button" onClick={clear} className="text-xs text-slate-400 hover:text-slate-200">
            Vaciar
          </button>
        )}
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {notice}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">
          Pulsa una cuota para añadirla. Con una sola es una apuesta simple; con dos o más se combinan en una{' '}
          <strong className="text-slate-200">combinada</strong> (cuotas multiplicadas, hay que acertarlas todas).
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.key} className="rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{describeOffer(item.offer, item.homeTeam, item.awayTeam)}</p>
                    <p className="truncate text-xs text-slate-400">
                      {item.homeTeam} vs {item.awayTeam} · {formatKickoff(item.kickoff)}
                    </p>
                    <p className="text-xs text-slate-500">{sourceLabel(item.offer.source)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold text-emerald-300">{item.offer.odds.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      aria-label="Quitar selección"
                      className="text-slate-500 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {items.length === 1 && (
            <p className="text-xs text-slate-500">
              Añade otra selección de un partido distinto para crear una combinada (una sola selección por partido).
            </p>
          )}

          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Importe (COP ficticios)
            <input
              type="number"
              min={MIN_STAKE}
              step={1000}
              value={stake}
              onChange={(e) => setStake(Math.max(0, Math.floor(Number(e.target.value))))}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
            />
          </label>

          <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-300">
              <dt>{isParlay ? 'Cuota total' : 'Cuota'}</dt>
              <dd className="font-semibold text-emerald-300">{totalOdds.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-slate-300">
              <dt>Ganancia posible</dt>
              <dd className="font-semibold text-emerald-300">{cop(potential)}</dd>
            </div>
          </dl>

          {items.some((i) => i.offer.source === 'demo') && (
            <p className="text-xs text-amber-300">Incluye cuotas demo calculadas por el modelo (no son de una casa real).</p>
          )}
          {stake > balance && <p className="text-xs text-rose-300">El importe supera tu saldo ficticio.</p>}
          {tooManyLegs && <p className="text-xs text-rose-300">Máximo {MAX_LEGS} selecciones por combinada.</p>}
          {tooHighOdds && <p className="text-xs text-rose-300">La cuota total máxima es {MAX_TOTAL_ODDS}.</p>}
          {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}

          <button
            type="button"
            onClick={place}
            disabled={placing || invalid}
            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {placing ? 'Apostando…' : isParlay ? 'Apostar combinada' : 'Apostar'}
          </button>
        </>
      )}
    </aside>
  )
}
