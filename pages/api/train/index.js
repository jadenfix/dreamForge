import db from '../../../lib/mongodb.js';
import TrainingJob from '../../../models/TrainingJob.js';
import { addTrainingJob } from '../../../lib/queue.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // MongoDB connection is failing, use in-memory for now
    console.log('Training job request:', req.body);
    
    const { datasetId, dataset, rewardFnId, curriculum } = req.body;
    
    // Accept either datasetId (new) or dataset (legacy)
    const finalDatasetId = datasetId || dataset;

    if (!finalDatasetId) {
      return res.status(400).json({ error: 'datasetId is required' });
    }

    if (!curriculum || !Array.isArray(curriculum) || curriculum.length === 0) {
      return res.status(400).json({ error: 'curriculum is required and must be a non-empty array' });
    }

    // Create job document (in-memory since MongoDB is down)
    const jobDoc = {
      _id: `job_${Date.now()}`,
      datasetId: finalDatasetId,
      rewardFnId,
      curriculum,
      status: 'queued',
      progress: 0,
      logs: [],
      deploymentInfo: null, // Will be populated when model is deployed
      createdAt: new Date(),
    };

    console.log('Created training job:', jobDoc._id);

    // Add to queue (in-memory)
    await addTrainingJob({ 
      jobId: jobDoc._id, 
      datasetId: finalDatasetId,
      curriculum,
      rewardFnId 
    });

    return res.status(200).json({ 
      jobId: jobDoc._id,
      message: 'Training job queued successfully'
    });
    
  } catch (err) {
    console.error('Train API error:', err);
    return res.status(500).json({ 
      error: 'Internal server error: ' + err.message,
      details: err.stack
    });
  }
} 