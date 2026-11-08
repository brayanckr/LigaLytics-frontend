import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Crest from '../betting/Crest'
import { describeOffer, formatDay, formatKickoff } from '../betting/shared'
import type { BettingMatchDto, MarketCode, OfferDto } from '../types'
import type { LiveMatchState } from '../hooks/useLiveMatches'
import Flash from './Flash'
import { ArrowIcon, SparkIcon } from './icons'
import { Skeleton } from './Skeleton'

interface UpcomingMatchCardProps {
  match: BettingMatchDto
  /** Escudos oficiales por id de equipo (si la API de calendario los entrega). */
  crests: Map<number, string>
  index: number
  /** Estado en vivo recibido por WebSocket; sin él la tarjeta muestra solo los datos previos al partido. */
  live?: LiveMatchState
}

const STAT_MARKETS: { market: MarketCode; label: string; field: 'corners' | 'cards' }[] = [
  { market: 'CORNERS', label: 'Córneres', field: 'corners' },
  { market: 'CARDS', label: 'Tarjetas', field: 'cards' },
]

const EVENT_LABEL: Record<string, string> = {
  KICK_OFF: 'Comienza el partido',
  GOAL: '⚽ Gol',
  YELLOW_CARD: '🟨 Tarjeta amarilla',
  RED_CARD: '🟥 Tarjeta roja',
  CORNER: '🚩 Córner',
  HALF_TIME: 'Descanso',
  FULL_TIME: 'Final del partido',
}

/** Oferta representativa de un mercado: la recomendada, si no la que el modelo ve más probable. */
function pickOffer(match: BettingMatchDto, market: MarketCode): OfferDto | null {
  const offers = match.offers.filter((offer) => offer.market === market)
  if (offers.length === 0) return null
  return (
    offers.find((offer) => offer.recommended) ??
    [...offers].sort((a, b) => (b.modelProbability ?? -1) - (a.modelProbability ?? -1))[0]
  )
}

function whenLabel(kickoff: string): string {
  const days = Math.round((new Date(kickoff).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  return days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : 'Próximo'
}

/** Predicción 1X2 del sistema: la selección con mayor probabilidad del modelo y el reparto de las tres. */
function systemPrediction(match: BettingMatchDto) {
  const winners = match.offers.filter((offer) => offer.market === 'WINNER' && offer.modelProbability !== null)
  if (!match.hasModel || winners.length === 0) return null
  const best = [...winners].sort((a, b) => (b.modelProbability ?? 0) - (a.modelProbability ?? 0))[0]
  const share = (selection: string) => Math.round((winners.find((o) => o.selection === selection)?.modelProbability ?? 0) * 100)
  return {
    text: describeOffer(best, match.homeTeam, match.awayTeam),
    percent: Math.round((best.modelProbability ?? 0) * 100),
    home: share('HOME'),
    draw: share('DRAW'),
    away: share('AWAY'),
  }
}

/** Tarjeta de un próximo partido: escudos, fecha, cuotas de córneres/tarjetas y predicción del sistema. */
export default function UpcomingMatchCard({ match, crests, index, live }: UpcomingMatchCardProps) {
  const prediction = systemPrediction(match)
  const hasScore = live !== undefined && live.homeScore !== null && live.awayScore !== null

  return (
    <Link
      to={`/betting/partido/${match.eventId}`}
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` } as CSSProperties}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-800 p-4 shadow-card transition-all duration-300 ease-out motion-safe:animate-rise hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-[0_18px_40px_-16px_rgba(255,80,0,.45)] sm:p-5"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/0 blur-3xl transition-colors duration-300 group-hover:bg-sky-500/20"
      />

      <header className="relative flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-400">
          {formatDay(match.kickoff)} · <span className="tabular-nums text-white">{formatKickoff(match.kickoff)}</span>
        </span>
        {live ? (
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold uppercase tracking-wide ${
              live.finished ? 'bg-slate-600/40 text-slate-300' : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {!live.finished && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose-400 motion-safe:animate-pulse-dot" />}
            {live.finished ? 'Final' : 'En vivo'}
            {live.minute !== null && !live.finished && <Flash value={live.minute}>{live.minute}&apos;</Flash>}
          </span>
        ) : (
          <span className="rounded-full bg-sky-500/15 px-2.5 py-1 font-bold uppercase tracking-wide text-sky-300">
            {whenLabel(match.kickoff)}
          </span>
        )}
      </header>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <span className="flex min-w-0 flex-col items-center gap-2">
          <span className="transition-transform duration-300 group-hover:scale-110">
            <Crest name={match.homeTeam} size="lg" src={match.homeTeamId ? crests.get(match.homeTeamId) : null} />
          </span>
          <span className="w-full truncate text-sm font-extrabold text-white">{match.homeTeam}</span>
        </span>
        {hasScore ? (
          <span aria-live="polite" className="flex items-center gap-1 text-2xl font-black text-white">
            <Flash value={live.homeScore}>{live.homeScore}</Flash>
            <span className="text-slate-500">-</span>
            <Flash value={live.awayScore}>{live.awayScore}</Flash>
          </span>
        ) : (
          <span className="text-xs font-bold text-slate-500">VS</span>
        )}
        <span className="flex min-w-0 flex-col items-center gap-2">
          <span className="transition-transform duration-300 group-hover:scale-110">
            <Crest name={match.awayTeam} size="lg" src={match.awayTeamId ? crests.get(match.awayTeamId) : null} />
          </span>
          <span className="w-full truncate text-sm font-extrabold text-white">{match.awayTeam}</span>
        </span>
      </div>

      {live && EVENT_LABEL[live.type] && (
        <p aria-live="polite" className="relative -mt-1 text-center text-xs font-bold text-lime-300">
          <Flash value={live.updates}>{EVENT_LABEL[live.type]}</Flash>
        </p>
      )}

      <div className="relative rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <SparkIcon width={14} height={14} className="text-sky-400" /> Predicción del sistema
        </p>
        {prediction ? (
          <>
            <p className="mt-1 text-sm font-bold text-white">
              {prediction.text} <span className="text-lime-400">· {prediction.percent}%</span>
            </p>
            <div
              role="img"
              aria-label={`Local ${prediction.home}%, empate ${prediction.draw}%, visitante ${prediction.away}%`}
              className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-700"
            >
              <span className="bg-sky-500" style={{ width: `${prediction.home}%` }} />
              <span className="bg-slate-400" style={{ width: `${prediction.draw}%` }} />
              <span className="bg-lime-400" style={{ width: `${prediction.away}%` }} />
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Sin historial suficiente para predecir.</p>
        )}
      </div>

      <ul className="relative grid grid-cols-2 gap-2">
        {STAT_MARKETS.map(({ market, label, field }) => {
          const offer = pickOffer(match, market)
          const total = live?.[field] ?? null
          return (
            <li key={market} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
              <p className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
                {total !== null && (
                  <span className="flex items-center gap-1 normal-case text-lime-300">
                    en vivo <Flash value={total}>{total}</Flash>
                  </span>
                )}
              </p>
              {offer ? (
                <p className="mt-0.5 flex items-baseline justify-between gap-2 text-sm font-bold">
                  <span className="truncate text-slate-200">
                    {offer.selection === 'OVER' ? 'Más' : 'Menos'} de {offer.line}
                  </span>
                  <span className="tabular-nums text-lime-400">{offer.odds.toFixed(2)}</span>
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-slate-500">—</p>
              )}
            </li>
          )
        })}
      </ul>

      <span className="relative mt-auto flex items-center justify-between text-xs font-bold text-sky-300">
        Ver todos los mercados
        <ArrowIcon width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

/** Marcador de posición con la misma estructura que la tarjeta real, con brillo que recorre de izquierda a derecha. */
export function UpcomingMatchCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/70 bg-slate-800 p-4 sm:p-5" aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16 !rounded-full" />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-16 w-16 !rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-5" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-16 w-16 !rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-[72px] !rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  )
}
