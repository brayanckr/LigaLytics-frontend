import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { BettingMatchDto, OfferDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import Crest from './Crest'
import MatchPrediction, { canPredict } from './MatchPrediction'
import OddsButton from './OddsButton'
import { formatDay, formatKickoff } from './shared'

function groupByDay(matches: BettingMatchDto[]): [string, BettingMatchDto[]][] {
  const groups = new Map<string, BettingMatchDto[]>()
  for (const match of matches) {
    const day = formatDay(match.kickoff)
    groups.set(day, [...(groups.get(day) ?? []), match])
  }
  return [...groups.entries()]
}

function winnerOffers(match: BettingMatchDto): { label: string; offer: OfferDto | undefined }[] {
  const pick = (selection: string) => match.offers.find((o) => o.market === 'WINNER' && o.selection === selection)
  return [
    { label: '1', offer: pick('HOME') },
    { label: 'X', offer: pick('DRAW') },
    { label: '2', offer: pick('AWAY') },
  ]
}

/** Etiqueta temporal del partido. No hay datos en vivo, así que solo se distingue Hoy / Mañana / Próximo. */
function whenLabel(kickoff: string): string {
  const days = Math.round(
    (new Date(kickoff).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
  )
  return days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : 'Próximo'
}

/** Partido destacado: el que tiene la selección recomendada con más ventaja; si no hay, el primero con modelo. */
function pickFeatured(matches: BettingMatchDto[]): { match: BettingMatchDto; recommended: OfferDto | null } | null {
  let best: { match: BettingMatchDto; offer: OfferDto } | null = null
  for (const match of matches) {
    for (const offer of match.offers) {
      if (offer.recommended && (best === null || (offer.edge ?? 0) > (best.offer.edge ?? 0))) {
        best = { match, offer }
      }
    }
  }
  if (best) {
    return { match: best.match, recommended: best.offer }
  }
  const fallback = matches.find(canPredict) ?? matches[0]
  return fallback ? { match: fallback, recommended: null } : null
}

function FeaturedMatch({ match, recommended }: { match: BettingMatchDto; recommended: OfferDto | null }) {
  return (
    <section
      aria-label="Partido del día"
      className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-800 via-slate-800 to-sky-900/50 p-5 shadow-card sm:p-6"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="rounded-full bg-sky-500 px-2.5 py-1 text-white">
            {recommended ? 'Recomendación de la IA' : 'Partido destacado'}
          </span>
          <span className="text-slate-400">
            {whenLabel(match.kickoff)} · {formatKickoff(match.kickoff)} · LaLiga
          </span>
        </div>

        <Link
          to={`/betting/partido/${match.eventId}`}
          className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center"
        >
          <span className="flex flex-col items-center gap-2">
            <Crest name={match.homeTeam} size="lg" />
            <span className="text-base font-extrabold text-white sm:text-xl">{match.homeTeam}</span>
          </span>
          <span className="text-sm font-bold text-slate-400">VS</span>
          <span className="flex flex-col items-center gap-2">
            <Crest name={match.awayTeam} size="lg" />
            <span className="text-base font-extrabold text-white sm:text-xl">{match.awayTeam}</span>
          </span>
        </Link>

        {recommended && (
          <p className="mt-4 text-center text-sm text-slate-300">
            {recommended.marketLabel}: el modelo da{' '}
            <strong className="text-lime-400">{Math.round((recommended.modelProbability ?? 0) * 100)}%</strong> frente al{' '}
            {Math.round((recommended.marketProbability ?? 0) * 100)}% del mercado. Ventaja estimada, no demostrada.
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          {winnerOffers(match).map(({ label, offer }) =>
            offer ? <OddsButton key={label} match={match} offer={offer} label={label} showModel /> : null,
          )}
        </div>
      </div>
    </section>
  )
}

function MatchRow({ match, open, onToggle }: { match: BettingMatchDto; open: boolean; onToggle: () => void }) {
  const extra = match.offers.filter((o) => o.market !== 'WINNER').length
  const odds = winnerOffers(match)
  return (
    <article className="animate-pop-in rounded-xl border border-slate-700/60 bg-slate-800 transition hover:border-slate-600">
      <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center">
        <Link
          to={`/betting/partido/${match.eventId}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg hover:text-sky-300"
        >
          <span className="flex w-14 shrink-0 flex-col items-center text-center">
            <span className="text-sm font-bold tabular-nums text-white">{formatKickoff(match.kickoff)}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-sky-400">{whenLabel(match.kickoff)}</span>
          </span>
          <span className="min-w-0 space-y-1.5">
            <span className="flex items-center gap-2">
              <Crest name={match.homeTeam} />
              <span className="truncate text-sm font-bold text-white">{match.homeTeam}</span>
            </span>
            <span className="flex items-center gap-2">
              <Crest name={match.awayTeam} />
              <span className="truncate text-sm font-bold text-white">{match.awayTeam}</span>
            </span>
          </span>
        </Link>

        <div className="grid grid-cols-3 gap-2 lg:w-80">
          {odds.map(({ label, offer }) =>
            offer ? (
              <OddsButton key={label} match={match} offer={offer} label={label} showModel />
            ) : (
              <span
                key={label}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-700/60 text-slate-500"
              >
                —
              </span>
            ),
          )}
        </div>

        <div className="flex items-center gap-2 lg:w-52 lg:justify-end">
          <Link
            to={`/betting/partido/${match.eventId}`}
            className="inline-flex min-h-[44px] items-center rounded-full bg-slate-700 px-3 text-xs font-bold text-slate-200 transition hover:bg-sky-500 hover:text-white"
          >
            +{extra} mercados
          </Link>
          {canPredict(match) ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={`pred-${match.eventId}`}
              className={`min-h-[44px] rounded-full border px-3 text-xs font-bold transition ${
                open
                  ? 'border-sky-500 bg-sky-500/20 text-white'
                  : 'border-slate-600 text-sky-300 hover:border-sky-500'
              }`}
            >
              {open ? 'Ocultar IA' : 'Ver IA'}
            </button>
          ) : (
            <span className="px-2 text-xs text-slate-500" title="Equipo sin historial">
              Sin IA
            </span>
          )}
        </div>
      </div>
      {open && (
        <div id={`pred-${match.eventId}`} className="border-t border-slate-700/60 p-4">
          <MatchPrediction match={match} />
        </div>
      )}
    </article>
  )
}

/** Próximos partidos con destacado de la IA y filas compactas con la cuota 1 X 2; el detalle trae todos los mercados. */
export default function MatchList() {
  const matches = useApi(() => ligalyticsApi.getBettingMatches(7), [])
  const [openId, setOpenId] = useState<number | null>(null)

  if (matches.loading) {
    return <Spinner label="Cargando partidos y cuotas…" />
  }
  if (matches.error) {
    return <ErrorAlert message={matches.error} onRetry={matches.reload} />
  }
  const items = matches.data ?? []
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No hay partidos con cuotas en los próximos días.</p>
  }
  const featured = pickFeatured(items)

  return (
    <div className="space-y-6">
      {featured && <FeaturedMatch match={featured.match} recommended={featured.recommended} />}

      {groupByDay(items).map(([day, dayMatches]) => (
        <section key={day} className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-4 w-1 rounded-full bg-sky-500" />
            {day}
            <span className="text-xs font-medium text-slate-400">España · LaLiga</span>
          </h2>
          {dayMatches.map((match) => (
            <MatchRow
              key={match.eventId}
              match={match}
              open={openId === match.eventId}
              onToggle={() => setOpenId(openId === match.eventId ? null : match.eventId)}
            />
          ))}
        </section>
      ))}
    </div>
  )
}
