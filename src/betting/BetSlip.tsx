import { useEffect, useState } from 'react'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useBetting } from './BettingContext'
import { MAX_LEGS, MAX_TOTAL_ODDS, MIN_STAKE, cop, describeOffer, formatKickoff, sourceLabel } from './shared'

/** Probabilidad acumulada del modelo (producto de las patas, suponiendo independencia); null si falta alguna. */
function combinedProbability(values: (number | null)[]): number | null {
  if (values.length === 0 || values.some((v) => v === null)) {
    return null
  }
  return (values as number[]).reduce((acc, v) => acc * v, 1)
}

function SlipBody() {
  const { items, stake, setStake, remove, clear, notice, balance, onPlaced } = useBetting()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isParlay = items.length >= 2
  const totalOdds = Math.round(items.reduce((acc, item) => acc * item.offer.odds, 1) * 100) / 100
  const potential = Math.round(stake * totalOdds)
  const tooManyLegs = items.length > MAX_LEGS
  const tooHighOdds = totalOdds > MAX_TOTAL_ODDS
  const invalid = stake < MIN_STAKE || stake > balance || tooManyLegs || tooHighOdds
  const modelProb = combinedProbability(items.map((i) => i.offer.modelProbability))
  const impliedProb = items.length > 0 ? 1 / totalOdds : null

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-white">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-500 px-1.5 text-xs text-white">
            {items.length}
          </span>
          {items.length === 0 ? 'Boleto' : isParlay ? 'Combinada' : 'Apuesta simple'}
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="min-h-[44px] px-2 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
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
        <p className="rounded-lg border border-dashed border-slate-700 px-3 py-6 text-center text-sm text-slate-400">
          Pulsa una cuota para añadirla. Con dos o más se forma una{' '}
          <strong className="text-slate-200">combinada</strong>: hay que acertarlas todas.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.key}
                className="animate-pop-in rounded-lg border border-slate-700 border-l-sky-500 bg-slate-900 p-2.5 text-sm [border-left-width:3px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-white">{describeOffer(item.offer, item.homeTeam, item.awayTeam)}</p>
                    <p className="truncate text-xs text-slate-400">
                      {item.homeTeam} vs {item.awayTeam} · {formatKickoff(item.kickoff)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {sourceLabel(item.offer.source)}
                      {item.offer.modelProbability !== null && ` · IA ${Math.round(item.offer.modelProbability * 100)}%`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-bold tabular-nums text-lime-400">{item.offer.odds.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      aria-label={`Quitar ${describeOffer(item.offer, item.homeTeam, item.awayTeam)}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {items.length === 1 && (
            <p className="text-xs text-slate-400">
              Añade otra selección de un partido distinto para crear una combinada (una sola por partido).
            </p>
          )}

          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
            Importe (COP ficticios)
            <input
              type="number"
              inputMode="numeric"
              min={MIN_STAKE}
              step={1000}
              value={stake}
              onChange={(e) => setStake(Math.max(0, Math.floor(Number(e.target.value))))}
              className="h-11 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm font-bold tabular-nums text-white focus:border-sky-500"
            />
          </label>

          <dl className="space-y-1.5 rounded-lg bg-slate-900 p-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <dt>{isParlay ? 'Cuota total' : 'Cuota'}</dt>
              <dd className="font-bold tabular-nums text-lime-400">{totalOdds.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-slate-300">
              <dt>Ganancia posible</dt>
              <dd className="font-bold tabular-nums text-lime-400">{cop(potential)}</dd>
            </div>
            <div className="border-t border-slate-700/60 pt-2">
              <div className="flex justify-between text-slate-300">
                <dt>Probabilidad IA{isParlay ? ' acumulada' : ''}</dt>
                <dd className="font-bold tabular-nums text-white">
                  {modelProb === null ? 'n/d' : `${(modelProb * 100).toFixed(1)}%`}
                </dd>
              </div>
              {modelProb !== null && (
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-700"
                  role="img"
                  aria-label={`Probabilidad acumulada del modelo ${(modelProb * 100).toFixed(1)}%`}
                >
                  <div
                    className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
                    style={{ width: `${Math.max(2, modelProb * 100)}%` }}
                  />
                </div>
              )}
              {impliedProb !== null && (
                <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                  <dt>Implícita en la cuota</dt>
                  <dd className="tabular-nums">{(impliedProb * 100).toFixed(1)}%</dd>
                </div>
              )}
              {isParlay && modelProb !== null && (
                <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
                  Producto de las probabilidades del modelo, suponiendo partidos independientes. Es una estimación, no una garantía.
                </p>
              )}
            </div>
          </dl>

          {items.some((i) => i.offer.source === 'demo') && (
            <p className="text-xs text-amber-300">Incluye cuotas demo calculadas por el modelo (no son de una casa real).</p>
          )}
          {stake > balance && <p className="text-xs text-rose-300">El importe supera tu saldo ficticio.</p>}
          {tooManyLegs && <p className="text-xs text-rose-300">Máximo {MAX_LEGS} selecciones por combinada.</p>}
          {tooHighOdds && <p className="text-xs text-rose-300">La cuota total máxima es {MAX_TOTAL_ODDS}.</p>}
          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={place}
            disabled={placing || invalid}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:active:scale-100"
          >
            {placing ? 'Apostando…' : isParlay ? 'Apostar combinada' : 'Apostar'}
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Boleto: panel fijo a la derecha en escritorio; en móvil, una barra flotante sobre la navegación inferior
 * que abre el boleto como hoja inferior. Una selección es apuesta simple; dos o más, combinada (cuotas multiplicadas).
 */
export default function BetSlip() {
  const { items } = useBetting()
  const [sheetOpen, setSheetOpen] = useState(false)
  const totalOdds = items.reduce((acc, item) => acc * item.offer.odds, 1)

  useEffect(() => {
    if (!sheetOpen) {
      return
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setSheetOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  useEffect(() => {
    if (items.length === 0) {
      setSheetOpen(false)
    }
  }, [items.length])

  return (
    <>
      <aside
        aria-label="Boleto de apuestas"
        className="card hidden self-start border-sky-500/30 p-4 lg:sticky lg:top-20 lg:block"
      >
        <SlipBody />
      </aside>

      {items.length > 0 && !sheetOpen && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="fixed inset-x-3 bottom-[calc(56px+env(safe-area-inset-bottom)+8px)] z-30 flex min-h-[48px] animate-pop-in items-center justify-between rounded-xl bg-sky-500 px-4 text-sm font-extrabold text-white shadow-glow lg:hidden"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs text-sky-600">
              {items.length}
            </span>
            Ver boleto
          </span>
          <span className="tabular-nums">Cuota {totalOdds.toFixed(2)}</span>
        </button>
      )}

      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Boleto de apuestas">
          <button
            type="button"
            aria-label="Cerrar boleto"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-pop-in overflow-y-auto rounded-t-2xl border-t border-slate-700 bg-slate-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="min-h-[44px] rounded-full px-3 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cerrar
              </button>
            </div>
            <SlipBody />
          </div>
        </div>
      )}
    </>
  )
}
