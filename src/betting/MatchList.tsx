import { Link } from 'react-router-dom'
import type { BettingMatchDto } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
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

/** Próximos partidos con la cuota 1 X 2 de cada uno; al entrar en un partido se ven todos sus mercados. */
export default function MatchList() {
  const matches = useApi(() => ligalyticsApi.getBettingMatches(7), [])

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

  return (
    <div className="space-y-6">
      {groupByDay(items).map(([day, dayMatches]) => (
        <section key={day} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{day}</h2>
          {dayMatches.map((match) => {
            const winner = match.offers.filter((o) => o.market === 'WINNER')
            const pick = (selection: string) => winner.find((o) => o.selection === selection)
            const home = pick('HOME')
            const draw = pick('DRAW')
            const away = pick('AWAY')
            const extra = match.offers.length - winner.length
            return (
              <article
                key={match.eventId}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 lg:flex-row lg:items-center"
              >
                <Link
                  to={`/betting/partido/${match.eventId}`}
                  className="flex min-w-0 flex-1 items-center gap-4 hover:text-sky-300"
                >
                  <span className="w-12 shrink-0 text-center text-xs text-slate-400">{formatKickoff(match.kickoff)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-white">{match.homeTeam}</span>
                    <span className="block truncate font-semibold text-white">{match.awayTeam}</span>
                    <span className="text-xs text-slate-500">España - LaLiga</span>
                  </span>
                </Link>
                <div className="grid grid-cols-3 gap-2 lg:w-96">
                  {[
                    { label: '1', offer: home },
                    { label: 'X', offer: draw },
                    { label: '2', offer: away },
                  ].map(({ label, offer }) =>
                    offer ? (
                      <OddsButton key={label} match={match} offer={offer} label={label} />
                    ) : (
                      <span key={label} className="rounded-lg border border-slate-800 px-3 py-2 text-center text-slate-600">
                        —
                      </span>
                    ),
                  )}
                </div>
                <Link
                  to={`/betting/partido/${match.eventId}`}
                  className="shrink-0 text-center text-xs font-medium text-sky-300 hover:underline lg:w-24"
                >
                  +{extra} mercados ›
                </Link>
              </article>
            )
          })}
        </section>
      ))}
    </div>
  )
}
