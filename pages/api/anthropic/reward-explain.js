import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reward } = req.body; // expects {id,name,description,code}
  if (!reward || !reward.name || !reward.description) {
    return res.status(400).json({ error: 'reward is required' });
  }

  try {
    const prompt = `You are an expert ML tutor. Explain in simple terms the following reward function so that a junior developer understands when and why to use it. Provide uses, pros, cons, and an example.

Reward Name: ${reward.name}
Description: ${reward.description}
Code (JavaScript):\n${reward.code}\n
Return Markdown starting with a one-sentence summary followed by bullet points for Pros, Cons, and Best-Use Cases.`;

    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const text = completion.choices?.[0]?.message?.content || completion.content || completion;
    return res.status(200).json({ explanation: text });
  } catch (err) {
    console.error('Explain error', err);
    return res.status(500).json({ error: 'Failed to generate explanation' });
  }
} 