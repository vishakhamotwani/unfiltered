import styles from './TranscriptEditor.module.css'

interface TranscriptEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function TranscriptEditor({
  value,
  onChange,
  disabled = false,
}: TranscriptEditorProps) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="transcript">
        Your answer
        <span className={styles.hint}>Edit before submitting if needed</span>
      </label>
      <textarea
        id="transcript"
        className={styles.textarea}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        rows={8}
        placeholder="Your transcript will appear here after recording."
        spellCheck
      />
    </div>
  )
}
