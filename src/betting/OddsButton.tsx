import type { BettingMatchDto, OfferDto } from '../types'
import { useBetting } from './BettingContext'
import { offerKey } from './shared'

interface Props {
  match: Pick<BettingMatchDto, 'eventId' | 'homeTeam' | 'awayTeam' | 'kickoff'>
  offer: OfferDto
  label: string
  /** Muestra la probabilidad del modelo y la marca de recomendada (vista de detalle). */
  detailed?: boolean
  /** Muestra bajo la cuota la probabilidad del modelo en una línea corta (feed de partidos). */
  showModel?: boolean
}

/** Pill de cuota: al pulsarla añade (o quita) la selección del cupón. */
export default function OddsButton({ match, offer, label, detailed = false, showModel = false }: Props) {
  const { items, toggle } = useBetting()
  const key = offerKey(match.eventId, offer)
  const selected = items.some((item) => item.key === key)
  const model = offer.modelProbability !== null ? Math.round(offer.modelProbability * 100) : null

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
      className={`group flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-bold tabular-nums transition duration-150 active:scale-95 ${
        selected
          ? 'border-sky-500 bg-sky-500 text-white shadow-glow'
          : 'border-slate-700 bg-slate-900 text-slate-200 hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-glow'
      }`}
    >
      <span className="text-left">
        <span className={`block text-xs font-semibold ${selected ? 'text-white/90' : 'text-slate-400'}`}>{label}</span>
        {detailed && model !== null && (
          <span className={`text-xs font-medium ${selected ? 'text-white/90' : 'text-slate-400'}`}>
            IA {model}%
            {offer.recommended && <span className={selected ? ' text-white' : ' text-lime-400'}> ▲ recomendada</span>}
          </span>
        )}
      </span>
      <span className="text-right">
        <span className={`block text-base ${selected ? 'text-white' : 'text-lime-400'}`}>{offer.odds.toFixed(2)}</span>
        {showModel && model !== null && (
          <span className={`block text-[10px] font-medium ${selected ? 'text-white/90' : 'text-slate-400'}`}>
            IA {model}%
          </span>
        )}
      </span>
    </button>
  )
}
