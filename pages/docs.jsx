import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout.jsx';
import Link from 'next/link';

export default function Docs() {
  const quickCli = `curl -X POST /api/dream \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Describe the image","image":"<base64>"}'`;

  const trainCli = `npx dreamforge train \
  --dataset ./my-data.zip \
  --reward iou \
  --curriculum retail-detection`;

  return (
    <>
      <Head>
        <title>DreamForge – Documentation</title>
      </Head>
      <Layout>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">DreamForge Documentation</h1>
            <p className="mt-4 text-lg text-white/90">Everything you need to dream, fine-tune, and deploy vision models.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="#usage" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md font-medium transition-colors">Using the Model</Link>
              <Link href="#training" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md font-medium transition-colors">Training Wizard</Link>
            </div>
          </div>
        </section>

        {/* Content wrapper */}
        <section className="max-w-5xl mx-auto px-4 py-16 space-y-24">
          {/* Usage Section */}
          <article id="usage" className="scroll-mt-24 bg-white/70 dark:bg-black/50 backdrop-blur-lg p-8 rounded-xl shadow-lg prose dark:prose-invert">
            <h2>Using the DreamForge Model</h2>
            <p>Follow these steps to generate vision insights with the default Moondream model.</p>

            <h3>1. The Prompt Form</h3>
            <ol>
              <li>Navigate to the <Link href="/">Home page</Link>.</li>
              <li>Enter a natural-language task (e.g. <em>"Count the number of cars"</em>) and upload / paste an image.</li>
              <li>Click <strong>Dream</strong> to run inference. Depending on the task the response will be a caption, detection boxes, or keypoints.</li>
              <li>Results appear in an overlay; download JSON or copy to clipboard.</li>
            </ol>

            <h3>2. Analytics Dashboard</h3>
            <p>All calls are logged. Head to <Link href="/usage">/usage</Link> to view KPIs like total calls, avg latency, and per-skill breakdown.</p>

            <h3>3. Programmatic Access</h3>
            <pre className="whitespace-pre-wrap text-xs bg-gray-900 text-green-200 p-4 rounded-lg overflow-x-auto">
{quickCli}
            </pre>
            <p>The <code>/api/dream</code> route performs the same steps the UI does—prompt refinement with Claude, fallback rules, then Moondream inference.</p>
          </article>

          {/* Training Section */}
          <article id="training" className="scroll-mt-24 bg-white/70 dark:bg-black/50 backdrop-blur-lg p-8 rounded-xl shadow-lg prose dark:prose-invert">
            <h2>Training Wizard</h2>
            <p>Fine-tune your own model in four guided steps.</p>

            <h3>Step-by-Step</h3>
            <ol>
              <li><strong>Dataset</strong> – Upload a ZIP or paste a cloud URL.</li>
              <li><strong>Reward</strong> – Pick a preset from the card library. Filters help narrow by trade-off or domain.</li>
              <li><strong>Advanced</strong> – (Optional) Expand the accordion to tweak JS or auto-suggest with Claude.</li>
              <li><strong>Launch</strong> – Choose a curriculum template and hit <em>Launch Training Job</em>.</li>
            </ol>

            <h3>Preset Library Tips</h3>
            <ul>
              <li>Search or filter by tags like <code>segmentation</code> or <code>high-recall</code>.</li>
              <li>Click a card to inject its code into the editor. Edit as needed.</li>
            </ul>

            <h3>CLI Equivalent</h3>
            <pre className="whitespace-pre-wrap text-xs bg-gray-900 text-cyan-200 p-4 rounded-lg overflow-x-auto">
{trainCli}
            </pre>

            <h3>Need more depth?</h3>
            <p>The full training API, worker setup, and troubleshooting steps are covered in the <Link href="/train-guide">detailed guide</Link>.</p>
          </article>
        </section>
      </Layout>
    </>
  );
} 