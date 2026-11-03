import { useMemo } from 'react'
import { ligalyticsApi } from '../api/ligalyticsApi'
import ErrorAlert from '../components/ErrorAlert'
import UpcomingMatchCard, { UpcomingMatchCardSkeleton } from '../components/UpcomingMatchCard'
import { useApi } from '../hooks/useApi'

const DAYS_AHEAD = 7

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Próximos partidos de LaLiga en tarjetas: escudos, fecha, cuotas de córneres/tarjetas y predicción del sistema. */
export default function UpcomingMatchesPage() {
  const matches = useApi(() => ligalyticsApi.getBettingMatches(DAYS_AHEAD), [])
  // Los escudos son un extra: si el calendario falla, las tarjetas muestran las iniciales.
  const fixtures = useApi(() => {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + DAYS_AHEAD)
    return ligalyticsApi.getFixtures(isoDay(from), isoDay(to))
  }, [])

  const crests = useMemo(() => {
    const map = new Map<number, string>()
    for (const fixture of fixtures.data ?? []) {
      if (fixture.homeTeamId && fixture.homeCrest) map.set(fixture.homeTeamId, fixture.homeCrest)
      if (fixture.awayTeamId && fixture.awayCrest) map.set(fixture.awayTeamId, fixture.awayCrest)
    }
    return map
  }, [fixtures.data])

  const items = useMemo(
    () => [...(matches.data ?? [])].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [matches.data],
  )

  return (
    <section className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Próximos partidos</h1>
        <p className="text-sm text-slate-400">
          LaLiga · próximos {DAYS_AHEAD} días. Cuotas de córneres y tarjetas con la predicción del sistema.
        </p>
      </header>

      {matches.loading && (
        <div
          role="status"
          aria-busy="true"
          aria-label="Cargando partidos"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <UpcomingMatchCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!matches.loading && matches.error && <ErrorAlert message={matches.error} onRetry={matches.reload} />}

      {!matches.loading && !matches.error && items.length === 0 && (
        <p className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-6 text-center text-sm text-slate-400">
          No hay partidos con cuotas en los próximos días.
        </p>
      )}

      {!matches.loading && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((match, index) => (
            <UpcomingMatchCard key={match.eventId} match={match} crests={crests} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
