import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'
import type { ReactNode } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import type { PredictionResponseDto } from '../types'
import { describeOutcome } from '../lib/format'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Title, Tooltip)

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#cbd5e1', boxWidth: 12, padding: 16 },
    },
  },
}

const barOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
    },
  },
}

interface ChartCardProps {
  title: string
  badge?: string
  children: ReactNode
}

function ChartCard({ title, badge, children }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300">{title}</h3>
        {badge && (
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300">{badge}</span>
        )}
      </div>
      <div className="h-56">{children}</div>
    </div>
  )
}

interface PredictionChartsProps {
  prediction: PredictionResponseDto
}

export default function PredictionCharts({ prediction }: PredictionChartsProps) {
  const resultData = {
    labels: ['Victoria local', 'Empate', 'Victoria visitante'],
    datasets: [
      {
        data: [
          prediction.homeWinProbability,
          prediction.drawProbability,
          prediction.awayWinProbability,
        ],
        backgroundColor: ['rgba(56, 189, 248, 0.85)', 'rgba(148, 163, 184, 0.85)', 'rgba(167, 139, 250, 0.85)'],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  }

  const goalsData = {
    labels: ['Local', 'Visitante'],
    datasets: [
      {
        label: 'Goles esperados',
        data: [prediction.expectedHomeGoals, prediction.expectedAwayGoals],
        backgroundColor: ['rgba(56, 189, 248, 0.85)', 'rgba(167, 139, 250, 0.85)'],
        borderRadius: 6,
      },
    ],
  }

  const cornersData = {
    labels: ['Esperado', 'Línea 9.5'],
    datasets: [
      {
        label: 'Córneres',
        data: [prediction.expectedCorners, 9.5],
        backgroundColor: ['rgba(56, 189, 248, 0.85)', 'rgba(148, 163, 184, 0.35)'],
        borderRadius: 6,
      },
    ],
  }

  const cardsData = {
    labels: ['Esperado', 'Línea 4.5'],
    datasets: [
      {
        label: 'Tarjetas',
        data: [prediction.expectedCards, 4.5],
        backgroundColor: ['rgba(251, 191, 36, 0.85)', 'rgba(148, 163, 184, 0.35)'],
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartCard title="Probabilidad de resultado" badge={describeOutcome(prediction.predictedOutcome)}>
        <Doughnut data={resultData} options={doughnutOptions} />
      </ChartCard>
      <ChartCard title="Goles esperados" badge={describeOutcome(prediction.goalsOutcome)}>
        <Bar data={goalsData} options={barOptions} />
      </ChartCard>
      <ChartCard title="Córneres" badge={describeOutcome(prediction.cornersOutcome)}>
        <Bar data={cornersData} options={barOptions} />
      </ChartCard>
      <ChartCard title="Tarjetas" badge={describeOutcome(prediction.cardsOutcome)}>
        <Bar data={cardsData} options={barOptions} />
      </ChartCard>
    </div>
  )
}
