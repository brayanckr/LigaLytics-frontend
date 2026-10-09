import type { PredictionResponseDto } from '../types'
import { describeOutcome } from '../lib/format'

const STRATEGY_LABELS: Record<string, string> = {
  resultado: 'Resultado',
  goles: 'Goles',
  corneres: 'Córneres',
  tarjetas: 'Tarjetas',
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-800/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

/** Detalle numérico de la predicción y algoritmo que produjo cada valor (explicabilidad). */
export default function PredictionDetails({ prediction }: { prediction: PredictionResponseDto }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-800/40 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Detalle de la predicción</h2>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm">
        <p className="text-slate-300">
          Ganador según{' '}
          <strong className="text-sky-300">
            {prediction.winnerSource === 'football-charts' ? 'Football Charts (modelo Dixon-Coles)' : 'el modelo propio'}
          </strong>
        </p>
        {prediction.winnerSource === 'football-charts' && (
          <p className="mt-1 text-xs text-slate-400">
            Modelo propio (comparación): local {Math.round(prediction.ownHomeWinProbability * 100)}% · empate{' '}
            {Math.round(prediction.ownDrawProbability * 100)}% · visitante{' '}
            {Math.round(prediction.ownAwayWinProbability * 100)}%
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Marcador más probable"
          value={prediction.mostLikelyScore}
          hint={`${prediction.expectedHomeGoals.toFixed(2)} - ${prediction.expectedAwayGoals.toFixed(2)} goles esperados`}
        />
        <Stat
          label="Córneres totales"
          value={prediction.expectedCorners.toFixed(1)}
          hint={describeOutcome(prediction.cornersOutcome)}
        />
        <Stat
          label="Tarjetas totales"
          value={prediction.expectedCards.toFixed(1)}
          hint={describeOutcome(prediction.cardsOutcome)}
        />
        <Stat label="Goles" value={describeOutcome(prediction.goalsOutcome)} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">Tarjetas esperadas</th>
              <th className="px-4 py-2 text-center">Amarillas</th>
              <th className="px-4 py-2 text-center">Rojas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="px-4 py-2 text-slate-200">{prediction.homeTeam} (local)</td>
              <td className="px-4 py-2 text-center text-amber-300">{prediction.expectedHomeYellowCards.toFixed(2)}</td>
              <td className="px-4 py-2 text-center text-rose-300">{prediction.expectedHomeRedCards.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-slate-200">{prediction.awayTeam} (visitante)</td>
              <td className="px-4 py-2 text-center text-amber-300">{prediction.expectedAwayYellowCards.toFixed(2)}</td>
              <td className="px-4 py-2 text-center text-rose-300">{prediction.expectedAwayRedCards.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span>Algoritmos:</span>
        {Object.entries(prediction.strategies).map(([target, name]) => (
          <span key={target} className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-slate-300">
            {STRATEGY_LABELS[target] ?? target}: {name}
          </span>
        ))}
        {prediction.dataSeason && <span>· datos hasta la temporada {prediction.dataSeason}</span>}
      </div>
    </div>
  )
}
