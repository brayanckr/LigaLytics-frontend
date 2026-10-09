import type { TargetResult, TrainingReport } from '../types'
import { formatDate } from '../lib/format'

const TARGET_LABELS: Record<string, string> = {
  resultado: 'Resultado (1X2)',
  goles: 'Goles totales',
  corneres: 'Córneres totales',
  tarjetas: 'Tarjetas totales',
}

function formatMetric(result: TargetResult, value: number | null): string {
  if (value === null || value === undefined) {
    return '—'
  }
  return result.metricName === 'accuracy' ? `${(value * 100).toFixed(1)}%` : value.toFixed(2)
}

/** Indica si el modelo mejora al modelo trivial (clase mayoritaria / media). */
function improvement(result: TargetResult): { label: string; good: boolean } | null {
  if (result.metric === null || result.baseline === null) {
    return null
  }
  const better =
    result.metricName === 'accuracy' ? result.metric > result.baseline : result.metric < result.baseline
  const diff = Math.abs(result.metric - result.baseline)
  const text = result.metricName === 'accuracy' ? `${(diff * 100).toFixed(1)} pts` : diff.toFixed(2)
  return { label: `${better ? '▲ mejor' : '▼ peor'} que el modelo trivial (${text})`, good: better }
}

/** Muestra las métricas de validación del modelo de IA (accuracy / MAE). */
export default function ModelReportCard({ report }: { report: TrainingReport }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400">
        <p>{report.evaluation}</p>
        <p className="mt-1 text-xs">
          {report.matchCount} partidos con marcador · entrenado el {formatDate(report.trainedAt)}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">Predicción</th>
              <th className="px-4 py-2 text-left">Algoritmo</th>
              <th className="px-4 py-2 text-center">Métrica</th>
              <th className="px-4 py-2 text-center">Modelo</th>
              <th className="px-4 py-2 text-center">Trivial</th>
              <th className="px-4 py-2 text-left">Comparación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {report.results.map((result) => {
              const comparison = improvement(result)
              return (
                <tr key={result.target} className="hover:bg-slate-800/40">
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-white">
                    {TARGET_LABELS[result.target] ?? result.target}
                  </td>
                  <td className="px-4 py-2 text-slate-300">{result.algorithm}</td>
                  <td className="px-4 py-2 text-center text-slate-300">{result.metricName}</td>
                  <td className="px-4 py-2 text-center font-semibold text-sky-300">
                    {result.trained ? formatMetric(result, result.metric) : '—'}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-400">{formatMetric(result, result.baseline)}</td>
                  <td className="px-4 py-2 text-xs">
                    {result.trained && comparison ? (
                      <span className={comparison.good ? 'text-emerald-300' : 'text-amber-300'}>
                        {comparison.label}
                      </span>
                    ) : (
                      <span className="text-rose-300">{result.message}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Accuracy: porcentaje de resultados acertados (más alto es mejor). MAE: error absoluto medio en goles,
        córneres o tarjetas por partido (más bajo es mejor). «Trivial» es predecir siempre la clase más frecuente
        o la media del entrenamiento.
      </p>
    </div>
  )
}
