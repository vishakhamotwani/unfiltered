import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a
        href="https://github.com/vishakhamotwani/unfiltered"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        GitHub
      </a>
      <span className={styles.dot} aria-hidden="true">·</span>
      <a
        href="https://www.linkedin.com/in/vishakhamotwani"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        LinkedIn
      </a>
    </footer>
  )
}
