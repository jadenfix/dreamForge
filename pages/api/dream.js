import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';
import moondreamClient from '../../lib/moondreamClient.js';
import refineRules from '../../lib/refineRules.js';
import logger from '../../lib/logger.js';
import { addUsageRecord, getUsageCount, getSuccessfulUsageCount } from '../../lib/inMemoryStorage.js';

// Validation schema
const DreamSchema = z.object({
  prompt: z.string().min(1).max(2000),
  image: z.string().min(1), // base64 encoded image
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  let usageRecord = null;

  try {
    logger.info('Processing dream request');

    // Step 1: Validate input
    const { prompt, image } = DreamSchema.parse(req.body);

    // Step 2: First try Anthropic for intelligent routing
    let skill = 'caption'; // default fallback
    let params = {};

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const planRes = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 128,
          temperature: 0.1,
          messages: [{
            role: 'user',
            content: `You are a router for a visual AI system. Given the user request: "${prompt}"
        
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

Choose the most appropriate skill and include relevant parameters.`
          }]
        });

        const planText = planRes.content[0].text.trim();
        const parsedPlan = JSON.parse(planText);

        if (['detect', 'point', 'query', 'caption'].includes(parsedPlan.skill)) {
          skill = parsedPlan.skill;
          params = parsedPlan.params || {};
          logger.info('Anthropic planning successful', { skill, params });
        }
      } catch (anthropicError) {
        logger.warn('Anthropic planning failed, using fallback', anthropicError.message);
      }
    }

    // If Anthropic failed, use local rules
    if (skill === 'caption' && Object.keys(params).length === 0) {
      const fallback = refineRules(prompt);
      skill = fallback.skill;
      params = fallback.params;
      logger.info('Using fallback rules', { skill, params });
    }

    // Create usage record (in memory if MongoDB fails)
    const usageData = {
      prompt,
      skill,
      parameters: params,
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
      timestamp: new Date(),
      success: true
    };

    // Try to use MongoDB first
    try {
      const connectToDatabase = (await import('../../lib/mongodb.js')).default;
      const Usage = (await import('../../models/Usage.js')).default;
      
      await connectToDatabase();
      usageRecord = new Usage(usageData);
      logger.info('Using MongoDB for usage tracking');
    } catch (dbError) {
      // Fall back to in-memory storage
      usageRecord = {
        ...usageData,
        save: async function() {
          this.responseTime = this.responseTime || 0;
          this.resultSize = this.resultSize || 0;
          this.confidence = this.confidence || null;
          addUsageRecord(this);
          logger.info('Saved usage data to memory store');
        },
        markError: async function(errorMessage) {
          this.success = false;
          this.errorMessage = errorMessage;
          await this.save();
        }
      };
      logger.warn('MongoDB unavailable, using in-memory storage');
    }

    // Step 3: Convert base64 to buffer for Moondream
    const imageBuffer = Buffer.from(image, 'base64');
    
    // Step 4: Call Moondream API
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

    /* -----------------------------------
     *  Second Anthropic "Verifier" step
     * -----------------------------------*/
    let verified = true;
    let feedback = '';

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropicVerifier = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const verifierRes = await anthropicVerifier.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 128,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: 'You are a strict visual QA verifier.'
            },
            {
              role: 'user',
              content: `User prompt: "${prompt}"
Moondream raw response JSON:\n\n\`
${JSON.stringify(moondreamResponse, null, 2)}\n\`

Return JSON: { "verified": true|false, "feedback": "string" }`
            }
          ]
        });

        const verifierText = verifierRes.content[0].text.trim();
        const parsedVerifier = JSON.parse(verifierText);

        if (typeof parsedVerifier.verified === 'boolean') {
          verified = parsedVerifier.verified;
          feedback = parsedVerifier.feedback || '';
        }
      } catch (verErr) {
        logger.warn('Anthropic verifier failed, defaulting to verified=true', verErr.message);
      }
    }

    /* -----------------------------------
     *  Anthropic "Insight" step – generate narrative explanation
     * -----------------------------------*/
    let analysis = null;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropicAnalyzer = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const analyzerRes = await anthropicAnalyzer.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          temperature: 0.5,
          messages: [
            {
              role: 'system',
              content: 'You are an expert vision assistant that turns raw computer-vision JSON into rich, user-friendly explanations. Return JSON only.'
            },
            {
              role: 'user',
              content: `The user asked: "${prompt}"
Skill used: ${skill}
Raw VLM JSON:\n${JSON.stringify(moondreamResponse)}\n\nReturn JSON with shape:\n{ "explanation": string, "insights": string[], "followUp": string[] }`
            }
          ]
        });

        const analyzerText = analyzerRes.content[0].text.trim();
        const parsedAnalysis = JSON.parse(analyzerText);

        if (parsedAnalysis.explanation) {
          analysis = parsedAnalysis;
        }
      } catch (analysisErr) {
        logger.warn('Anthropic analysis failed', analysisErr.message);
      }
    }

    // -----------------------------------
    const totalDuration = Date.now() - startTime;

    // Step 5: Update usage record with results
    usageRecord.responseTime = totalDuration;
    usageRecord.resultSize = JSON.stringify(moondreamResponse).length;
    usageRecord.success = verified; // mark success according to verification
    
    // Extract confidence if available
    if (moondreamResponse.confidence) {
      usageRecord.confidence = moondreamResponse.confidence;
    } else if (moondreamResponse.objects && moondreamResponse.objects.length > 0) {
      usageRecord.confidence = moondreamResponse.objects[0].confidence;
    } else if (moondreamResponse.points && moondreamResponse.points.length > 0) {
      usageRecord.confidence = moondreamResponse.points[0].confidence;
    }

    await usageRecord.save();

    // Step 6: Get usage summary for response
    let usageSummary = {
      totalCalls: getUsageCount(),
      successRate: Math.round((getSuccessfulUsageCount() / Math.max(getUsageCount(), 1)) * 100),
      skillBreakdown: {},
      timeRange: 7
    };

    // Step 7: Return enriched response
    const response = {
      success: true,
      skill,
      params,
      result: moondreamResponse,
      verified,
      feedback,
      metadata: {
        totalTime: totalDuration,
        dreamTime: dreamDuration,
        timestamp: new Date().toISOString(),
        dataStorage: usageRecord.save.toString().includes('inMemoryUsageData') ? 'memory' : 'mongodb'
      },
      usage: usageSummary,
      analysis: analysis
    };

    logger.info('Dream request completed successfully', {
      skill,
      totalTime: totalDuration,
      dreamTime: dreamDuration,
      dataStorage: response.metadata.dataStorage
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
      message: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? error.message : 'Something went wrong'
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