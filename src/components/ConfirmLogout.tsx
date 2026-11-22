import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LogOutIcon } from './icons'

interface DialogProps {
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Diálogo modal que pide confirmar antes de cerrar la sesión. Esc o clic fuera lo cancelan. */
function ConfirmLogoutDialog({ busy, onConfirm, onCancel }: DialogProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-card"
      >
        <h2 id="logout-title" className="text-xl font-bold text-white">
          ¿Cerrar sesión?
        </h2>
        <p id="logout-desc" className="mt-2 text-sm text-slate-400">
          Tendrás que iniciar sesión de nuevo para volver a acceder a tu cuenta.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            disabled={busy}
            onClick={onCancel}
            className="min-h-[44px] rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-rose-500/50 bg-rose-500/20 px-4 text-sm font-bold text-rose-100 transition hover:bg-rose-500/30 disabled:opacity-50"
          >
            <LogOutIcon /> Sí, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook para cerrar sesión con confirmación. Devuelve `requestLogout` (para el onClick del botón) y
 * `dialog` (el nodo que debe renderizarse en el componente).
 */
export function useConfirmLogout(redirectTo?: string): { requestLogout: () => void; dialog: ReactNode } {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const cancel = useCallback(() => setOpen(false), [])

  const confirm = async () => {
    setBusy(true)
    try {
      await logout()
      if (redirectTo) navigate(redirectTo, { replace: true })
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  return {
    requestLogout: () => setOpen(true),
    dialog: open ? <ConfirmLogoutDialog busy={busy} onConfirm={() => void confirm()} onCancel={cancel} /> : null,
  }
}
