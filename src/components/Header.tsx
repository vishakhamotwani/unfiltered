import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>Unfiltered</h1>
      <p className={styles.description}>
        Practice your "tell me about yourself" answer and get honest AI feedback.
        Record up to 3 minutes. Edit your transcript if needed, then submit.
      </p>
    </header>
  )
}
