import { useState } from 'react'
import { teamInitials } from '../components/TeamCard'

const SIZES = {
  sm: 'h-6 w-6 text-[9px]',
  md: 'h-8 w-8 text-[11px]',
  lg: 'h-16 w-16 text-lg',
} as const

interface CrestProps {
  name: string
  size?: keyof typeof SIZES
  /** URL del escudo oficial cuando la API lo entrega; si falta o falla se muestran las iniciales. */
  src?: string | null
}

/** Escudo del equipo: imagen oficial si existe y, si no, un avatar con las iniciales. */
export default function Crest({ name, size = 'md', src = null }: CrestProps) {
  const [failed, setFailed] = useState(false)
  const box = `flex ${SIZES[size]} shrink-0 items-center justify-center rounded-full`

  if (src && !failed) {
    return (
      <span aria-hidden="true" className={`${box} bg-white/95 p-1`}>
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      </span>
    )
  }
  return (
    <span aria-hidden="true" className={`${box} border border-slate-600 bg-slate-700 font-extrabold text-white`}>
      {teamInitials(name)}
    </span>
  )
}
