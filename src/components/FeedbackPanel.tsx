import { FeedbackResponse } from '../types/feedback'
import styles from './FeedbackPanel.module.css'

interface FeedbackPanelProps {
  feedback: FeedbackResponse | null
  isLoading: boolean
}

const SECTIONS: { key: keyof FeedbackResponse; label: string }[] = [
  { key: 'good_at', label: "Here's what I think you're good at" },
  { key: 'what_landed', label: 'What landed' },
  { key: 'what_got_lost', label: 'What got lost' },
  { key: 'one_thing_to_change', label: 'One thing to change' },
]

export default function FeedbackPanel({ feedback, isLoading }: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <span>Analyzing your answer…</span>
      </div>
    )
  }

  if (!feedback) return null

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>Feedback</h2>
      <div className={styles.sections}>
        {SECTIONS.map(({ key, label }, i) => (
          <div
            key={key}
            className={styles.section}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <h3 className={styles.sectionLabel}>{label}</h3>
            <p className={styles.sectionBody}>{feedback[key]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
