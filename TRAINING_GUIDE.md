# DreamForge Training Guide

This guide walks you through **fine-tuning a vision model** with DreamForge's built-in curriculum-plus-RLHF pipeline.

> ⚠️  The training flow currently **runs a mock worker** that simulates progress.  The interface and API, however, are production-ready—swap in a real worker when you have GPU capacity.

---

## 1. Quick Start (UI)

1. Navigate to **/train** in the web app.
2. **Select / Upload a Dataset**
   - *Local ZIP* – drag-and-drop images & labels.
   - *Cloud URL* – enter an `s3://`, `gs://` or public `https://` path.
3. **Pick / Build a Reward Function**
   - Either type JavaScript directly **or** choose a preset from the **Reward Function Library**.
4. **Design a Curriculum** (drag & drop stages):
   - *Pre-training*, *Domain Adaptation*, *RLHF*, *Evaluation*.
5. Click **"Launch Training Job"**.  A job card appears with live logs & a progress bar.

## 2. Reward Function Library

`RewardBuilder` now ships with a searchable library of 8 industry-grade reward functions (see [`lib/rewardFunctions.js`](./lib/rewardFunctions.js)).

Filter presets by:

* **Trade-Offs** – e.g. `balanced`, `high-recall`, `fast-compute`.
* **Use Cases** – e.g. `object-detection`, `segmentation`, `captioning`.

Click a card to inject its code into the editor.  You can then edit or extend it before launch.

### Adding Your Own Preset

Simply append an object to the exported `rewardFunctions` array:

```js
{
  id: "my_metric",
  name: "My Custom Metric",
  description: "Explains what this metric measures",
  code: `module.exports = (pred, gt) => {/* … */};`,
  tradeoffs: ["low-latency", "edge-friendly"],
  useCases: ["mobile", "gesture-control"],
}
```

The UI will auto-pick it up.

---

## 3. API Endpoints

| Route | Method | Description |
| ----- | ------ | ----------- |
| `/api/train` | `POST` | Enqueue a training job. **Body**: `{ dataset, rewardFnId?, rewardCode?, curriculum }` |
| `/api/train/status` | `GET` | Poll job progress: `/api/train/status?jobId=…` |
| `/api/train/introspect` | `POST` | Lightweight dataset introspection to pre-fill rewards. |
| `/api/train/schema` | `GET` | JSON schema for valid request bodies (for external clients). |

### Example cURL

```bash
curl -X POST https://your-site.vercel.app/api/train \
  -H 'Content-Type: application/json' \
  -d '{
    "dataset": "gs://my-bucket/images/",
    "rewardFnId": "iou",
    "curriculum": ["warmup", "rlhf"]
  }'
```

---

## 4. Worker & Queue

* **Queue:** BullMQ backed by Redis (falls back to in-memory for local dev).
* **Worker Script:** [`lib/trainWorker.js`](./lib/trainWorker.js) – replace mock logic with real training commands.
* Run locally: `npm run worker`.

---

## 5. CLI (Experimental)

```bash
npx dreamforge train \
  --dataset gs://my-bucket/images/ \
  --reward iou \
  --epochs 5 3 2
```

The CLI is a thin wrapper that calls the same `/api/train` endpoint.

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| *MongoDB connection errors* | Ensure `MONGODB_URI` is set & IP whitelisted.  The app will fall back to in-memory storage but analytics & job logs won't persist. |
| *Redis connection refused* | Start Redis (`brew services start redis`) **or** enable the "Run without Redis" toggle in dev settings. |
| *Worker not picking up jobs* | Verify `npm run worker` is running and that `PROCESS_JOBS=true` is set in the environment. |

---

## 7. Next Steps

1. Swap the mock worker with a real Python pipeline (`run_pipeline.py`).
2. Add **webhooks** to receive a `POST` when training completes.
3. Implement **result comparison** to visualise improvement over base models.

Happy fine-tuning! 