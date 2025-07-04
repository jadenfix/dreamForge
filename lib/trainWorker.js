import dotenv from 'dotenv';
import mongoose from 'mongoose';
import db from './mongodb.js';
import TrainingJob from '../models/TrainingJob.js';
import { startTrainingWorker } from './queue.js';
import logger from './logger.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// In-memory job storage (since MongoDB is down)
const jobStorage = new Map();

// Simulated training loop
const TRAIN_DURATION_MS = 30_000; // 30 seconds total

startTrainingWorker(async (job) => {
  try {
    const { id, data } = job;
    const { jobId, datasetId, curriculum, rewardFnId } = data;
    
    logger.info(`Training job ${jobId} started with dataset ${datasetId}`);
    
    // Initialize job in storage
    const jobDoc = {
      _id: jobId,
      status: 'running',
      progress: 0,
      logs: [`Starting training with dataset: ${datasetId}`],
      eta: Math.ceil(TRAIN_DURATION_MS / 1000),
      curriculum,
      rewardFnId,
      deploymentInfo: null,
      createdAt: new Date(),
    };
    
    jobStorage.set(jobId, jobDoc);

    const start = Date.now();
    const totalStages = curriculum?.length || 3;
    let currentStage = 0;
    
    const interval = setInterval(async () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, Math.floor((elapsed / TRAIN_DURATION_MS) * 100));
      
      // Update current stage based on progress
      const newStage = Math.floor((progress / 100) * totalStages);
      if (newStage > currentStage && newStage < totalStages) {
        currentStage = newStage;
        const stageName = curriculum?.[currentStage]?.stage || `Stage ${currentStage + 1}`;
        jobDoc.logs.push(`Starting ${stageName}: ${curriculum?.[currentStage]?.focus || 'Training'}`);
      }
      
      jobDoc.progress = progress;
      jobDoc.eta = Math.max(0, Math.ceil((TRAIN_DURATION_MS - elapsed) / 1000));
      
      if (progress < 100) {
        jobDoc.logs.push(`Stage ${currentStage + 1}/${totalStages}: ${progress}% complete`);
      }
      
      jobStorage.set(jobId, { ...jobDoc });

      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate model deployment
        const modelId = `model_${jobId}_${Date.now()}`;
        const deploymentInfo = {
          modelId: modelId,
          endpoint: `/api/models/predict?modelId=${modelId}`,
          deployedAt: new Date().toISOString(),
          status: 'active',
          metadata: {
            datasetId,
            curriculum: curriculum?.map(s => s.stage).join(' -> '),
            rewardFunction: rewardFnId || 'custom',
            totalEpochs: curriculum?.reduce((sum, s) => sum + (s.epochs || 0), 0) || 10
          }
        };
        
        jobDoc.status = 'completed';
        jobDoc.deploymentInfo = deploymentInfo;
        jobDoc.logs.push('Training completed successfully!');
        jobDoc.logs.push(`Model deployed at: ${deploymentInfo.endpoint}`);
        jobDoc.logs.push(`Model ID: ${modelId}`);
        jobDoc.logs.push('You can now use this model for inference via the API or web interface.');
        
        jobStorage.set(jobId, { ...jobDoc });
        
        logger.info(`Training job ${jobId} completed and deployed as ${modelId}`);
      }
    }, 2000);
    
  } catch (err) {
    logger.error('Training worker error', err);
    if (job?.data?.jobId) {
      const jobDoc = jobStorage.get(job.data.jobId) || {};
      jobDoc.status = 'failed';
      jobDoc.error = err.message;
      jobDoc.logs = [...(jobDoc.logs || []), `Error: ${err.message}`];
      jobStorage.set(job.data.jobId, jobDoc);
    }
  }
});

// Export job storage for status API
export { jobStorage }; 