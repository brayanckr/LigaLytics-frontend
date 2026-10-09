import { useState } from 'react'
import type { EtlSeasonResult, TrainingReport } from '../types'
import { adminKeyStore, ligalyticsApi } from '../api/ligalyticsApi'
import { extractApiError } from '../api/axiosClient'
import { useApi } from '../hooks/useApi'
import { formatDate } from '../lib/format'
import ErrorAlert from '../components/ErrorAlert'
import ModelReportCard from '../components/ModelReportCard'
import Spinner from '../components/Spinner'

type TaskId = 'football-data' | 'understat' | 'transfermarkt' | 'train' | 'current-season'

interface TaskOutcome {
  results?: EtlSeasonResult[]
  report?: TrainingReport
  error?: string
}

const TASKS: { id: TaskId; title: string; description: string }[] = [
  {
    id: 'current-season',
    title: 'Actualizar la temporada actual',
    description: 'Guarda los partidos ya jugados de esta temporada (football-data.org). Se hace solo cada 6 horas.',
  },
  {
    id: 'football-data',
    title: 'Cargar partidos (football-data.co.uk)',
    description: 'Descarga las 6 temporadas 2018-19 a 2023-24: goles, córneres y tarjetas. Es idempotente.',
  },
  {
    id: 'understat',
    title: 'Cargar xG (Understat)',
    description: 'Añade el xG de cada partido. Requiere haber cargado antes los partidos.',
  },
  {
    id: 'transfermarkt',
    title: 'Cargar valor de plantillas (Transfermarkt)',
    description: 'Actualiza el valor de mercado de cada equipo.',
  },
  {
    id: 'train',
    title: 'Reentrenar el modelo de IA',
    description: 'Entrena con 2018-2023, mide en 2023-24 (accuracy y MAE) y guarda los modelos.',
  },
]

function ResultList({ results }: { results: EtlSeasonResult[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {results.map((result) => (
        <li key={result.season} className="flex flex-wrap items-center gap-2">
          <span className={result.success ? 'text-emerald-300' : 'text-rose-300'}>{result.success ? '✔' : '✘'}</span>
          <span className="font-medium text-slate-200">{result.season}</span>
          <span className="text-slate-400">
            {result.success && result.summary
              ? `${result.summary.created} nuevos · ${result.summary.updated} actualizados · ${result.summary.skipped} omitidos`
              : result.error}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(adminKeyStore.get())
  const [running, setRunning] = useState<TaskId | null>(null)
  const [outcomes, setOutcomes] = useState<Partial<Record<TaskId, TaskOutcome>>>({})

  const status = useApi(() => ligalyticsApi.getDataStatus(), [adminKey])
  const report = useApi(() => ligalyticsApi.getModelReport(), [])
  const history = useApi(() => ligalyticsApi.getPredictionHistory(), [])

  const saveKey = (value: string) => {
    setAdminKey(value)
    adminKeyStore.set(value)
  }

  const run = async (id: TaskId) => {
    setRunning(id)
    try {
      let outcome: TaskOutcome
      if (id === 'football-data') {
        outcome = { results: await ligalyticsApi.loadFootballData() }
      } else if (id === 'understat') {
        outcome = { results: await ligalyticsApi.loadUnderstat() }
      } else if (id === 'current-season') {
        const summary = await ligalyticsApi.syncCurrentSeason()
        outcome = { results: [{ season: 'temporada actual', success: true, summary, error: null }] }
      } else if (id === 'transfermarkt') {
        outcome = { results: [await ligalyticsApi.loadTransfermarkt()] }
      } else {
        outcome = { report: await ligalyticsApi.trainModel() }
      }
      setOutcomes((current) => ({ ...current, [id]: outcome }))
    } catch (cause) {
      setOutcomes((current) => ({ ...current, [id]: { error: extractApiError(cause) } }))
    } finally {
      setRunning(null)
      status.reload()
      report.reload()
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
        <p className="text-sm text-slate-400">
          Fuerza la actualización de datos desde las fuentes externas y reentrena el modelo de IA.
        </p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <label className="flex flex-col gap-2 sm:max-w-md">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Clave de administración (X-Admin-Key)
          </span>
          <input
            type="password"
            value={adminKey}
            onChange={(event) => saveKey(event.target.value)}
            placeholder="Déjala vacía si el backend no exige clave"
            autoComplete="off"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500"
          />
        </label>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Datos cargados</h2>
        {status.loading && <Spinner label="Consultando la base de datos…" />}
        {!status.loading && status.error && <ErrorAlert message={status.error} onRetry={status.reload} />}
        {!status.loading && !status.error && status.data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Equipos" value={String(status.data.teams)} />
            <Metric label="Partidos" value={String(status.data.matches)} />
            <Metric label="Primer partido" value={formatDate(status.data.firstMatch)} />
            <Metric label="Último partido" value={formatDate(status.data.lastMatch)} />
          </div>
        )}
        {!status.loading && !status.error && status.data && status.data.matches === 0 && (
          <p className="mt-3 text-sm text-amber-300">
            La base de datos está vacía. Pulsa «Cargar partidos» para descargar los datos reales.
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <div>
          <h3 className="font-semibold text-white">Subir CSV de football-data (descargados a mano)</h3>
          <p className="text-sm text-slate-400">
            Elige uno o varios archivos SP1.csv. La temporada se detecta por las fechas y es idempotente.
          </p>
        </div>
        <input
          type="file"
          accept=".csv"
          multiple
          disabled={running !== null}
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length === 0) {
              return
            }
            setRunning('football-data')
            try {
              const results = await ligalyticsApi.uploadFootballData(files)
              setOutcomes((current) => ({ ...current, 'football-data': { results } }))
            } catch (cause) {
              setOutcomes((current) => ({ ...current, 'football-data': { error: extractApiError(cause) } }))
            } finally {
              setRunning(null)
              status.reload()
              report.reload()
              event.target.value = ''
            }
          }}
          className="block text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-sky-400"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <div>
          <h3 className="font-semibold text-white">Subir páginas de Understat (HTML guardado a mano)</h3>
          <p className="text-sm text-slate-400">
            Guarda understat.com/league/La_liga/AÑO como «solo HTML» y súbelas (una por temporada). Añade el xG a los
            partidos ya cargados.
          </p>
        </div>
        <input
          type="file"
          accept=".html,.htm"
          multiple
          disabled={running !== null}
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length === 0) {
              return
            }
            setRunning('understat')
            try {
              const results = await ligalyticsApi.uploadUnderstat(files)
              setOutcomes((current) => ({ ...current, understat: { results } }))
            } catch (cause) {
              setOutcomes((current) => ({ ...current, understat: { error: extractApiError(cause) } }))
            } finally {
              setRunning(null)
              status.reload()
              event.target.value = ''
            }
          }}
          className="block text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-sky-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {TASKS.map((task) => {
          const outcome = outcomes[task.id]
          return (
            <div key={task.id} className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/40 p-5">
              <div>
                <h3 className="font-semibold text-white">{task.title}</h3>
                <p className="text-sm text-slate-400">{task.description}</p>
              </div>
              <button
                type="button"
                onClick={() => run(task.id)}
                disabled={running !== null}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {running === task.id ? 'En curso… (puede tardar)' : 'Ejecutar'}
              </button>
              {outcome?.error && <ErrorAlert message={outcome.error} />}
              {outcome?.results && <ResultList results={outcome.results} />}
              {outcome?.report && (
                <p className="text-sm text-emerald-300">
                  Modelo entrenado: {outcome.report.results.filter((result) => result.trained).length} de {outcome.report.results.length} operativos.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Calidad del modelo de IA
        </h2>
        {report.loading && <Spinner label="Cargando métricas…" />}
        {!report.loading && report.error && <ErrorAlert message={report.error} onRetry={report.reload} />}
        {!report.loading && !report.error && !report.data && (
          <p className="text-sm text-slate-400">Todavía no se ha entrenado el modelo.</p>
        )}
        {!report.loading && !report.error && report.data && <ModelReportCard report={report.data} />}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Últimas predicciones guardadas
        </h2>
        {history.loading && <Spinner label="Cargando historial…" />}
        {!history.loading && history.data && history.data.length === 0 && (
          <p className="text-sm text-slate-400">Aún no se ha generado ninguna predicción.</p>
        )}
        {!history.loading && history.data && history.data.length > 0 && (
          <ul className="divide-y divide-slate-800 text-sm">
            {history.data.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-slate-200">
                  {item.homeTeam} vs {item.awayTeam}
                </span>
                <span className="text-slate-400">
                  {item.predictedOutcome} · {formatDate(item.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
