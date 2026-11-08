import type { CSSProperties, ReactNode } from 'react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { FixtureDto, TargetResult } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import { useLiveRanking } from '../hooks/useLiveRanking'
import Crest from '../betting/Crest'
import ErrorAlert from '../components/ErrorAlert'
import Flash from '../components/Flash'
import ModelReportCard from '../components/ModelReportCard'
import { Skeleton } from '../components/Skeleton'
import {
  ArrowIcon,
  LiveIcon,
  ModelIcon,
  SparkIcon,
  TeamsIcon,
  TrendDownIcon,
  TrendUpIcon,
  TrophyIcon,
} from '../components/icons'

const RANGE_DAYS = 7

const TARGET_SHORT: Record<string, string> = {
  resultado: 'Resultado 1X2',
  goles: 'Goles',
  corneres: 'Córneres',
  tarjetas: 'Tarjetas',
}

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatMetric(result: TargetResult): string {
  if (result.metric === null) {
    return '—'
  }
  return result.metricName === 'accuracy' ? `${(result.metric * 100).toFixed(1)}%` : result.metric.toFixed(2)
}

function beatsBaseline(result: TargetResult): boolean | null {
  if (result.metric === null || result.baseline === null) {
    return null
  }
  return result.metricName === 'accuracy' ? result.metric > result.baseline : result.metric < result.baseline
}

/** Diferencia con el modelo trivial, con signo: «+4.2 pts» (accuracy) o «−0.12» (MAE, menos es mejor). */
function formatDelta(result: TargetResult): string | null {
  if (result.metric === null || result.baseline === null) {
    return null
  }
  const diff = result.metric - result.baseline
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : ''
  const magnitude = Math.abs(diff)
  return result.metricName === 'accuracy' ? `${sign}${(magnitude * 100).toFixed(1)} pts` : `${sign}${magnitude.toFixed(2)}`
}

/**
 * Panel del bento: una sola superficie con filo de 1px (sin marcos dentro de marcos). Entra con retardo escalonado y,
 * al pasar el cursor, solo sube un punto el contraste del filo.
 */
function Tile({
  index,
  className = '',
  title,
  icon,
  to,
  action,
  children,
}: {
  index: number
  className?: string
  title: string
  icon: ReactNode
  to?: string
  action?: string
  children: ReactNode
}) {
  return (
    <section
      style={{ animationDelay: `${index * 40}ms` } as CSSProperties}
      className={`group/tile card animate-rise p-4 transition-colors duration-200 hover:border-white/10 sm:p-5 ${className}`}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[13px] font-bold text-white">
          <span className="text-sky-400">{icon}</span>
          {title}
        </h2>
        {to && action && (
          <Link
            to={to}
            className="flex min-h-[44px] items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            {action}
            <ArrowIcon size={14} className="transition-transform duration-200 group-hover/tile:translate-x-0.5" />
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}

function NextMatches({ fixtures, loading, error, reload }: { fixtures: FixtureDto[]; loading: boolean; error: string | null; reload: () => void }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    )
  }
  if (error) {
    return <ErrorAlert message={error} onRetry={reload} />
  }
  if (fixtures.length === 0) {
    return <p className="text-sm text-slate-400">No hay partidos programados en los próximos {RANGE_DAYS} días.</p>
  }
  return (
    <ul className="-mx-2 divide-y divide-white/5">
      {fixtures.map((fixture, rowIndex) => {
        const live = fixture.status === 'LIVE'
        const date = new Date(fixture.utcDate)
        return (
          <li
            key={fixture.id}
            style={{ animationDelay: `${rowIndex * 40}ms` } as CSSProperties}
            className="motion-safe:animate-rise"
          >
            <Link
              to="/predict"
              className="flex min-h-[56px] items-center gap-3 rounded-lg px-2 transition-colors duration-150 hover:bg-white/[.04]"
            >
              <span className="flex w-11 shrink-0 flex-col">
                {live ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-rose-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-rose-400" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                    </span>
                    Vivo
                  </span>
                ) : (
                  <>
                    <span className="num text-[13px] text-white">
                      {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-medium uppercase text-slate-400">
                      {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                    </span>
                  </>
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex min-w-0 items-center gap-2">
                  <Crest name={fixture.homeTeam} src={fixture.homeCrest} size="sm" />
                  <span className="truncate text-xs font-semibold text-white">{fixture.homeTeam}</span>
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <Crest name={fixture.awayTeam} src={fixture.awayCrest} size="sm" />
                  <span className="truncate text-xs font-semibold text-slate-300">{fixture.awayTeam}</span>
                </span>
              </span>
              <ArrowIcon size={14} className="shrink-0 text-slate-600" aria-hidden="true" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function DashboardPage() {
  const range = useMemo(() => {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + RANGE_DAYS)
    return [isoDay(from), isoDay(to)] as const
  }, [])

  const health = useApi(() => ligalyticsApi.getHealth(), [])
  const ranking = useLiveRanking()
  const modelReport = useApi(() => ligalyticsApi.getModelReport(), [])
  const fixtures = useApi(() => ligalyticsApi.getFixtures(range[0], range[1]), [range])

  const topTeams = (ranking.data ?? []).slice(0, 5)
  const teamGrid = (ranking.data ?? []).slice(0, 8)
  const upcoming = (fixtures.data ?? [])
    .filter((f) => f.status === 'SCHEDULED' || f.status === 'LIVE')
    .sort((a, b) => (a.status === 'LIVE' ? -1 : b.status === 'LIVE' ? 1 : a.utcDate.localeCompare(b.utcDate)))
    .slice(0, 4)
  const results = (modelReport.data?.results ?? []).filter((r) => r.trained)
  const apiOk = Boolean(health.data) && !health.error

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Hero: una superficie, luz contextual por capas y las métricas del modelo como tira con separadores */}
      <section className="card relative animate-rise overflow-hidden p-6 shadow-float sm:p-8 lg:col-span-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(46rem 24rem at 100% -10%, rgba(255,80,0,.20), transparent 62%), radial-gradient(30rem 20rem at 0% 120%, rgba(163,230,53,.07), transparent 65%)',
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/[.07] px-3 py-1 text-xs font-bold text-lime-300 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-lime-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
              </span>
              Poisson &amp; Weka ML Trained
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.03] px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                apiOk ? 'text-slate-200' : 'text-slate-400'
              }`}
            >
              <LiveIcon size={12} aria-hidden="true" />
              {health.loading ? 'Comprobando API…' : apiOk ? 'API operativa' : 'API sin respuesta'}
            </span>
          </div>

          <h1 className="mt-5 max-w-xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Predicción inteligente de LaLiga
          </h1>
          <p className="mt-3 max-w-md text-base text-slate-300">
            1X2, goles, córneres y tarjetas con la probabilidad a la vista y el modelo auditado.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/predict" className="btn-primary !px-5">
              <SparkIcon size={18} />
              Predecir un partido
            </Link>
            <Link to="/betting" className="btn-ghost !px-5">
              Apuestas demo
              <ArrowIcon size={16} />
            </Link>
          </div>

          <ul
            className="mt-8 grid grid-cols-2 divide-white/5 border-t border-white/5 sm:grid-cols-4 sm:divide-x"
            aria-label="Precisión del modelo"
          >
            {modelReport.loading &&
              [0, 1, 2, 3].map((i) => (
                <li key={i} className="py-4 sm:px-4 sm:first:pl-0">
                  <Skeleton className="h-12" />
                </li>
              ))}
            {!modelReport.loading &&
              results.map((result) => {
                const good = beatsBaseline(result)
                const delta = formatDelta(result)
                return (
                  <li
                    key={result.target}
                    className="flex flex-col gap-1 border-b border-white/5 py-4 pr-3 sm:border-b-0 sm:px-4 sm:first:pl-0 sm:last:pr-0"
                  >
                    <p className="text-[11px] font-medium text-slate-400">{TARGET_SHORT[result.target] ?? result.target}</p>
                    <p className="num text-2xl leading-none text-white">
                      <Flash value={formatMetric(result)} className="-mx-1">
                        {formatMetric(result)}
                      </Flash>
                    </p>
                    <p className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500">
                      <span className="font-mono tracking-wide">{result.metricName}</span>
                      {delta && good !== null && (
                        <span
                          className={`num inline-flex items-center gap-0.5 normal-case ${good ? 'text-lime-400' : 'text-amber-300'}`}
                        >
                          {good ? (
                            <TrendUpIcon size={12} aria-label="mejor que el modelo trivial" />
                          ) : (
                            <TrendDownIcon size={12} aria-label="peor que el modelo trivial" />
                          )}
                          {delta}
                        </span>
                      )}
                    </p>
                  </li>
                )
              })}
            {!modelReport.loading && results.length === 0 && (
              <li className="col-span-full pt-4 text-sm text-slate-400">
                Modelo sin entrenar: cárgalo desde Administración.
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* Próximos partidos */}
      <Tile index={1} className="lg:col-span-4" title="Próximos partidos" icon={<SparkIcon size={16} />} to="/calendar" action="Calendario">
        <NextMatches fixtures={upcoming} loading={fixtures.loading} error={fixtures.error} reload={fixtures.reload} />
      </Tile>

      {/* Clasificación */}
      <Tile index={2} className="lg:col-span-5" title="Clasificación" icon={<TrophyIcon size={16} />} to="/ranking" action="Tabla completa">
        {ranking.loading && (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        )}
        {!ranking.loading && ranking.error && <ErrorAlert message={ranking.error} onRetry={ranking.reload} />}
        {!ranking.loading && !ranking.error && topTeams.length === 0 && (
          <p className="text-sm text-slate-400">Sin datos de clasificación todavía.</p>
        )}
        {topTeams.length > 0 && (
          <table className="w-full text-sm">
            <caption className="sr-only">Cinco primeros de LaLiga</caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="pb-1.5 text-left font-semibold">Equipo</th>
                <th scope="col" className="pb-1.5 text-right font-semibold">PJ</th>
                <th scope="col" className="pb-1.5 text-right font-semibold">DG</th>
                <th scope="col" className="pb-1.5 text-right font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {topTeams.map((entry) => (
                <tr key={entry.teamId} className="border-t border-white/5 transition-colors hover:bg-white/[.03]">
                  <td className="py-2">
                    <Link
                      to={`/teams?q=${encodeURIComponent(entry.teamName)}`}
                      className="flex min-h-[32px] items-center gap-2.5 font-semibold text-white hover:text-sky-300"
                    >
                      <span
                        className={`num w-4 text-center text-xs ${entry.position === 1 ? 'text-sky-400' : 'text-slate-500'}`}
                      >
                        {entry.position}
                      </span>
                      <Crest name={entry.teamName} size="sm" />
                      <span className="truncate">{entry.teamName}</span>
                    </Link>
                  </td>
                  <td className="num py-2 text-right text-slate-300">{entry.matchesPlayed}</td>
                  <td className="num py-2 text-right text-slate-300">
                    {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                  </td>
                  <td className="num py-2 text-right font-bold text-white">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tile>

      {/* Equipos: escudos sobre la propia superficie, sin caja por equipo */}
      <Tile index={3} className="lg:col-span-4" title="Equipos" icon={<TeamsIcon size={16} />} to="/teams" action="Ver todos">
        {ranking.loading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : ranking.error ? (
          <ErrorAlert message={ranking.error} onRetry={ranking.reload} />
        ) : teamGrid.length === 0 ? (
          <p className="text-sm text-slate-400">Sin equipos cargados.</p>
        ) : (
          <ul className="-mx-1 grid grid-cols-4 gap-x-1 gap-y-1">
            {teamGrid.map((entry) => (
              <li key={entry.teamId}>
                <Link
                  to={`/teams?q=${encodeURIComponent(entry.teamName)}`}
                  className="flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-xl p-2 transition duration-150 hover:bg-white/[.05]"
                >
                  <Crest name={entry.teamName} />
                  <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-slate-300">
                    {entry.teamName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Tile>

      {/* Calidad del modelo */}
      <Tile index={4} className="lg:col-span-3" title="Modelo de IA" icon={<ModelIcon size={16} />}>
        {modelReport.loading && <Skeleton className="h-32" />}
        {!modelReport.loading && modelReport.error && (
          <ErrorAlert message={modelReport.error} onRetry={modelReport.reload} />
        )}
        {!modelReport.loading && !modelReport.error && !modelReport.data && (
          <p className="text-sm text-slate-400">Sin entrenar todavía. Carga los datos desde Administración.</p>
        )}
        {results.length > 0 && (
          <ul className="divide-y divide-white/5">
            {results.map((result) => {
              const good = beatsBaseline(result)
              return (
                <li key={result.target} className="flex items-center justify-between gap-2 py-2.5 text-sm first:pt-1">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${good ? 'bg-lime-400' : 'bg-amber-400'}`}
                    />
                    {TARGET_SHORT[result.target] ?? result.target}
                  </span>
                  <span className={`text-xs font-semibold ${good ? 'text-lime-300' : 'text-amber-300'}`}>
                    {good ? 'Supera al trivial' : 'No supera al trivial'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Tile>

      {modelReport.data && (
        <details className="group card animate-rise p-4 [animation-delay:350ms] lg:col-span-12">
          <summary className="flex min-h-[44px] cursor-pointer items-center justify-between font-display text-[13px] font-bold text-white">
            Informe completo de validación
            <span className="text-xs font-semibold text-slate-400 group-open:hidden">Mostrar</span>
            <span className="hidden text-xs font-semibold text-slate-400 group-open:inline">Ocultar</span>
          </summary>
          <div className="mt-3">
            <ModelReportCard report={modelReport.data} />
          </div>
        </details>
      )}
    </div>
  )
}
