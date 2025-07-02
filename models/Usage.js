import mongoose from 'mongoose';

const UsageSchema = new mongoose.Schema({
  // Core request information
  prompt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  skill: {
    type: String,
    required: true,
    enum: ['detect', 'point', 'query', 'caption'],
    index: true
  },
  
  // Performance metrics
  responseTime: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Additional metadata
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Success/Error tracking
  success: {
    type: Boolean,
    default: true,
    index: true
  },
  errorMessage: {
    type: String,
    default: null
  },
  
  // User context (optional)
  userAgent: String,
  ipAddress: String,
  
  // Results metadata (without storing actual results)
  resultSize: Number,
  confidence: Number,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
UsageSchema.index({ timestamp: -1 }); // Recent first
UsageSchema.index({ skill: 1, timestamp: -1 }); // By skill and time
UsageSchema.index({ success: 1, timestamp: -1 }); // Success rate tracking

// Virtual for formatted date
UsageSchema.virtual('formattedDate').get(function() {
  return this.timestamp.toLocaleDateString();
});

// Static methods for analytics
UsageSchema.statics.getUsageSummary = async function(timeRange = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);
  
  const pipeline = [
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$skill',
        count: { $sum: 1 },
        avgResponseTime: { $avg: { $ifNull: ['$responseTime', 0] } },
        successRate: {
          $avg: { $cond: [{ $ifNull: ['$success', true] }, 1, 0] }
        },
        avgConfidence: { $avg: { $ifNull: ['$confidence', null] } }
      }
    }
  ];
  
  const skillStats = await this.aggregate(pipeline);
  
  // Get total counts with proper null handling
  const totalCalls = await this.countDocuments({
    timestamp: { $gte: startDate }
  });
  
  const successfulCalls = await this.countDocuments({
    timestamp: { $gte: startDate },
    success: { $ne: false } // Count true and null as successful
  });
  
  return {
    totalCalls: totalCalls || 0,
    successfulCalls: successfulCalls || 0,
    successRate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0,
    skillBreakdown: skillStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count || 0,
        avgResponseTime: Math.round(stat.avgResponseTime || 0),
        successRate: Math.round((stat.successRate || 0) * 100),
        avgConfidence: stat.avgConfidence ? Math.round(stat.avgConfidence * 100) : null
      };
      return acc;
    }, {}),
    timeRange: timeRange
  };
};

UsageSchema.statics.getRecentHistory = async function(limit = 10) {
  return this.find({}, {
    prompt: 1,
    skill: 1,
    timestamp: 1,
    responseTime: 1,
    success: 1,
    confidence: 1
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

// Instance methods
UsageSchema.methods.markError = function(errorMessage) {
  this.success = false;
  this.errorMessage = errorMessage;
  return this.save();
};

const Usage = mongoose.models.Usage || mongoose.model('Usage', UsageSchema);

export default Usage; 