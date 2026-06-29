import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './UsageCounter.module.css'

export default function UsageCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('usage_counter')
      .select('count')
      .single()
      .then(({ data }) => {
        if (data) setCount((data as { count: number }).count)
      })
  }, [])

  if (!count) return null

  return (
    <p className={styles.counter}>
      {count.toLocaleString()} engineers have practiced their story
    </p>
  )
}
