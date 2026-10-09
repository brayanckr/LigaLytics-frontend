import type { BettingMatchDto, OfferDto } from '../types'
import { useBetting } from './BettingContext'
import { offerKey } from './shared'

interface Props {
  match: Pick<BettingMatchDto, 'eventId' | 'homeTeam' | 'awayTeam' | 'kickoff'>
  offer: OfferDto
  label: string
  /** Muestra la probabilidad del modelo y la marca de recomendada (vista de detalle). */
  detailed?: boolean
}

/** Botón de cuota: al pulsarlo añade (o quita) la selección del cupón. */
export default function OddsButton({ match, offer, label, detailed = false }: Props) {
  const { items, toggle } = useBetting()
  const key = offerKey(match.eventId, offer)
  const selected = items.some((item) => item.key === key)

  return (
    <button
      type="button"
      onClick={() =>
        toggle({
          key,
          eventId: match.eventId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          kickoff: match.kickoff,
          offer,
        })
      }
      aria-pressed={selected}
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
        selected
          ? 'border-sky-400 bg-sky-500/20 text-white'
          : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-500'
      }`}
    >
      <span className="text-left">
        <span className="block">{label}</span>
        {detailed && offer.modelProbability !== null && (
          <span className="text-xs text-slate-500">
            modelo {Math.round(offer.modelProbability * 100)}%
            {offer.recommended && <span className="text-emerald-300"> ▲ recomendada</span>}
          </span>
        )}
      </span>
      <span className={`font-semibold ${selected ? 'text-sky-200' : 'text-emerald-300'}`}>{offer.odds.toFixed(2)}</span>
    </button>
  )
}
