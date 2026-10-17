import { teamInitials } from '../components/TeamCard'

/** Escudo provisional: iniciales del equipo (la API no entrega logos). */
export default function Crest({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-16 w-16 text-lg' : 'h-8 w-8 text-[11px]'
  return (
    <span
      aria-hidden="true"
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-700 font-extrabold text-white`}
    >
      {teamInitials(name)}
    </span>
  )
}
