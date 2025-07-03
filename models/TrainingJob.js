import mongoose from 'mongoose';

const TrainingJobSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
    },
    progress: {
      type: Number,
      default: 0,
    },
    eta: {
      type: Number, // seconds remaining estimate
      default: null,
    },
    dataset: String, // S3 / GCS path or uploaded ID
    rewardFnId: String, // optional reference to reward function
    curriculum: mongoose.Schema.Types.Mixed, // JSON representing curriculum stages
    logs: {
      type: [String],
      default: [],
    },
    error: String,
  },
  { timestamps: true }
);

export default mongoose.models.TrainingJob || mongoose.model('TrainingJob', TrainingJobSchema); 