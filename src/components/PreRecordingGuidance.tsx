import { useState } from 'react'
import styles from './PreRecordingGuidance.module.css'

const ITEMS = [
  {
    label: 'Background',
    description: 'your role, years, and the shape of your career so far',
    example:
      "I'm a senior frontend engineer. I've been doing this for about 10 years. I started out building web components and doing a lot of legacy migrations. The last few years I've been focused on design systems and growth engineering at a fintech company, so I own the component library everyone on the team uses, and I also work on the experimentation side, the stuff that drives activation.",
  },
  {
    label: 'Project + impact',
    description: 'closest to this role. Own the full arc, end to end',
    example:
      "One project I'm really proud of is one I led myself, start to finish. It started as just an idea with product, and I took it through design, built it, ran it as an experiment, and then worked with analytics to get buy-in to make it the default. It ended up driving a 23% lift in new customers and around 15 million dollars in projected revenue.",
  },
  {
    label: 'Memorable detail',
    description: 'something that ties it together, makes you, you',
    example:
      "Honestly, outside of work I'm doing the same thing. I'm always building little systems, even at home. If I'm not solving a problem at work, I'm probably solving one in my kitchen.",
  },
]

export default function PreRecordingGuidance() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.intro}>Before you hit record:</p>
      <ul className={styles.list}>
        {ITEMS.map(({ label, description, example }, i) => (
          <li key={label} className={styles.item}>
            <p className={styles.itemHeader}>
              <span className={styles.label}>{label}</span>
              <span className={styles.description}> — {description}</span>
            </p>
            <button
              className={styles.toggle}
              onClick={() => toggle(i)}
              aria-expanded={expanded.has(i)}
            >
              {expanded.has(i) ? 'Hide example ↑' : 'See an example ↓'}
            </button>
            {expanded.has(i) && (
              <p className={styles.example}>"{example}"</p>
            )}
          </li>
        ))}
      </ul>
      <p className={styles.closing}>No pressure to be perfect — that's what practice is for.</p>
    </div>
  )
}
