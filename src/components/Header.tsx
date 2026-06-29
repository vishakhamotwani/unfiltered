import UsageCounter from './UsageCounter'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>The Unfiltered Engineer</h1>
      <p className={styles.description}>
        Record your "tell me about yourself" answer. Get feedback on how a recruiter
        would actually hear it — what lands, what doesn't, and what to change.
      </p>
      <UsageCounter />
    </header>
  )
}
