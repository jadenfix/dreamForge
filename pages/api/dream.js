import '@anthropic-ai/sdk/shims/node';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';
import connectToDatabase from '../../lib/mongodb.js';
import moondreamClient from '../../lib/moondreamClient.js';
import refineRules from '../../lib/refineRules.js';
import Usage from '../../models/Usage.js';
import logger from '../../lib/logger.js';

// Input validation schema
const DreamSchema = z.object({
  prompt: z.string().min(1).max(2000),
  image: z.string().min(1), // Base64 encoded image
  useAnthropicPlanner: z.boolean().optional().default(true)
});

// Anthropic client will be initialized when needed

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  let usageRecord = null;

  try {
    // Connect to database
    await connectToDatabase();

    // Validate request body
    const { prompt, image, useAnthropicPlanner } = DreamSchema.parse(req.body);
    
    logger.info('Processing dream request', { 
      promptLength: prompt.length,
      imageSize: image.length,
      useAnthropicPlanner 
    });

    let skill, params;

    // Step 1: LLM-driven prompt refinement (with fallback)
    if (useAnthropicPlanner && process.env.ANTHROPIC_API_KEY) {
      try {
        // Initialize Anthropic client when needed
        const anthropic = new Anthropic({ 
          apiKey: process.env.ANTHROPIC_API_KEY 
        });

        const planPrompt = `You are a router for a visual AI system. Given the user request:
"${prompt}"

Analyze this request and return ONLY a JSON object with this exact structure:
{
  "skill": "detect" | "point" | "query" | "caption",
  "params": {}
}

Skills:
- "detect": Find/identify objects in the image
- "point": Locate specific coordinates/positions
- "query": Answer questions about the image
- "caption": Generate descriptions of the image

Choose the most appropriate skill and include relevant parameters.`;

        const planRes = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          temperature: 0.1,
          messages: [{
            role: 'user',
            content: planPrompt
          }]
        });

        const planText = planRes.content[0].text.trim();
        const parsed = JSON.parse(planText);
        
        if (['detect', 'point', 'query', 'caption'].includes(parsed.skill)) {
          skill = parsed.skill;
          params = parsed.params || {};
          logger.info('Anthropic planning successful', { skill, params });
        } else {
          throw new Error('Invalid skill from Anthropic');
        }
      } catch (anthropicError) {
        logger.warn('Anthropic planning failed, using fallback', anthropicError.message);
        const fallback = refineRules(prompt);
        skill = fallback.skill;
        params = fallback.params;
      }
    } else {
      // Use fallback rules directly
      const fallback = refineRules(prompt);
      skill = fallback.skill;
      params = fallback.params;
      logger.info('Using fallback rules', { skill, params });
    }

    // Create usage record
    usageRecord = new Usage({
      prompt,
      skill,
      parameters: params,
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // Step 2: Convert base64 to buffer for Moondream
    const imageBuffer = Buffer.from(image, 'base64');
    
    // Step 3: Call Moondream API
    const dreamStartTime = Date.now();
    
    let moondreamResponse;
    switch (skill) {
      case 'detect':
        moondreamResponse = await moondreamClient.detect({
          image: imageBuffer,
          threshold: params.threshold || 0.5,
          target: params.target
        });
        break;
      
      case 'point':
        moondreamResponse = await moondreamClient.point({
          image: imageBuffer,
          query: params.query || prompt
        });
        break;
      
      case 'query':
        moondreamResponse = await moondreamClient.query({
          image: imageBuffer,
          question: params.question || prompt
        });
        break;
      
      case 'caption':
        moondreamResponse = await moondreamClient.caption({
          image: imageBuffer,
          style: params.style
        });
        break;
      
      default:
        throw new Error(`Unknown skill: ${skill}`);
    }

    const dreamDuration = Date.now() - dreamStartTime;
    const totalDuration = Date.now() - startTime;

    // Step 4: Update usage record with results
    usageRecord.responseTime = totalDuration;
    usageRecord.resultSize = JSON.stringify(moondreamResponse).length;
    
    // Extract confidence if available
    if (moondreamResponse.confidence) {
      usageRecord.confidence = moondreamResponse.confidence;
    } else if (moondreamResponse.objects && moondreamResponse.objects.length > 0) {
      usageRecord.confidence = moondreamResponse.objects[0].confidence;
    } else if (moondreamResponse.points && moondreamResponse.points.length > 0) {
      usageRecord.confidence = moondreamResponse.points[0].confidence;
    }

    await usageRecord.save();

    // Step 5: Get usage summary for response
    const usageSummary = await Usage.getUsageSummary();

    // Step 6: Return enriched response
    const response = {
      success: true,
      skill,
      params,
      result: moondreamResponse,
      metadata: {
        totalTime: totalDuration,
        dreamTime: dreamDuration,
        timestamp: new Date().toISOString()
      },
      usage: usageSummary
    };

    logger.info('Dream request completed successfully', {
      skill,
      totalTime: totalDuration,
      dreamTime: dreamDuration
    });

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Dream request failed', error);

    // Mark usage record as failed if it exists
    if (usageRecord) {
      try {
        await usageRecord.markError(error.message);
      } catch (dbError) {
        logger.error('Failed to update usage record', dbError);
      }
    }

    // Return appropriate error response
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Increase body size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} 