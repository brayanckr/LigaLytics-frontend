import { Link } from 'react-router-dom'
import { ligalyticsApi } from '../api/ligalyticsApi'
import { useApi } from '../hooks/useApi'
import ErrorAlert from '../components/ErrorAlert'
import ModelReportCard from '../components/ModelReportCard'
import { SkeletonRows } from '../components/Skeleton'

const QUICK_LINKS = [
  {
    to: '/teams',
    title: 'Equipos',
    description: 'Explora y busca los equipos de LaLiga con sus estadísticas.',
  },
  {
    to: '/predict',
    title: 'Predicciones',
    description: 'Genera predicciones con gráficos de probabilidad, goles, córneres y tarjetas.',
  },
  {
    to: '/ranking',
    title: 'Clasificación',
    description: 'Consulta la tabla de posiciones y el rendimiento de cada equipo.',
  },
]

export default function DashboardPage() {
  const health = useApi(() => ligalyticsApi.getHealth(), [])
  const ranking = useApi(() => ligalyticsApi.getRanking(), [])
  const modelReport = useApi(() => ligalyticsApi.getModelReport(), [])
  const topTeams = (ranking.data ?? []).slice(0, 5)

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/70 to-slate-900 p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-400">LigaLytics</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Predicción inteligente de LaLiga</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Resultados, goles, córneres y tarjetas estimados a partir de datos históricos y modelos de
          machine learning (Weka) y estadística (Poisson), validados con la temporada 2023-24.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-xl border border-slate-800 bg-slate-800/40 p-5 transition hover:-translate-y-0.5 hover:border-sky-500/50 hover:bg-slate-800"
          >
            <h2 className="font-semibold text-white">{link.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{link.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Estado del backend</h2>
          {health.loading && <p className="text-sm text-slate-400">Comprobando…</p>}
          {!health.loading && health.error && <ErrorAlert message={health.error} onRetry={health.reload} />}
          {!health.loading && !health.error && health.data && (
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p className="text-sm text-slate-300">
                Backend <strong className="text-white">{health.data.status}</strong> · {health.data.service}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Líderes de la tabla</h2>
          {ranking.loading && <SkeletonRows rows={5} columns={3} />}
          {!ranking.loading && ranking.error && <ErrorAlert message={ranking.error} onRetry={ranking.reload} />}
          {!ranking.loading && !ranking.error && topTeams.length === 0 && (
            <p className="text-sm text-slate-400">Sin datos de clasificación todavía.</p>
          )}
          {!ranking.loading && !ranking.error && topTeams.length > 0 && (
            <ol className="space-y-2">
              {topTeams.map((entry) => (
                <li key={entry.teamId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-3 text-slate-200">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-xs font-bold text-sky-300">
                      {entry.position}
                    </span>
                    {entry.teamName}
                  </span>
                  <span className="font-semibold text-white">{entry.points} pts</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Calidad del modelo de IA</h2>
        {modelReport.loading && <p className="text-sm text-slate-400">Cargando métricas…</p>}
        {!modelReport.loading && modelReport.error && (
          <ErrorAlert message={modelReport.error} onRetry={modelReport.reload} />
        )}
        {!modelReport.loading && !modelReport.error && !modelReport.data && (
          <p className="text-sm text-slate-400">
            El modelo todavía no se ha entrenado. Carga los datos desde el panel de administración.
          </p>
        )}
        {!modelReport.loading && !modelReport.error && modelReport.data && (
          <ModelReportCard report={modelReport.data} />
        )}
      </div>
    </section>
  )
}
