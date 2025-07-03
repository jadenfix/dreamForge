export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { dataset } = req.body;
  const lower = dataset?.toLowerCase() || '';
  const hasBBoxes = lower.includes('coco') || lower.includes('bbox') || lower.includes('.json');
  const task = hasBBoxes ? 'detection' : 'caption';
  res.status(200).json({ hasBBoxes, task });
} 