import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { datasetDesc = '', rewardName = '', goal = '', constraints = '' } = req.body || {};

  if (!goal) return res.status(400).json({ error: 'goal is required' });

  try {
    const system = 'You are an expert ML curriculum designer for vision models. Generate a concise JSON array of training stages for fine-tuning given the user specs. Each stage must have keys: stage, focus, epochs (int) and optionally lr, augment, blur, etc. Output JSON only.';

    const userMsg = `Dataset description: ${datasetDesc || 'N/A'}\nReward: ${rewardName || 'N/A'}\nGoal: ${goal}\nConstraints: ${constraints || 'None'}\n\nReturn JSON array now.`;

    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || '';
    // Try parse JSON
    let plan;
    try {
      plan = JSON.parse(text);
    } catch (_) {
      const match = text.match(/\[.*\]/s);
      if (match) {
        try { plan = JSON.parse(match[0]); } catch { plan = [{ stage:'custom', note:text }]; }
      } else {
        plan = [{ stage: 'custom', note: text }];
      }
    }

    res.status(200).json({ curriculum: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate curriculum' });
  }
} 