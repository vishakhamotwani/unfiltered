import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '1 d'),
      analytics: false,
    })
  : null

// Reuses the same vars as the client-side Supabase instance
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = process.env.FEEDBACK_SYSTEM_PROMPT ?? ''

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (ratelimit) {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return res.status(429).json({ error: "You've reached today's limit. Come back tomorrow." })
    }
  } else {
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL is not set')
  }

  const { transcript } = req.body as { transcript?: unknown }

  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ error: 'transcript is required' })
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze the following "tell me about yourself" interview answer and return structured feedback as a JSON object with exactly these four fields:

{
  "good_at": "A warm, mirror-like reflection of what you inferred about this person — who they are, what they value, what makes them distinctive. Written in second person. 2–4 sentences.",
  "what_landed": "What worked well. Specific moments, phrasing, or qualities that were strong. 2–3 sentences.",
  "what_got_lost": "What was unclear, missing, buried, or undermined. Honest and specific. 2–3 sentences.",
  "one_thing_to_change": "One single, concrete, immediately actionable change. Not general advice — something specific to this answer. 1–2 sentences."
}

Return ONLY the JSON object. No markdown fences, no explanation.

Answer:
${transcript.trim()}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') {
    return res.status(500).json({ error: 'Unexpected response from AI' })
  }

  let feedback: unknown
  try {
    feedback = JSON.parse(block.text)
  } catch {
    return res.status(500).json({ error: 'Failed to parse AI response' })
  }

  // Increment after a successful Claude response
  const { error: counterError } = await supabase.rpc('increment_counter')
  if (counterError) {
    console.error('Counter increment failed:', counterError.message)
  }

  return res.status(200).json(feedback)
}
