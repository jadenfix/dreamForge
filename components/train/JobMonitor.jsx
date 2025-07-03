import React, { useState } from 'react';
import useTrainingJobStatus from '../../hooks/useTrainingJobStatus.js';

export default function JobMonitor({ jobId }) {
  const { status, loading, error } = useTrainingJobStatus(jobId);
  const [testPrompt, setTestPrompt] = useState('What do you see in this image?');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testModel = async () => {
    if (!status?.deploymentInfo?.modelId) return;
    
    setTesting(true);
    try {
      const res = await fetch(`/api/models/predict?modelId=${status.deploymentInfo.modelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=' // Small test image
        })
      });
      
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (!jobId) return null;
  if (loading) return <p className="text-sm">Loading status…</p>;
  if (error) return <p className="text-sm text-red-500">{error.message}</p>;

  return (
    <div className="glass-card p-4 space-y-4 mt-4">
      <h3 className="font-semibold">Job Status</h3>
      
      {/* Status and Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm">State: <span className={`font-medium ${
            status.status === 'completed' ? 'text-green-600' : 
            status.status === 'failed' ? 'text-red-600' : 
            status.status === 'running' ? 'text-blue-600' : 'text-gray-600'
          }`}>{status.status}</span></p>
          {status.status === 'running' && (
            <p className="text-xs text-gray-500">ETA: {status.eta ?? '--'}s</p>
          )}
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-gradient-start to-gradient-end h-full transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">{status.progress}%</p>
      </div>

      {/* Deployment Info */}
      {status.deploymentInfo && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🚀 Model Deployed!</h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <p><strong>Model ID:</strong> {status.deploymentInfo.modelId}</p>
            <p><strong>Endpoint:</strong> <code className="bg-green-100 dark:bg-green-800 px-1 rounded">{status.deploymentInfo.endpoint}</code></p>
            <p><strong>Deployed:</strong> {new Date(status.deploymentInfo.deployedAt).toLocaleString()}</p>
            
            {/* Model Test Interface */}
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
              <h5 className="font-medium mb-2">Test Your Model</h5>
              <div className="space-y-2">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a prompt to test your model..."
                  className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-md bg-white dark:bg-green-900/30 text-sm"
                />
                <button
                  onClick={testModel}
                  disabled={testing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Model'}
                </button>
              </div>
              
              {testResult && (
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-800/30 rounded-md">
                  <h6 className="font-medium mb-1">Model Response:</h6>
                  {testResult.error ? (
                    <p className="text-red-600 text-sm">{testResult.error}</p>
                  ) : (
                    <div className="text-sm">
                      <p><strong>Task:</strong> {testResult.response?.task}</p>
                      <p><strong>Response:</strong> {testResult.response?.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Confidence: {(testResult.metadata?.confidence * 100).toFixed(1)}% | 
                        Time: {testResult.metadata?.inferenceTime?.toFixed(0)}ms
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Training Logs */}
      <div>
        <h4 className="font-medium mb-2">Training Logs</h4>
        <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md h-32 overflow-y-auto text-xs font-mono">
          {status.logs?.slice(-15).join('\n') || 'No logs available'}
        </pre>
      </div>
    </div>
  );
} 