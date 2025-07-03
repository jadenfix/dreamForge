import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout.jsx';
import RewardBuilder from '../components/train/RewardBuilder.jsx';
import CurriculumConfigurator from '../components/train/CurriculumConfigurator.jsx';
import JobMonitor from '../components/train/JobMonitor.jsx';
import DatasetUploader from '../components/train/DatasetUploader.jsx';
import toast from 'react-hot-toast';
import Stepper from '../components/train/Stepper.jsx';
import RewardPresetLibrary from '../components/train/RewardPresetLibrary.jsx';
import GoalDefinition from '../components/train/GoalDefinition.jsx';

export default function Train() {
  const [dataset, setDataset] = useState('');
  const [reward, setReward] = useState('');
  const [curriculum, setCurriculum] = useState([]);
  const [goalCurriculum, setGoalCurriculum] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [step, setStep] = useState(0); // 0: dataset,1:preset,2:goal,3:launch

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
        body: JSON.stringify({ datasetId: dataset, rewardFnId: selectedPreset?.id, curriculum: goalCurriculum }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Training started');
        setJobId(data.jobId);
        setStep(4); // done
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Dataset', 'Reward', 'Goal', 'Launch'];

  const cliSnippet = `npx dreamforge train \
  --dataset ${dataset || './my-data.zip'} \
  --reward ${selectedPreset ? selectedPreset.id : 'reward.js'} \
  --curriculum [${curriculum.join(',')}]`;

  return (
    <>
      <Head>
        <title>DreamForge – Fine-Tune Model</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Fine-Tune Your Vision Model</h1>

          {/* Stepper */}
          <Stepper steps={steps} current={step} />

          {/* Step content */}
          {step === 0 && (
            <div className="space-y-6">
              <DatasetUploader value={dataset} onChange={handleDatasetChange} />
              <div className="flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => setStep(1)}
                  disabled={!dataset}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <RewardPresetLibrary
                selectedId={selectedPreset?.id}
                onSelect={(fn) => {
                  setSelectedPreset(fn);
                  setReward(fn.code);
                }}
              />
              <div className="flex justify-between">
                <button className="btn-secondary" onClick={() => setStep(0)}>
                  Back
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!selectedPreset}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <GoalDefinition value={goalCurriculum} onChange={setGoalCurriculum} datasetDesc={dataset} rewardName={selectedPreset?.name} />

              <div className="flex justify-between">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn-primary" onClick={() => setStep(3)} disabled={goalCurriculum.length===0}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <CurriculumConfigurator value={curriculum} onChange={setCurriculum} />

              <button
                className="btn-primary w-full py-3 text-lg"
                onClick={launchTraining}
                disabled={loading || curriculum.length === 0}
              >
                {loading ? 'Launching…' : 'Launch Training Job'}
              </button>

              {/* CLI snippet */}
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
{cliSnippet}
              </pre>

              <div className="flex justify-start">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Job monitor always visible if jobId */}
          <JobMonitor jobId={jobId} />
        </div>
      </Layout>
    </>
  );
} 