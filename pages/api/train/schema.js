export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const schema = {
    type: 'object',
    required: ['dataset', 'curriculum'],
    properties: {
      dataset: { type: 'string', description: 'Path or URL to dataset' },
      rewardFnId: { type: 'string', description: 'Optional reward function reference' },
      curriculum: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stage: { type: 'integer' },
            epochs: { type: 'integer' },
          },
          required: ['stage', 'epochs'],
        },
      },
    },
  };
  res.status(200).json(schema);
} 