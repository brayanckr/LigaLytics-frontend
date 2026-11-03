import { useEffect } from 'react'

interface ToastProps {
  /** Cambia en cada aviso nuevo para reiniciar el temporizador y la animación. */
  id: number
  message: string
  onClose: () => void
  duration?: number
}

/** Aviso flotante de error: se cierra solo, con la X o con Escape. */
export default function Toast({ id, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [id, duration, onClose])

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-center sm:left-auto sm:right-6 sm:top-6 sm:justify-end">
      <div
        key={id}
        role="alert"
        aria-live="assertive"
        className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-500/40 bg-slate-900/95 shadow-[0_24px_60px_-12px_rgba(0,0,0,.9),0_0_0_1px_rgba(244,63,94,.15)] backdrop-blur motion-safe:animate-toast-in"
      >
        <div className="flex items-start gap-3 p-4 pr-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5.5M12 16.5h.01" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">No se pudo continuar</p>
            <p className="mt-0.5 text-sm text-slate-300">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-slate-700/60 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div
          className="h-1 origin-left bg-gradient-to-r from-rose-500 to-sky-500 motion-safe:animate-toast-timer"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
}
