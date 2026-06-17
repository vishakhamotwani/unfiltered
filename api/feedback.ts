import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 d'),
  analytics: false,
})

// Reuses the same vars as the client-side Supabase instance
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT =
  'You are a discerning, warm career coach helping women in STEM nail their "tell me about yourself" interview answer. You are direct, honest, and encouraging without being fluffy. You see people clearly and reflect back what you notice. Pay specific attention to ownership language. Flag when the speaker says \'we\' instead of \'I\', \'worked on\' instead of \'led\', \'helped with\' instead of \'owned\', or any language that minimizes their individual contribution. Women in STEM consistently undersell their impact — name this pattern explicitly when you see it, and suggest stronger language they could use instead. When suggesting improvements, encourage the speaker to use impact numbers where possible. For example, instead of \'I improved the onboarding flow\', suggest \'I improved the onboarding flow which led to X% increase in activation\' — prompt them to think about what the measurable outcome was, even if they need to estimate it.'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? '127.0.0.1'

  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return res.status(429).json({ error: "You've reached today's limit. Come back tomorrow." })
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
