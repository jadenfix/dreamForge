import db from '../../../lib/mongodb.js';
import TrainingJob from '../../../models/TrainingJob.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId } = req.query;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  await db();

  const jobDoc = await TrainingJob.findById(jobId).lean();
  if (!jobDoc) return res.status(404).json({ error: 'Job not found' });

  return res.status(200).json(jobDoc);
} 