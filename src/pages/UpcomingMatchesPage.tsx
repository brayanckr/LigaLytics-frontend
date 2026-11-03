import { useMemo } from 'react'
import { ligalyticsApi } from '../api/ligalyticsApi'
import ErrorAlert from '../components/ErrorAlert'
import UpcomingMatchCard, { UpcomingMatchCardSkeleton } from '../components/UpcomingMatchCard'
import { useApi } from '../hooks/useApi'
import { useLiveMatches } from '../hooks/useLiveMatches'
import type { LiveStatus } from '../hooks/useLiveMatches'

const STATUS_TEXT: Record<LiveStatus, { text: string; dot: string }> = {
  connected: { text: 'Directo conectado', dot: 'bg-lime-400 motion-safe:animate-pulse-dot' },
  connecting: { text: 'Conectando al directo…', dot: 'bg-slate-400 motion-safe:animate-pulse-dot' },
  disconnected: { text: 'Directo desconectado · reintentando', dot: 'bg-amber-400' },
}

const DAYS_AHEAD = 7

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Próximos partidos de LaLiga en tarjetas: escudos, fecha, cuotas de córneres/tarjetas y predicción del sistema. */
export default function UpcomingMatchesPage() {
  const matches = useApi(() => ligalyticsApi.getBettingMatches(DAYS_AHEAD), [])
  // Una sola suscripción al montarse reparte el estado en vivo a todas las tarjetas.
  const { live, status } = useLiveMatches()
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Próximos partidos</h1>
          <span
            role="status"
            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"
          >
            <span aria-hidden className={`h-2 w-2 rounded-full ${STATUS_TEXT[status].dot}`} />
            {STATUS_TEXT[status].text}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          LaLiga · próximos {DAYS_AHEAD} días. Cuotas de córneres y tarjetas con la predicción del sistema.
        </p>
      </header>

      {matches.loading && (
        <p className="text-sm text-slate-400">Obteniendo cuotas actualizadas; la primera carga puede tardar unos segundos…</p>
      )}

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
            <UpcomingMatchCard key={match.eventId} match={match} crests={crests} index={index} live={live.get(match.eventId)} />
          ))}
        </div>
      )}
    </section>
  )
}
