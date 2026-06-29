import { useRef } from 'react'
import { toPng } from 'html-to-image'
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
  const cardRef = useRef<HTMLDivElement>(null)

  async function handleDownload() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#111318',
        pixelRatio: 2,
        style: { padding: '32px' },
      })
      const link = document.createElement('a')
      link.download = 'the-unfiltered-engineer-feedback.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <span>Simulating how a recruiter would hear this…</span>
      </div>
    )
  }

  if (!feedback) return null

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.heading}>Feedback</h2>
        <button className={styles.downloadButton} onClick={handleDownload}>
          ↓ Download
        </button>
      </div>
      <div ref={cardRef}>
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
        <p className={styles.watermark}>The Unfiltered Engineer</p>
      </div>
    </div>
  )
}
