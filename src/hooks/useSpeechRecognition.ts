import { useState, useRef, useCallback } from 'react'

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [noSpeechWarning, setNoSpeechWarning] = useState(false)
  const finalRef = useRef('')
  const activeRef = useRef(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startInstance = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'

    r.onresult = (event: SpeechRecognitionEvent) => {
      setNoSpeechWarning(false)
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalRef.current += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setTranscript((finalRef.current + interim).trim())
    }

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        setNoSpeechWarning(true)
        // activeRef.current stays true — onend will restart recognition automatically
      } else if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
      }
    }

    r.onend = () => {
      // Browser cut off due to silence — restart if user hasn't stopped
      if (activeRef.current) {
        recognitionRef.current = null
        try {
          startInstance()
        } catch {
          // ignore restart failure
        }
      }
    }

    recognitionRef.current = r
    r.start()
  }, [])

  const start = useCallback(() => {
    activeRef.current = true
    finalRef.current = ''
    setTranscript('')
    setNoSpeechWarning(false)
    startInstance()
  }, [startInstance])

  const stop = useCallback(() => {
    activeRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    activeRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    finalRef.current = ''
    setTranscript('')
  }, [])

  const getTranscript = useCallback(() => finalRef.current.trim(), [])

  return { transcript, noSpeechWarning, start, stop, reset, getTranscript }
}
