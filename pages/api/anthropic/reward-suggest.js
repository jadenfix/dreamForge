import { Anthropic } from '@anthropic-ai/sdk';
import logger from '../../../lib/logger.js';

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { domain } = req.body;
  if (!anthropic) {
    return res.status(200).json({ spec: '// Anthropic API key missing – please provide your own reward function.' });
  }

  try {
    const prompt = `You are an expert vision ML engineer. Draft a concise JavaScript reward function spec for the domain: ${domain}. Return only the code snippet.`;
    const completion = await anthropic.complete({
      model: 'claude-instant-1',
      max_tokens_to_sample: 150,
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      temperature: 0.4,
    });
    return res.status(200).json({ spec: completion.completion.trim() });
  } catch (err) {
    logger.error('Reward suggest error', err);
    return res.status(500).json({ error: 'Failed to generate reward spec' });
  }
} 