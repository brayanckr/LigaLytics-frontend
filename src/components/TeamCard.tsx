import type { TeamDto } from '../types'
import { formatMarketValue } from '../lib/format'

interface TeamCardProps {
  team: TeamDto
  onSelect: (team: TeamDto) => void
}

export function teamInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export default function TeamCard({ team, onSelect }: TeamCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(team)}
      className="group flex h-full flex-col items-start gap-4 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-sky-500/50 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <div className="flex w-full items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sm font-bold text-sky-300">
          {teamInitials(team.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white group-hover:text-sky-200">{team.name}</p>
          <p className="truncate text-xs text-slate-400">{team.stadium ?? 'Estadio desconocido'}</p>
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Valor de plantilla:{' '}
        <span className="font-medium text-slate-200">{formatMarketValue(team.marketValue)}</span>
      </div>
    </button>
  )
}
