import { AppState } from '../types/feedback'
import { formatTime, WARNING_SECONDS, MAX_SECONDS } from '../hooks/useTimer'
import styles from './MicButton.module.css'

interface MicButtonProps {
  appState: AppState
  elapsed: number
  isWarning: boolean
  noSpeechWarning: boolean
  onStart: () => void
  onStop: () => void
}

export default function MicButton({
  appState,
  elapsed,
  isWarning,
  noSpeechWarning,
  onStart,
  onStop,
}: MicButtonProps) {
  const isRecording = appState === 'recording'
  const isDisabled = appState === 'submitting' || appState === 'feedback'

  function handleClick() {
    if (isDisabled) return
    if (isRecording) {
      onStop()
    } else if (appState === 'idle' || appState === 'transcribed') {
      onStart()
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${isRecording ? styles.recording : ''} ${isWarning ? styles.warning : ''}`}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording && (
          <>
            <span className={styles.pulse} />
            <span className={`${styles.pulse} ${styles.pulse2}`} />
          </>
        )}
        <MicIcon />
      </button>

      <div className={styles.meta}>
        {isRecording ? (
          <>
            <span className={`${styles.timer} ${isWarning ? styles.timerWarning : ''}`}>
              {formatTime(elapsed)}
            </span>
            {isWarning && (
              <span className={styles.warningText}>
                {elapsed >= MAX_SECONDS ? 'Recording stopped' : `${formatTime(MAX_SECONDS - elapsed)} remaining`}
              </span>
            )}
            {noSpeechWarning && !isWarning && (
              <span className={styles.noSpeechText}>
                We couldn't hear you. Make sure your mic is on and try again.
              </span>
            )}
          </>
        ) : (
          <span className={styles.hint}>
            {appState === 'idle' && 'Tap to start'}
            {appState === 'transcribed' && 'Record again'}
            {appState === 'feedback' && ''}
          </span>
        )}
      </div>
    </div>
  )
}

function MicIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export { WARNING_SECONDS, MAX_SECONDS }
