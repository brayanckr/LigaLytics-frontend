import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface FlashProps {
  /** Valor que se muestra; cada vez que cambia se dispara el destello. */
  value: string | number | null
  className?: string
  children: ReactNode
}

/** Resalta con un destello (`animate-flash`) el dato que acaba de cambiar; el primer valor se pinta sin destello. */
export default function Flash({ value, className = '', children }: FlashProps) {
  const previous = useRef(value)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value
      setPulse((count) => count + 1)
    }
  }, [value])

  // Cambiar la `key` remonta el nodo y reinicia la animación aunque dos cambios lleguen seguidos.
  return (
    <span key={pulse} className={`inline-block rounded-md px-1 tabular-nums ${pulse > 0 ? 'animate-flash' : ''} ${className}`}>
      {children}
    </span>
  )
}
