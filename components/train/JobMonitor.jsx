import React from 'react';
import useTrainingJobStatus from '../../hooks/useTrainingJobStatus.js';

export default function JobMonitor({ jobId }) {
  const { status, loading, error } = useTrainingJobStatus(jobId);

  if (!jobId) return null;
  if (loading) return <p className="text-sm">Loading status…</p>;
  if (error) return <p className="text-sm text-red-500">{error.message}</p>;

  return (
    <div className="glass-card p-4 space-y-2 mt-4">
      <h3 className="font-semibold">Job Status</h3>
      <p className="text-sm">State: {status.status}</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-gradient-start to-gradient-end h-full"
          style={{ width: `${status.progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{status.progress}% • ETA: {status.eta ?? '--'}s</p>
      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md h-32 overflow-y-auto text-xs">
        {status.logs.slice(-10).join('\n')}
      </pre>
    </div>
  );
} 