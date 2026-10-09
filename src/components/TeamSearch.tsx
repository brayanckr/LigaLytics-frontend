import { useEffect, useMemo, useRef, useState } from 'react'
import type { TeamDto } from '../types'
import { teamInitials } from './TeamCard'

interface TeamSearchProps {
  teams: TeamDto[]
  onSelect: (team: TeamDto) => void
  onQueryChange?: (query: string) => void
  placeholder?: string
}

/** Quita tildes y pasa a minúsculas para comparar sin importar acentos. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Buscador de equipos con autocompletado: sugiere mientras se escribe
 * (prioriza los nombres que empiezan por el texto) y se maneja con teclado
 * (flechas, Enter y Escape).
 */
export default function TeamSearch({
  teams,
  onSelect,
  onQueryChange,
  placeholder = 'Buscar equipo…',
}: TeamSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const container = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    const text = normalize(query.trim())
    if (!text) {
      return []
    }
    const starts: TeamDto[] = []
    const contains: TeamDto[] = []
    for (const team of teams) {
      const name = normalize(team.name)
      if (name.startsWith(text)) {
        starts.push(team)
      } else if (name.includes(text)) {
        contains.push(team)
      }
    }
    return [...starts, ...contains].slice(0, 6)
  }, [teams, query])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const choose = (team: TeamDto) => {
    setQuery(team.name)
    setOpen(false)
    onQueryChange?.(team.name)
    onSelect(team)
  }

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && open && suggestions[active]) {
      event.preventDefault()
      choose(suggestions[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={container} className="relative w-full">
      <input
        type="search"
        value={query}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        aria-controls="team-suggestions"
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
          onQueryChange?.(event.target.value)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500"
      />

      {open && suggestions.length > 0 && (
        <ul
          id="team-suggestions"
          role="listbox"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl"
        >
          {suggestions.map((team, index) => (
            <li key={team.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(team)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                  index === active ? 'bg-sky-500/15 text-sky-200' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-bold text-sky-300">
                  {teamInitials(team.name)}
                </span>
                <span className="truncate">{team.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
