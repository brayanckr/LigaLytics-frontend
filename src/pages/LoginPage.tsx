import { useCallback, useId, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/axiosClient'
import { SessionNotStoredError, useAuth } from '../auth/AuthContext'
import HeroBackdrop, { SHOW_FRAME } from '../components/HeroBackdrop'
import { LogoFull } from '../components/Logo'
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
      <label htmlFor={id} className="flex items-baseline justify-between text-[11px] font-bold uppercase tracking-[.1em] text-slate-300">
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
          className={`h-12 w-full rounded border border-slate-700 bg-slate-950/70 pl-11 ${trailing ? 'pr-12' : 'pr-4'} text-base text-white placeholder:text-slate-600 outline-none transition-all duration-200 ease-out hover:border-slate-500 focus:border-sky-500 focus:bg-slate-950 focus:shadow-[0_0_0_4px_rgba(18,192,238,.18)] focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm ${className}`}
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
            ? `Las credenciales son correctas, pero el navegador no guardó la sesión (API: ${API_BASE_URL}). Si la API es una URL completa de otro dominio, la cookie no viaja: usa /api con el reenvío de Vercel o define COOKIE_SAME_SITE=None en el backend; revisa también que el navegador acepte cookies.`
            : mode === 'login'
              ? 'Correo o contraseña incorrectos.'
              : 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
    }
  }

  const tab = (value: Mode) =>
    `flex-1 rounded px-3 py-2.5 text-sm font-bold uppercase tracking-[.06em] transition-all duration-200 ${
      mode === value
        ? 'bg-sky-500 text-slate-950 shadow-[0_6px_16px_-8px_rgba(18,192,238,.6)]'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    }`

  return (
    // Pantalla completa sobre el layout (Navbar, Sidebar y BottomNav quedan debajo): campo + overlay + halo + marco.
    <section className="fixed inset-0 z-50 bg-slate-900">
      <HeroBackdrop />
      {SHOW_FRAME && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 border-2 border-sky-500" />}
      {toast && <Toast id={toast.id} message={toast.message} onClose={dismissToast} />}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="mx-auto grid min-h-full w-full max-w-[1200px] items-center gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_28rem] lg:gap-16 lg:py-12">
          <div className="max-w-[34rem] motion-safe:animate-rise">
            <LogoFull className="w-[200px] sm:w-[280px] lg:w-[340px]" />
            <p className="eyebrow mt-6 text-sky-400">Poisson &amp; Weka ML Trained</p>
            <h1 className="mt-3 text-[clamp(2.5rem,11vw,3rem)] text-white md:text-[3.5rem] lg:text-[clamp(3rem,5.6vw,5rem)]">
              Lee el juego
              <span className="text-brand-gradient block pr-[.1em]">Decide con datos</span>
            </h1>
          </div>

      <div className="relative overflow-hidden rounded-md border border-white/[.07] bg-slate-800 shadow-float motion-safe:animate-rise">
        <div className="relative space-y-6 p-5 sm:p-8">
          <header className="space-y-2">
            <span className="eyebrow inline-flex items-center gap-2 rounded border border-lime-400/30 bg-lime-400/10 px-3 py-1 !text-[11px] text-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400 motion-safe:animate-pulse-dot" />
              Demo en vivo
            </span>
            <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-[.02em] text-white sm:text-4xl">
              {mode === 'login' ? 'Entra al juego' : 'Crea tu cuenta'}
            </h2>
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
              className="btn-primary group w-full !min-h-[52px] disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 motion-safe:animate-spin" />
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
        </div>
      </div>
        </div>
      </div>
    </section>
  )
}
