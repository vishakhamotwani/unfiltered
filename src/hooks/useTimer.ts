import { useState, useRef, useCallback, useEffect } from 'react'

export const WARNING_SECONDS = 150 // 2:30
export const MAX_SECONDS = 180    // 3:00

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function useTimer(onMaxTime: () => void) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callbackRef = useRef(onMaxTime)
  callbackRef.current = onMaxTime

  useEffect(() => {
    if (elapsed >= MAX_SECONDS && intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      callbackRef.current()
    }
  }, [elapsed])

  const start = useCallback(() => {
    setElapsed(0)
    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setElapsed(0)
  }, [])

  return {
    elapsed,
    start,
    stop,
    reset,
    isWarning: elapsed >= WARNING_SECONDS && elapsed < MAX_SECONDS,
  }
}
