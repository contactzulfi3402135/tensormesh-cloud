import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Glyph'
import { useBodyLock, useEscape } from '../../hooks/useTelemetry'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  /** Right-aligned mono tag in the header, e.g. "eu-central-1" */
  tag?: string
  children: ReactNode
  /** Max width utility class */
  size?: 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

const SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
}

/**
 * Modal — obsidian scrim, hairline-bordered graphite panel, corner ticks.
 * Escape + backdrop dismissal, body scroll lock, initial focus capture.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  tag,
  children,
  size = 'lg',
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  useBodyLock(open)
  useEscape(onClose, open)

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="fixed inset-0 bg-obsidian/88 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`corner-ticks relative my-auto w-full ${SIZES[size]} animate-floatup border border-hairline bg-graphite shadow-panel outline-none`}
      >
        <header className="flex items-start justify-between gap-6 border-b border-hairline px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-3">
              <span className="eyebrow-amber">TENSOR MESH CONTROL PLANE</span>
              {tag && (
                <span className="badge badge-muted normal-case tracking-widest">{tag}</span>
              )}
            </div>
            <h2 className="truncate text-lg font-semibold tracking-tighter text-signal sm:text-xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 max-w-prose2 text-[13px] leading-relaxed text-slate-tech">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 border border-hairline bg-carbon p-2 text-slate-tech transition-colors hover:border-amber hover:text-amber"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-carbon px-5 py-4 sm:px-7">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
