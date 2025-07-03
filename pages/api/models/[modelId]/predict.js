import { jobStorage } from '../../../../lib/trainWorker.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { modelId } = req.query;
  const { prompt, image } = req.body;

  if (!modelId) {
    return res.status(400).json({ error: 'modelId is required' });
  }

  if (!prompt || !image) {
    return res.status(400).json({ error: 'prompt and image are required' });
  }

  try {
    // Find the job that created this model
    let modelJob = null;
    for (const [jobId, job] of jobStorage.entries()) {
      if (job.deploymentInfo?.modelId === modelId) {
        modelJob = job;
        break;
      }
    }

    if (!modelJob) {
      return res.status(404).json({ error: 'Model not found or not deployed' });
    }

    if (modelJob.deploymentInfo?.status !== 'active') {
      return res.status(503).json({ error: 'Model is not currently active' });
    }

    // Simulate model inference (in real implementation, this would call your trained model)
    const response = await simulateModelInference(prompt, image, modelJob);

    return res.status(200).json({
      modelId,
      prompt,
      response,
      metadata: {
        modelInfo: modelJob.deploymentInfo.metadata,
        inferenceTime: Math.random() * 2000 + 500, // 500-2500ms
        confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
        timestamp: new Date().toISOString(),
      }
    });

  } catch (err) {
    console.error('Model inference error:', err);
    return res.status(500).json({ error: 'Inference failed: ' + err.message });
  }
}

async function simulateModelInference(prompt, image, modelJob) {
  // This is a simulation - in real implementation, you'd call your trained model
  const curriculum = modelJob.curriculum || [];
  const rewardFunction = modelJob.rewardFnId || 'custom';
  
  // Simulate different responses based on the training curriculum
  const isDetection = curriculum.some(s => s.stage?.includes('detect')) || rewardFunction.includes('iou');
  const isSegmentation = curriculum.some(s => s.stage?.includes('segment'));
  
  if (isDetection) {
    return {
      task: 'object_detection',
      objects: [
        {
          label: 'person',
          confidence: 0.92,
          bbox: [120, 80, 200, 350]
        },
        {
          label: 'car',
          confidence: 0.87,
          bbox: [50, 200, 180, 280]
        }
      ],
      description: `Detected ${Math.floor(Math.random() * 3) + 1} objects in the image using your fine-tuned model.`
    };
  } else if (isSegmentation) {
    return {
      task: 'segmentation',
      segments: [
        { class: 'background', pixels: 65432 },
        { class: 'foreground', pixels: 34568 }
      ],
      description: 'Segmented the image into distinct regions using your custom-trained model.'
    };
  } else {
    return {
      task: 'general_vision',
      caption: `This image shows ${prompt.toLowerCase()}. The fine-tuned model has been optimized for your specific use case.`,
      description: `Generated response using your custom-trained model with ${curriculum.length} training stages.`
    };
  }
} 