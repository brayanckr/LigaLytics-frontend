interface SpinnerProps {
  label?: string
}

export default function Spinner({ label = 'Cargando…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400"
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}
