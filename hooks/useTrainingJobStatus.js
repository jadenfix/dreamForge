import { useEffect, useState } from 'react';

export default function useTrainingJobStatus(jobId, intervalMs = 2000) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let timer;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/train/status?jobId=${jobId}`);
        const data = await res.json();
        setStatus(data);
        setLoading(false);
      } catch (err) {
        setError(err);
      }
    };

    fetchStatus();
    timer = setInterval(fetchStatus, intervalMs);

    return () => clearInterval(timer);
  }, [jobId, intervalMs]);

  return { status, loading, error };
} 