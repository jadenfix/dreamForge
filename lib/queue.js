import { Queue, Worker } from 'bullmq';
import EventEmitter from 'events';
import logger from './logger.js';

const QUEUE_NAME = 'training';

const isRedisAvailable = process.env.REDIS_URL && process.env.NO_REDIS !== 'true';

class MemoryQueue extends EventEmitter {
  async add(name, data) {
    const id = Date.now().toString();
    const job = { id, name, data };
    setImmediate(() => this.emit('job', job));
    return { id };
  }
}

let queue;

if (isRedisAvailable) {
  queue = new Queue(QUEUE_NAME, { connection: { url: process.env.REDIS_URL } });
  logger.info('Initialized BullMQ training queue');
} else {
  queue = new MemoryQueue();
  logger.warn('Redis unavailable – using in-memory queue (dev only)');
}

export const addTrainingJob = async (data) => queue.add('train', data);

export const startTrainingWorker = (processor) => {
  if (queue instanceof MemoryQueue) {
    queue.on('job', processor);
  } else {
    return new Worker(QUEUE_NAME, processor, { connection: { url: process.env.REDIS_URL } });
  }
}; 