interface AvatarProps {
  name: string
  size?: 'sm' | 'lg'
}

/** Avatar con las iniciales del usuario sobre un degradado de acento. */
export default function Avatar({ name, size = 'sm' }: AvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  const dimensions = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-9 w-9 text-sm'
  return (
    <span
      aria-hidden
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-lime-400 font-extrabold text-slate-900 ring-2 ring-slate-700`}
    >
      {initials}
    </span>
  )
}
