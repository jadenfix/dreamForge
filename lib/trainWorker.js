import mongoose from 'mongoose';
import db from './mongodb.js';
import TrainingJob from '../models/TrainingJob.js';
import { startTrainingWorker } from './queue.js';
import logger from './logger.js';

await db();

// Simulated training loop
const TRAIN_DURATION_MS = 30_000; // 30 seconds total

startTrainingWorker(async (job) => {
  try {
    const { id, data } = job;
    logger.info(`Training job ${id} started`);
    const jobDoc = await TrainingJob.findById(data.jobId);
    if (!jobDoc) return;

    jobDoc.status = 'running';
    jobDoc.progress = 0;
    await jobDoc.save();

    const start = Date.now();
    const interval = setInterval(async () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, Math.floor((elapsed / TRAIN_DURATION_MS) * 100));
      jobDoc.progress = progress;
      jobDoc.logs.push(`Progress: ${progress}%`);
      jobDoc.eta = Math.max(0, Math.ceil((TRAIN_DURATION_MS - elapsed) / 1000));
      await jobDoc.save();

      if (progress >= 100) {
        clearInterval(interval);
        jobDoc.status = 'completed';
        jobDoc.logs.push('Training complete');
        await jobDoc.save();
        logger.info(`Training job ${id} completed`);
      }
    }, 2000);
  } catch (err) {
    logger.error('Training worker error', err);
    if (job?.data?.jobId) {
      await TrainingJob.findByIdAndUpdate(job.data.jobId, { status: 'failed', error: err.message });
    }
  }
}); 