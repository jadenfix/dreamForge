import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout.jsx';
import RewardBuilder from '../components/train/RewardBuilder.jsx';
import CurriculumConfigurator from '../components/train/CurriculumConfigurator.jsx';
import JobMonitor from '../components/train/JobMonitor.jsx';
import DatasetUploader from '../components/train/DatasetUploader.jsx';
import { Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export default function Train() {
  const [dataset, setDataset] = useState('');
  const [reward, setReward] = useState('');
  const [curriculum, setCurriculum] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);

  // Introspect dataset path and prefill reward when changed
  const introspect = async (ds) => {
    if (!ds) return;
    try {
      const res = await fetch('/api/train/introspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset: ds }),
      });
      const data = await res.json();
      if (data.hasBBoxes && reward.trim() === '') {
        setReward('module.exports = (pred, gt) => IoU(pred.bbox, gt.bbox);');
      }
    } catch (err) {
      /* silent fail */
    }
  };

  const handleDatasetChange = (val) => {
    setDataset(val);
    introspect(val);
  };

  const launchTraining = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset, rewardFnId: null, curriculum }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Training started');
        setJobId(data.jobId);
        setFormCollapsed(true);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>DreamForge – Fine-Tune Model</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fine-Tune Your Vision Model</h1>

          <DatasetUploader value={dataset} onChange={handleDatasetChange} />

          <Transition
            show={!formCollapsed}
            enter="transition transform duration-500"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition transform duration-300"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="space-y-8">
              <RewardBuilder value={reward} onChange={setReward} />

              <CurriculumConfigurator value={curriculum} onChange={setCurriculum} />

              <button
                className="btn-primary"
                onClick={launchTraining}
                disabled={loading || !dataset || curriculum.length === 0}
              >
                {loading ? 'Launching…' : 'Launch Training Job'}
              </button>
            </div>
          </Transition>

          {/* Job monitor */}
          <JobMonitor jobId={jobId} />
        </div>
      </Layout>
    </>
  );
} 