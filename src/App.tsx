import { useState, useCallback, useRef, useEffect } from 'react'
import { AppState, FeedbackResponse } from './types/feedback'
import { useSpeechRecognition, isSpeechSupported } from './hooks/useSpeechRecognition'
import { useTimer } from './hooks/useTimer'
import Header from './components/Header'
import MicButton from './components/MicButton'
import TranscriptEditor from './components/TranscriptEditor'
import FeedbackPanel from './components/FeedbackPanel'
import Footer from './components/Footer'
import styles from './App.module.css'

const speechSupported = isSpeechSupported()

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [editableTranscript, setEditableTranscript] = useState('')
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { transcript, noSpeechWarning, start: startSpeech, stop: stopSpeech, reset: resetSpeech, getTranscript } =
    useSpeechRecognition()

  // Break circular dep: stopRecording needs stopTimer, useTimer needs stopRecording
  const stopRecordingRef = useRef<() => void>(() => {})
  const stableOnMaxTime = useCallback(() => stopRecordingRef.current(), [])
  const { elapsed, start: startTimer, stop: stopTimer, reset: resetTimer, isWarning } =
    useTimer(stableOnMaxTime)

  const stopRecording = useCallback(() => {
    stopTimer()
    stopSpeech()
    setEditableTranscript(getTranscript())
    setAppState('transcribed')
  }, [stopTimer, stopSpeech, getTranscript])

  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

  const startRecording = useCallback(() => {
    setError(null)
    setFeedback(null)
    resetSpeech()
    resetTimer()
    startSpeech()
    startTimer()
    setAppState('recording')
  }, [resetSpeech, resetTimer, startSpeech, startTimer])

  const handleSubmit = useCallback(async () => {
    if (!editableTranscript.trim()) return
    setAppState('submitting')
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: editableTranscript }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Request failed')
      }
      const data = (await res.json()) as FeedbackResponse
      setFeedback(data)
      setAppState('feedback')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setAppState('transcribed')
    }
  }, [editableTranscript])

  const handleReset = useCallback(() => {
    setFeedback(null)
    setError(null)
    setAppState('transcribed')
  }, [])

  const showTranscript =
    appState === 'transcribed' || appState === 'submitting' || appState === 'feedback'

  // Sync interim transcript to the editable field while recording (live preview)
  useEffect(() => {
    if (appState === 'recording') {
      setEditableTranscript(transcript)
    }
  }, [appState, transcript])

  return (
    <div className={styles.page}>
      {!speechSupported && (
        <div className={styles.browserError} role="alert">
          Your browser doesn't support voice recording. Please try Chrome.
        </div>
      )}

      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <MicButton
            appState={appState}
            elapsed={elapsed}
            isWarning={isWarning}
            noSpeechWarning={noSpeechWarning}
            onStart={startRecording}
            onStop={stopRecording}
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {showTranscript && (
            <TranscriptEditor
              value={editableTranscript}
              onChange={setEditableTranscript}
              disabled={appState === 'submitting' || appState === 'feedback'}
            />
          )}

          {appState === 'transcribed' && (
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!editableTranscript.trim()}
            >
              Get feedback
            </button>
          )}

          {(appState === 'submitting' || appState === 'feedback') && (
            <FeedbackPanel feedback={feedback} isLoading={appState === 'submitting'} />
          )}

          {appState === 'feedback' && (
            <button className={styles.resetButton} onClick={handleReset}>
              Try again
            </button>
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}
