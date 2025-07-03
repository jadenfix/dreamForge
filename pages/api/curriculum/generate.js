import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { datasetDesc = '', rewardName = '', goal = '', constraints = '' } = req.body || {};

  if (!goal) return res.status(400).json({ error: 'goal is required' });

  try {
    const system = `You are an expert ML curriculum designer for vision model fine-tuning. Generate a practical JSON curriculum with 3-4 stages for the given goal.

Each stage MUST have:
- stage: string (stage name)
- focus: string (what this stage focuses on)
- epochs: number (realistic epoch count)
- lr: number (learning rate, e.g. 1e-4)
- batch_size: number (e.g. 8, 16, 32)

Example output:
[
  {"stage": "warmup", "focus": "basic feature learning", "epochs": 2, "lr": 1e-3, "batch_size": 16},
  {"stage": "adaptation", "focus": "domain-specific training", "epochs": 5, "lr": 5e-4, "batch_size": 8},
  {"stage": "fine_tune", "focus": "task-specific optimization", "epochs": 3, "lr": 1e-5, "batch_size": 4}
]

Output ONLY valid JSON array, no explanations.`;

    const userMsg = `Goal: ${goal}
Dataset: ${datasetDesc || 'Custom dataset'}
Reward Function: ${rewardName || 'Custom reward'}
Constraints: ${constraints || 'Standard training'}

Generate curriculum JSON:`;

    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: system,
      messages: [{ role: 'user', content: userMsg }],
    });

    const text = completion.content[0]?.text?.trim() || '';
    
    // Try to parse JSON from response
    let curriculum;
    try {
      curriculum = JSON.parse(text);
    } catch (_) {
      // Try to extract JSON array from text
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try { 
          curriculum = JSON.parse(match[0]); 
        } catch { 
          curriculum = getDefaultCurriculum(goal);
        }
      } else {
        curriculum = getDefaultCurriculum(goal);
      }
    }

    // Validate curriculum structure
    if (!Array.isArray(curriculum) || curriculum.length === 0) {
      curriculum = getDefaultCurriculum(goal);
    }

    // Ensure all stages have required fields
    curriculum = curriculum.map((stage, i) => ({
      stage: stage.stage || `stage_${i + 1}`,
      focus: stage.focus || 'Training focus',
      epochs: typeof stage.epochs === 'number' ? stage.epochs : 3,
      lr: typeof stage.lr === 'number' ? stage.lr : 1e-4,
      batch_size: typeof stage.batch_size === 'number' ? stage.batch_size : 8,
      ...stage
    }));

    res.status(200).json({ curriculum });
  } catch (err) {
    console.error('Curriculum generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate curriculum',
      curriculum: getDefaultCurriculum(goal)
    });
  }
}

function getDefaultCurriculum(goal) {
  const isDetection = goal.toLowerCase().includes('detect') || goal.toLowerCase().includes('bbox');
  const isSegmentation = goal.toLowerCase().includes('segment') || goal.toLowerCase().includes('mask');
  
  if (isDetection) {
    return [
      { stage: "warmup", focus: "basic object recognition", epochs: 2, lr: 1e-3, batch_size: 16 },
      { stage: "detection", focus: "bounding box regression", epochs: 5, lr: 5e-4, batch_size: 8 },
      { stage: "fine_tune", focus: "precision optimization", epochs: 3, lr: 1e-5, batch_size: 4 }
    ];
  } else if (isSegmentation) {
    return [
      { stage: "warmup", focus: "feature extraction", epochs: 2, lr: 1e-3, batch_size: 16 },
      { stage: "segmentation", focus: "pixel-level classification", epochs: 6, lr: 3e-4, batch_size: 6 },
      { stage: "refinement", focus: "boundary precision", epochs: 4, lr: 1e-5, batch_size: 4 }
    ];
  } else {
    return [
      { stage: "warmup", focus: "general feature learning", epochs: 2, lr: 1e-3, batch_size: 16 },
      { stage: "adaptation", focus: "domain-specific training", epochs: 4, lr: 5e-4, batch_size: 8 },
      { stage: "fine_tune", focus: "task optimization", epochs: 3, lr: 1e-5, batch_size: 4 }
    ];
  }
} 