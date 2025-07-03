import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout.jsx';
import Link from 'next/link';

export default function TrainGuide() {
  const customPresetSnippet = `// lib/rewardFunctions.js
export const rewardFunctions = [
  // ...existing
  {
    id: 'my_metric',
    name: 'My Custom Metric',
    description: 'Explain the metric',
    code: \`module.exports = (pred, gt) => {/* ... */};\`,
    tradeoffs: ['edge-friendly'],
    useCases: ['gesture-control'],
  },
];`;

  const cliSnippet = `npx dreamforge train \
  --dataset ./my-data.zip \
  --reward iou \
  --curriculum retail-detection`;

  return (
    <>
      <Head>
        <title>DreamForge – Training Guide</title>
      </Head>
      <Layout>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">DreamForge Training Guide</h1>
            <p className="mt-4 text-lg text-white/90">Fine-tune vision models in just four steps.</p>
            <Link href="/train" className="inline-block mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md font-medium transition-colors">
              Open Training Wizard →
            </Link>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <article className="prose dark:prose-invert prose-headings:scroll-mt-24 prose-code:after:content-none prose-code:before:content-none bg-white/70 dark:bg-black/50 backdrop-blur-lg p-8 rounded-xl shadow-lg">
            <p>This guide walks you through fine-tuning a vision model with DreamForge's curriculum-plus-RLHF pipeline.</p>

            <blockquote>
              <p>The training flow currently runs a mock worker that simulates progress. The interface and API are production-ready—swap in a real worker when you have GPU capacity.</p>
            </blockquote>

            <h2>1. Quick Start (UI)</h2>
            <ol>
              <li>Open the <strong>/train</strong> page.</li>
              <li>Step through the wizard:
                <ol>
                  <li><strong>Dataset</strong> – upload a ZIP or paste a cloud URL (S3/GS/HTTPS).</li>
                  <li><strong>Reward</strong> – pick a preset from the card grid.</li>
                  <li><strong>Advanced</strong> – optionally tweak the JS or ask Claude to auto-suggest.</li>
                  <li><strong>Launch</strong> – choose a curriculum template and press "Launch Training Job".</li>
                </ol>
              </li>
              <li>Watch the live progress bar and logs in the Job Monitor.</li>
            </ol>

            <h2>2. Reward Function Library</h2>
            <p>The preset library contains 8 industry-grade reward functions. Use the search box or filter chips to narrow by <em>trade-offs</em> (e.g. high-recall) and <em>use cases</em> (e.g. segmentation).</p>

            <h3>Adding your own preset</h3>
            <pre className="whitespace-pre-wrap text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{customPresetSnippet}
            </pre>

            <h2>3. API Endpoints</h2>
            <table>
              <thead>
                <tr><th>Route</th><th>Method</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td>/api/train</td><td>POST</td><td>Enqueue a job. Body: <code>{`{ dataset, rewardFnId?, rewardCode?, curriculum }`}</code></td></tr>
                <tr><td>/api/train/status</td><td>GET</td><td>Poll job progress.</td></tr>
                <tr><td>/api/train/introspect</td><td>POST</td><td>Lightweight dataset introspection.</td></tr>
                <tr><td>/api/train/schema</td><td>GET</td><td>Returns JSON schema for external clients.</td></tr>
              </tbody>
            </table>

            <h2>4. CLI (Experimental)</h2>
            <pre className="whitespace-pre-wrap text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{cliSnippet}
            </pre>

            <h2>5. Worker & Queue</h2>
            <ul>
              <li><strong>Queue</strong>: BullMQ backed by Redis (falls back to in-memory).</li>
              <li><strong>Worker</strong>: <code>lib/trainWorker.js</code> – replace mock logic with real training.</li>
              <li>Run locally: <code>npm run worker</code>.</li>
            </ul>

            <h2>6. Troubleshooting</h2>
            <p>Common issues & fixes:</p>
            <ul>
              <li><em>MongoDB connection errors</em> – ensure <code>MONGODB_URI</code> is set & IP whitelisted.</li>
              <li><em>Redis refused</em> – start Redis or enable the "Run without Redis" toggle in dev settings.</li>
              <li><em>Worker idle</em> – run <code>npm run worker</code> and set <code>PROCESS_JOBS=true</code>.</li>
            </ul>

            <h2>7. Next Steps</h2>
            <ul>
              <li>Swap the mock worker with a real Python pipeline (<code>run_pipeline.py</code>).</li>
              <li>Add webhooks for job-complete notifications.</li>
              <li>Implement result comparison to visualise model improvements.</li>
            </ul>
          </article>
        </section>
      </Layout>
    </>
  );
} 