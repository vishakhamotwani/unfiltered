export interface FeedbackResponse {
  good_at: string
  what_landed: string
  what_got_lost: string
  one_thing_to_change: string
}

export type AppState =
  | 'idle'
  | 'recording'
  | 'transcribed'
  | 'submitting'
  | 'feedback'
