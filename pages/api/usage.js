import connectToDatabase from '../../lib/mongodb.js';
import Usage from '../../models/Usage.js';
import logger from '../../lib/logger.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Extract query parameters
    const { 
      timeRange = '7', 
      limit = '10',
      detailed = 'false' 
    } = req.query;

    const timeRangeDays = parseInt(timeRange);
    const historyLimit = parseInt(limit);
    const includeDetailed = detailed === 'true';

    logger.info('Fetching usage analytics', { 
      timeRangeDays, 
      historyLimit, 
      includeDetailed 
    });

    // Get usage summary
    const summary = await Usage.getUsageSummary(timeRangeDays);
    
    // Get recent history
    const recentHistory = await Usage.getRecentHistory(historyLimit);

    // Prepare response
    const response = {
      success: true,
      summary,
      recentHistory: recentHistory.map(record => ({
        id: record._id,
        prompt: record.prompt.length > 100 
          ? record.prompt.substring(0, 100) + '...' 
          : record.prompt,
        skill: record.skill,
        timestamp: record.timestamp,
        responseTime: record.responseTime,
        success: record.success,
        confidence: record.confidence
      })),
      metadata: {
        timeRange: timeRangeDays,
        historyLimit,
        timestamp: new Date().toISOString()
      }
    };

    // Add detailed analytics if requested
    if (includeDetailed) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRangeDays);

      // Daily usage trends
      const dailyTrends = await Usage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            totalCalls: { $sum: 1 },
            successfulCalls: {
              $sum: { $cond: ['$success', 1, 0] }
            },
            avgResponseTime: { $avg: '$responseTime' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      // Performance metrics by skill
      const skillPerformance = await Usage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            success: true
          }
        },
        {
          $group: {
            _id: '$skill',
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            minResponseTime: { $min: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' },
            avgConfidence: { $avg: '$confidence' }
          }
        }
      ]);

      // Error analysis
      const errorAnalysis = await Usage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            success: false
          }
        },
        {
          $group: {
            _id: '$errorMessage',
            count: { $sum: 1 },
            skill: { $first: '$skill' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      response.detailed = {
        dailyTrends: dailyTrends.map(trend => ({
          date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
          totalCalls: trend.totalCalls,
          successfulCalls: trend.successfulCalls,
          successRate: Math.round((trend.successfulCalls / trend.totalCalls) * 100),
          avgResponseTime: Math.round(trend.avgResponseTime)
        })),
        skillPerformance: skillPerformance.map(perf => ({
          skill: perf._id,
          count: perf.count,
          avgResponseTime: Math.round(perf.avgResponseTime),
          minResponseTime: Math.round(perf.minResponseTime),
          maxResponseTime: Math.round(perf.maxResponseTime),
          avgConfidence: perf.avgConfidence ? Math.round(perf.avgConfidence * 100) : null
        })),
        errorAnalysis: errorAnalysis.map(error => ({
          errorMessage: error._id || 'Unknown error',
          count: error.count,
          skill: error.skill
        }))
      };
    }

    logger.info('Usage analytics fetched successfully', {
      totalRecords: summary.totalCalls,
      historyRecords: recentHistory.length,
      includeDetailed
    });

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Usage analytics request failed', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch usage data'
    });
  }
} 