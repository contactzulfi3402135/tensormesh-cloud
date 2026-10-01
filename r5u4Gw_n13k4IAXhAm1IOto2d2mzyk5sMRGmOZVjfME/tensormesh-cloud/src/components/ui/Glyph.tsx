/**
 * TENSOR MESH — geometric compute-matrix glyph.
 * Nine cells: a fixed 3×3 tensor with one active rail cell (amber) and one
 * fabric cell (cyan). Drawn as a vector grid, never a bitmap.
 */
export function ComputeMatrixGlyph({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const cells = [
    { x: 0, y: 0, on: true },
    { x: 1, y: 0, on: false },
    { x: 2, y: 0, on: false },
    { x: 0, y: 1, on: false },
    { x: 1, y: 1, on: true },
    { x: 2, y: 1, on: false },
    { x: 0, y: 2, on: false },
    { x: 1, y: 2, on: false },
    { x: 2, y: 2, on: true },
  ]
  const u = 5
  const gap = 1.6

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* outer frame */}
      <rect x="0.5" y="0.5" width="18" height="18" stroke="#F59E0B" strokeOpacity="0.55" />
      {cells.map((c, i) => (
        <rect
          key={i}
          x={1.6 + c.x * (u + gap)}
          y={1.6 + c.y * (u + gap)}
          width={u}
          height={u}
          fill={c.on ? (i === 4 ? '#06B6D4' : '#F59E0B') : '#1F242F'}
          fillOpacity={c.on ? 0.95 : 1}
        />
      ))}
      {/* fabric rails: row 0 → col 2 lattice */}
      <path d="M1.6 8.1 H17.4" stroke="#06B6D4" strokeOpacity="0.28" strokeWidth="0.5" />
      <path d="M8.1 1.6 V17.4" stroke="#06B6D4" strokeOpacity="0.28" strokeWidth="0.5" />
    </svg>
  )
}

/** Inline icon set — 1.5px stroke, 24px grid, technical not decorative. */
export function Icon({
  name,
  className = 'h-4 w-4',
  strokeWidth = 1.5,
}: {
  name:
    | 'arrow-right'
    | 'arrow-down'
    | 'check'
    | 'close'
    | 'terminal'
    | 'chevron-down'
    | 'chevron-right'
    | 'copy'
    | 'cpu'
    | 'network'
    | 'shield'
    | 'bolt'
    | 'lock'
    | 'external'
    | 'play'
    | 'refresh'
    | 'minus'
    | 'plus'
    | 'menu'
  className?: string
  strokeWidth?: number
}) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M4 12h15" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      )
    case 'arrow-down':
      return (
        <svg {...common}>
          <path d="M12 4v15" />
          <path d="M6 13l6 6 6-6" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
        </svg>
      )
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      )
    case 'terminal':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" />
          <path d="M7 9.5l2.5 2.5L7 14.5" />
          <path d="M12.5 15H17" />
        </svg>
      )
    case 'chevron-down':
      return (
        <svg {...common}>
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="M9.5 6l6 6-6 6" />
        </svg>
      )
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" />
          <path d="M5 15V5a1 1 0 011-1h9" />
        </svg>
      )
    case 'cpu':
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" />
          <rect x="3" y="3" width="18" height="18" />
          <path d="M10 1.5v3M14 1.5v3M10 19.5v3M14 19.5v3M1.5 10h3M1.5 14h3M19.5 10h3M19.5 14h3" />
        </svg>
      )
    case 'network':
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="19" cy="19" r="2.5" />
          <path d="M12 7.5v4.5M12 12L6.2 16.9M12 12l5.8 4.9" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l7.5 3v6c0 4.4-3.1 8.1-7.5 9.5C7.6 20.1 4.5 16.4 4.5 12V6L12 3z" />
          <path d="M9 12l2 2 4-4.5" />
        </svg>
      )
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13.5 2.5L5.5 13.5H11l-.5 8 8-11H13l.5-7.5z" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4.5" y="10.5" width="15" height="10" />
          <path d="M8 10.5V7.5a4 4 0 018 0v3" />
        </svg>
      )
    case 'external':
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="M20 4l-8.5 8.5" />
          <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common}>
          <path d="M7 4.5l12 7.5-12 7.5v-15z" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 10-2.3 6.3" />
          <path d="M20 5v6h-6" />
        </svg>
      )
    case 'minus':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    default:
      return null
  }
}

/** Animated status dot — 8px, with optional live ping ring. */
export function StatusDot({
  tone = 'good',
  pulse = true,
  className = '',
}: {
  tone?: 'good' | 'amber' | 'rail' | 'crit' | 'muted'
  pulse?: boolean
  className?: string
}) {
  const color =
    tone === 'good'
      ? '#10B981'
      : tone === 'amber'
        ? '#F59E0B'
        : tone === 'rail'
          ? '#06B6D4'
          : tone === 'crit'
            ? '#EF4444'
            : '#5A6472'
  return (
    <span className={`relative inline-flex h-2 w-2 shrink-0 items-center justify-center ${className}`}>
      {pulse && (
        <span
          className="absolute inset-0 rounded-full animate-pulsering"
          style={{ backgroundColor: color, opacity: 0.5 }}
        />
      )}
      <span className="relative h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}
