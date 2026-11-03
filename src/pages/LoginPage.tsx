import { useCallback, useId, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SessionNotStoredError, useAuth } from '../auth/AuthContext'
import Toast from '../components/Toast'

type Mode = 'login' | 'register'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  icon: ReactNode
  trailing?: ReactNode
}

/** Campo con icono, borde que reacciona a hover/focus y un halo de acento al enfocar. */
function Field({ label, hint, icon, trailing, className = '', ...props }: FieldProps) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label}
        {hint && <span className="text-[11px] font-medium normal-case tracking-normal text-slate-500">{hint}</span>}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500 transition-colors duration-200 group-focus-within:text-sky-400">
          {icon}
        </span>
        <input
          id={id}
          {...props}
          className={`h-12 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-11 ${trailing ? 'pr-12' : 'pr-4'} text-base text-white placeholder:text-slate-600 outline-none transition-all duration-200 ease-out hover:border-slate-500 focus:border-sky-500 focus:bg-slate-950 focus:shadow-[0_0_0_4px_rgba(255,80,0,.18)] focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm ${className}`}
        />
        {trailing && <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span>}
      </div>
    </div>
  )
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)
const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
  </svg>
)
const LockIcon = () => (
  <svg {...iconProps}>
    <rect x="4" y="10" width="16" height="10" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)
const EyeIcon = ({ off }: { off: boolean }) => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="m4 4 16 16" />}
  </svg>
)

/** Inicio de sesión y registro de la demostración de apuestas (saldo ficticio). */
export default function LoginPage() {
  const { account, login, register } = useAuth()
  const navigate = useNavigate()
  // ProtectedRoute nos manda aqui con el destino original y si la sesion caduco.
  const redirect = useLocation().state as { from?: string; expired?: boolean } | null
  const target = redirect?.from ?? '/betting'
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    redirect?.expired ? { id: 0, message: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.' } : null,
  )
  const [busy, setBusy] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])

  if (account) {
    return <Navigate to={target} replace />
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setToast(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setToast(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, displayName, password)
      }
      navigate(target, { replace: true })
    } catch (cause) {
      // mensaje generico: no se expone el error crudo ni detalles del backend
      setToast({
        id: Date.now(),
        message:
          cause instanceof SessionNotStoredError
            ? 'Las credenciales son correctas, pero el navegador no guardó la sesión. Si el backend está en otro dominio, debe tener COOKIE_SAME_SITE=None y tu dirección en CORS_ALLOWED_ORIGINS; revisa también que el navegador acepte cookies.'
            : mode === 'login'
              ? 'Correo o contraseña incorrectos.'
              : 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  const tab = (value: Mode) =>
    `flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
      mode === value
        ? 'bg-sky-500 text-white shadow-[0_6px_16px_-6px_rgba(255,80,0,.7)]'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    }`

  return (
    <section className="mx-auto w-full max-w-md px-0 py-2 motion-safe:animate-rise sm:py-8">
      {toast && <Toast id={toast.id} message={toast.message} onClose={dismissToast} />}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,.85),0_0_0_1px_rgba(255,255,255,.03)_inset]">
        {/* franja de acento y resplandor superior */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-sky-300 to-lime-400" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative space-y-6 p-5 sm:p-8">
          <header className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400 motion-safe:animate-pulse-dot" />
              Demo en vivo
            </span>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {mode === 'login' ? 'Entra al juego' : 'Crea tu cuenta'}
            </h1>
            <p className="text-sm text-slate-400">
              Cada cuenta nueva recibe <strong className="font-bold text-lime-400">100.000 COP ficticios</strong> para apostar.
            </p>
          </header>

          <div role="tablist" aria-label="Modo de acceso" className="flex gap-1 rounded-xl border border-slate-700 bg-slate-950/60 p-1">
            <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')} className={tab('login')}>
              Iniciar sesión
            </button>
            <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')} className={tab('register')}>
              Registrarme
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field
              label="Correo"
              icon={<MailIcon />}
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode === 'register' && (
              <div className="motion-safe:animate-pop-in">
                <Field
                  label="Nombre"
                  icon={<UserIcon />}
                  type="text"
                  required
                  minLength={2}
                  maxLength={40}
                  autoComplete="nickname"
                  placeholder="Cómo te verán otros"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}
            <Field
              label="Contraseña"
              hint={mode === 'register' ? 'Mínimo 8 caracteres' : undefined}
              icon={<LockIcon />}
              type={showPassword ? 'text' : 'password'}
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-slate-700/60 hover:text-white"
                >
                  <EyeIcon off={showPassword} />
                </button>
              }
            />

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_12px_28px_-10px_rgba(255,80,0,.8)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(255,80,0,.95)] active:translate-y-0 active:scale-[.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-300 disabled:shadow-none"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin" />
                  {mode === 'login' ? 'Ingresando…' : 'Creando cuenta…'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </>
              )}
            </button>
          </form>

          <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200">
            Demostración educativa: no uses una contraseña que ya utilices en otros sitios, no hay recuperación de contraseña ni
            verificación de correo, y no se maneja dinero real.
          </p>
        </div>
      </div>
    </section>
  )
}
