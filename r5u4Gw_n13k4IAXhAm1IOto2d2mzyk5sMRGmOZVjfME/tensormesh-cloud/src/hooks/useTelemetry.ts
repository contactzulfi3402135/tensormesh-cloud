import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Live region-to-region RTT bank.
 * Seeds from the static fabric table, then applies a bounded ±1ms random walk
 * every `intervalMs` so the topology grid reads as a live instrument.
 */
export function useLatencyMatrix(
  pairs: Array<[string, string]>,
  seedValues: Record<string, number>,
  intervalMs = 1800,
) {
  const [values, setValues] = useState<Record<string, number>>(seedValues)
  const [lastSync, setLastSync] = useState(() => Date.now())
  const [beat, setBeat] = useState(0)
  const drift = useRef<Record<string, number>>({})

  useEffect(() => {
    const id = window.setInterval(() => {
      setValues((prev) => {
        const next: Record<string, number> = {}
        for (const [a, b] of pairs) {
          const key = `${a}|${b}`
          const base = seedValues[key] ?? prev[key] ?? 40
          const prior = drift.current[key] ?? 0
          // bounded random walk, ±1.0ms, mean-reverting toward the physical baseline
          const step = (Math.random() * 2 - 1) * 1.0 - prior * 0.28
          const d = Math.max(-1, Math.min(1, prior + step))
          drift.current[key] = d
          next[key] = Math.max(0.1, base + d)
        }
        return next
      })
      setBeat((b) => b + 1)
      setLastSync(Date.now())
    }, intervalMs)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs])

  return { values, lastSync, beat }
}

/** Runs a function on an interval, pausing when the tab is hidden. */
export function useInterval(callback: () => void, delayMs: number | null) {
  const saved = useRef(callback)
  useEffect(() => {
    saved.current = callback
  }, [callback])
  useEffect(() => {
    if (delayMs === null) return
    const id = window.setInterval(() => saved.current(), delayMs)
    return () => window.clearInterval(id)
  }, [delayMs])
}

/** Tracks whether a scroll container / element has been entered at least once. */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || shown) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            obs.disconnect()
          }
        })
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [shown, threshold])

  return { ref, shown }
}

/** Locks body scroll while a modal / drawer owns the viewport. */
export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

/** Registers a global Escape handler. */
export function useEscape(handler: () => void, active = true) {
  const saved = useRef(handler)
  useEffect(() => {
    saved.current = handler
  }, [handler])
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') saved.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}

/** Copies text to the clipboard with a transient "copied" acknowledgement. */
export function useCopy(resetMs = 1800) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string, id = 'default') => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        setCopied(id)
        window.setTimeout(() => setCopied((c) => (c === id ? null : c)), resetMs)
      } catch {
        /* clipboard unavailable in this context */
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
