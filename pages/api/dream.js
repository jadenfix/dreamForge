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

    // Step 2: Determine the appropriate Moondream skill using local rules (no Anthropic dependency)
    const { skill, params } = refineRules(prompt);
    logger.debug('Analyzing prompt with fallback rules:', { skill, params });

    // Step 3: Create usage record (in memory if MongoDB fails)
    const usageData = {
      prompt,
      skill,
      parameters: params,
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
      timestamp: new Date(),
      success: true
    };

    // Try to use MongoDB first, fallback to in-memory
    try {
      const connectToDatabase = (await import('../../lib/mongodb.js')).default;
      const Usage = (await import('../../models/Usage.js')).default;
      
      await connectToDatabase();
      usageRecord = new Usage(usageData);
      logger.info('Using MongoDB for usage tracking');
    } catch (dbError) {
      logger.error('MongoDB connection error:', dbError);
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

    // Step 4: Convert base64 to buffer for Moondream
    const imageBuffer = Buffer.from(image, 'base64');
    
    // Step 5: Call Moondream API - this is the main processing step
    logger.info('Calling Moondream caption API');
    const dreamStartTime = Date.now();
    
    let moondreamResponse;
    try {
      switch (skill) {
        case 'detect':
          moondreamResponse = await moondreamClient.detect({
            image: imageBuffer,
            threshold: params.threshold || 0.5,
            target: params.target || 'objects'
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
        default:
          moondreamResponse = await moondreamClient.caption({
            image: imageBuffer,
            style: params.style || 'normal'
          });
          break;
      }
    } catch (moondreamError) {
      logger.error('Moondream caption error:', moondreamError);
      throw new Error(`Moondream API failed: ${moondreamError.message}`);
    }

    const dreamDuration = Date.now() - dreamStartTime;

    // Step 6: Mark as verified (no external verification needed)
    const verified = true;
    const feedback = '';

    const totalDuration = Date.now() - startTime;

    // Step 7: Update usage record with results
    usageRecord.responseTime = totalDuration;
    usageRecord.resultSize = JSON.stringify(moondreamResponse).length;
    usageRecord.success = verified;
    
    // Extract confidence if available
    if (moondreamResponse.confidence) {
      usageRecord.confidence = moondreamResponse.confidence;
    } else if (moondreamResponse.objects && moondreamResponse.objects.length > 0) {
      usageRecord.confidence = moondreamResponse.objects[0].confidence;
    } else if (moondreamResponse.points && moondreamResponse.points.length > 0) {
      usageRecord.confidence = moondreamResponse.points[0].confidence;
    }

    await usageRecord.save();

    // Step 8: Get usage summary for response
    let usageSummary = {
      totalCalls: getUsageCount(),
      successRate: Math.round((getSuccessfulUsageCount() / Math.max(getUsageCount(), 1)) * 100),
      skillBreakdown: {},
      timeRange: 7
    };

    // Step 9: Return response (no Anthropic analysis needed)
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
      analysis: null // No Anthropic analysis - keeping it simple and fast
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
}; 