import db from '../../../lib/mongodb.js';
import TrainingJob from '../../../models/TrainingJob.js';
import { addTrainingJob } from '../../../lib/queue.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await db();

  try {
    const { datasetId, rewardFnId, curriculum } = req.body;

    if (!datasetId) {
      return res.status(400).json({ error: 'datasetId is required' });
    }

    const jobDoc = await TrainingJob.create({ datasetId, rewardFnId, curriculum });
    await addTrainingJob({ jobId: jobDoc._id, datasetId });

    return res.status(200).json({ jobId: jobDoc._id });
  } catch (err) {
    console.error('Train API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 