import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { extractApiError } from '../api/axiosClient'
import { useAuth } from '../auth/AuthContext'
import ErrorAlert from '../components/ErrorAlert'

/** Inicio de sesión y registro de la demostración de apuestas (saldo ficticio). */
export default function LoginPage() {
  const { account, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (account) {
    return <Navigate to="/betting" replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, displayName, password)
      }
      navigate('/betting', { replace: true })
    } catch (cause) {
      setError(extractApiError(cause))
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500'

  return (
    <section className="mx-auto max-w-md space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-white">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className="text-sm text-slate-400">
          Cuenta de la demostración de apuestas. Cada cuenta nueva recibe{' '}
          <strong className="text-amber-300">100.000 COP ficticios</strong>.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-800/40 p-5">
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Correo
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </label>
        {mode === 'register' && (
          <label className="flex flex-col gap-1.5 text-sm text-slate-300">
            Nombre
            <input
              type="text"
              required
              minLength={2}
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={input}
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Contraseña {mode === 'register' && <span className="text-xs text-slate-500">(mínimo 8 caracteres)</span>}
          <input
            type="password"
            required
            minLength={mode === 'register' ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className={input}
          />
        </label>

        {error && <ErrorAlert message={error} />}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {busy ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
          className="w-full text-center text-sm text-sky-300 hover:underline"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </form>

      <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
        Es una demostración educativa: no uses una contraseña que ya utilices en otros sitios, no hay recuperación de
        contraseña ni verificación de correo, y no se maneja dinero real.
      </p>
    </section>
  )
}
