import type { CSSProperties, ReactNode } from 'react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { FixtureDto, TargetResult } from '../types'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import Crest from '../betting/Crest'
import ErrorAlert from '../components/ErrorAlert'
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

/** Tarjeta del bento: aparece con retardo escalonado y se ilumina con un borde naranja al pasar el cursor. */
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
      style={{ animationDelay: `${index * 70}ms` } as CSSProperties}
      className={`group/tile animate-rise rounded-2xl border border-orange-500/15 bg-slate-800 p-4 shadow-card transition duration-200 hover:border-orange-500/40 hover:shadow-glow sm:p-5 ${className}`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">{icon}</span>
          {title}
        </h2>
        {to && action && (
          <Link
            to={to}
            className="flex min-h-[44px] items-center gap-1 text-xs font-bold text-sky-300 transition hover:text-white"
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
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14" />
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
    <ul className="space-y-2">
      {fixtures.map((fixture) => {
        const live = fixture.status === 'LIVE'
        const date = new Date(fixture.utcDate)
        return (
          <li key={fixture.id}>
            <Link
              to="/predict"
              className="flex min-h-[56px] items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900 px-3 transition duration-150 hover:-translate-y-0.5 hover:border-sky-500/60"
            >
              <span className="flex w-12 shrink-0 flex-col items-center text-center">
                {live ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-rose-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-rose-400" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                    </span>
                    Vivo
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-bold tabular-nums text-white">
                      {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                    </span>
                  </>
                )}
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <Crest name={fixture.homeTeam} src={fixture.homeCrest} size="sm" />
                <span className="truncate text-xs font-bold text-white">{fixture.homeTeam}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">vs</span>
              <span className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <span className="truncate text-xs font-bold text-white">{fixture.awayTeam}</span>
                <Crest name={fixture.awayTeam} src={fixture.awayCrest} size="sm" />
              </span>
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
  const ranking = useApi(() => ligalyticsApi.getRanking(), [])
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
      {/* Hero */}
      <section
        className="relative animate-rise overflow-hidden rounded-2xl border border-orange-500/25 p-6 shadow-card sm:p-8 lg:col-span-8"
        style={{
          backgroundImage:
            'radial-gradient(120% 140% at 100% 0%, rgba(255,80,0,.32) 0%, rgba(255,80,0,0) 55%), radial-gradient(90% 100% at 0% 100%, rgba(163,230,53,.10) 0%, rgba(163,230,53,0) 60%), linear-gradient(160deg, #1a252e 0%, #0b1217 100%)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-bold text-lime-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-lime-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
            </span>
            Poisson &amp; Weka ML Trained
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
              apiOk
                ? 'border-slate-600 bg-slate-900/60 text-slate-200'
                : 'border-slate-600 bg-slate-900/60 text-slate-400'
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
          <Link
            to="/betting"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-600 bg-slate-900/50 px-5 text-sm font-bold text-white transition hover:border-sky-500 hover:bg-slate-900"
          >
            Apuestas demo
            <ArrowIcon size={16} />
          </Link>
        </div>

        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Precisión del modelo">
          {modelReport.loading &&
            [0, 1, 2, 3].map((i) => <li key={i} className="h-14 w-28 animate-pulse rounded-xl bg-slate-900/60" />)}
          {!modelReport.loading &&
            results.map((result) => {
              const good = beatsBaseline(result)
              return (
                <li
                  key={result.target}
                  className="min-w-[7rem] rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 transition duration-150 hover:-translate-y-0.5 hover:border-sky-500/60"
                >
                  <p className="text-[11px] font-semibold text-slate-400">{TARGET_SHORT[result.target] ?? result.target}</p>
                  <p className="flex items-center gap-1.5 font-display text-lg font-extrabold tabular-nums text-white">
                    {formatMetric(result)}
                    {good === true && <TrendUpIcon size={14} className="text-lime-400" aria-label="mejor que el modelo trivial" />}
                    {good === false && <TrendDownIcon size={14} className="text-amber-300" aria-label="peor que el modelo trivial" />}
                  </p>
                  <p className="text-[10px] uppercase text-slate-400">{result.metricName}</p>
                </li>
              )
            })}
          {!modelReport.loading && results.length === 0 && (
            <li className="text-sm text-slate-400">Modelo sin entrenar: cárgalo desde Administración.</li>
          )}
        </ul>
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
              <Skeleton key={i} className="h-10" />
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
              <tr className="text-[11px] uppercase text-slate-400">
                <th scope="col" className="pb-1 text-left font-semibold">Equipo</th>
                <th scope="col" className="pb-1 text-right font-semibold">PJ</th>
                <th scope="col" className="pb-1 text-right font-semibold">DG</th>
                <th scope="col" className="pb-1 text-right font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {topTeams.map((entry) => (
                <tr key={entry.teamId} className="border-t border-slate-700/50 transition hover:bg-slate-700/30">
                  <td className="py-2">
                    <Link
                      to={`/teams?q=${encodeURIComponent(entry.teamName)}`}
                      className="flex min-h-[32px] items-center gap-2.5 font-semibold text-white hover:text-sky-300"
                    >
                      <span className="w-4 text-center text-xs font-bold tabular-nums text-slate-400">{entry.position}</span>
                      <Crest name={entry.teamName} size="sm" />
                      <span className="truncate">{entry.teamName}</span>
                    </Link>
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-300">{entry.matchesPlayed}</td>
                  <td className="py-2 text-right tabular-nums text-slate-300">
                    {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                  </td>
                  <td className="py-2 text-right font-display font-extrabold tabular-nums text-white">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tile>

      {/* Equipos */}
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
          <ul className="grid grid-cols-4 gap-2">
            {teamGrid.map((entry) => (
              <li key={entry.teamId}>
                <Link
                  to={`/teams?q=${encodeURIComponent(entry.teamName)}`}
                  className="flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900 p-2 transition duration-150 hover:scale-[1.03] hover:border-sky-500/60"
                >
                  <Crest name={entry.teamName} />
                  <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-slate-200">
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
          <ul className="space-y-2">
            {results.map((result) => {
              const good = beatsBaseline(result)
              return (
                <li key={result.target} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-300">{TARGET_SHORT[result.target] ?? result.target}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      good ? 'bg-lime-400/15 text-lime-300' : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    {good ? 'Supera al trivial' : 'No supera al trivial'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Tile>

      {modelReport.data && (
        <details className="group animate-rise rounded-2xl border border-slate-700/60 bg-slate-800 p-4 [animation-delay:350ms] lg:col-span-12">
          <summary className="flex min-h-[44px] cursor-pointer items-center justify-between font-display text-sm font-bold text-white">
            Informe completo de validación
            <span className="text-xs font-semibold text-sky-300 group-open:hidden">Mostrar</span>
            <span className="hidden text-xs font-semibold text-sky-300 group-open:inline">Ocultar</span>
          </summary>
          <div className="mt-3">
            <ModelReportCard report={modelReport.data} />
          </div>
        </details>
      )}
    </div>
  )
}
