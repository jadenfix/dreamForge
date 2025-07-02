// Shared in-memory storage for usage data when MongoDB is unavailable
let inMemoryUsageData = [];

// Add a new usage record
export const addUsageRecord = (record) => {
  inMemoryUsageData.push({
    ...record,
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(record.timestamp)
  });
};

// Get all usage records
export const getUsageRecords = () => {
  return [...inMemoryUsageData];
};

// Get usage records within a time range
export const getUsageRecordsInRange = (days = 7) => {
  const now = new Date();
  const timeRangeStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return inMemoryUsageData.filter(record => 
    new Date(record.timestamp) >= timeRangeStart
  );
};

// Get usage count
export const getUsageCount = () => {
  return inMemoryUsageData.length;
};

// Get successful usage count
export const getSuccessfulUsageCount = () => {
  return inMemoryUsageData.filter(record => record.success).length;
};

// Clear all usage records (for testing)
export const clearUsageRecords = () => {
  inMemoryUsageData = [];
}; 