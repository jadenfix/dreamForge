import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, rewardCode } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });

  try {
    const systemPrompt = `You are DreamForge AI assistant helping users craft JavaScript reward functions for vision model training. Answer concisely and include code examples when appropriate.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `User question: ${query}

Existing reward (if any):\n${rewardCode || 'N/A'}` }
    ];

    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      messages,
    });

    const answer = completion.choices?.[0]?.message?.content || completion.content || completion;
    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
} 