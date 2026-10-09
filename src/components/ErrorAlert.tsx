interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-rose-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-sm font-bold text-rose-100">
          !
        </span>
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/30"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
