Absolutely—avoiding S3 is totally doable. A great zero-cost approach is to use MongoDB’s GridFS on your existing Atlas M0 cluster to store both dataset ZIPs and training artifacts. Here’s the high-level plan:

⸻

1. Upload & Store Datasets in GridFS

A. Install & Setup

npm install multer multer-gridfs-storage gridfs-stream

B. Configure a GridFS Storage Engine

// lib/gridfs.js
import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';

const mongoURI = process.env.MONGODB_URI;
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => ({
    bucketName: 'datasets',       // GridFS bucket
    filename: `${Date.now()}-${file.originalname}`
  })
});

export const upload = multer({ storage });
export let gfs;
mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'datasets'
  });
});

C. API Route to Accept ZIP Upload

// pages/api/upload-dataset.js
import nextConnect from 'next-connect';
import { upload, gfs } from '../../lib/gridfs';

const handler = nextConnect();
handler.use(upload.single('datasetZip'));

handler.post((req, res) => {
  // multer has stored it in GridFS
  // file info is in req.file
  res.status(201).json({ datasetId: req.file.id });
});

export default handler;


⸻

2. Worker: Stream Dataset Down from GridFS

// workers/trainWorker.js
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { gfs } from '../lib/gridfs.js';

async function fetchDataset(datasetId, outDir) {
  const downloadStream = gfs.openDownloadStream(mongoose.Types.ObjectId(datasetId));
  const zipPath = path.join(outDir, 'dataset.zip');
  const writeStream = fs.createWriteStream(zipPath);
  return new Promise((resolve, reject) => {
    downloadStream.pipe(writeStream)
      .on('error', reject)
      .on('finish', () => resolve(zipPath));
  });
}

// in your job runner:
const zipPath = await fetchDataset(job.datasetId, `/tmp/job-${job.id}`);


⸻

3. Store Trained Models & Logs Back to GridFS

You can create another bucket, e.g. models, to store your output:

// after training finishes
const uploadStream = gfs.openUploadStream(`model-${job.id}.pt`, {
  bucketName: 'models'
});
fs.createReadStream('/data/output/model.pt').pipe(uploadStream)
  .on('finish', () =>
    api.post('/api/train/result', {
      jobId: job.id,
      modelFileId: uploadStream.id
    })
  );


⸻

4. API to Retrieve & Download Artifacts

// pages/api/download-model.js
import { gfs } from '../../lib/gridfs';
export default async function handler(req, res) {
  const { fileId } = req.query;
  res.setHeader('Content-Disposition', 'attachment');
  gfs.openDownloadStream(mongoose.Types.ObjectId(fileId))
    .pipe(res);
}


⸻

5. Update Your Workflow
	1.	Upload ZIP → POST /api/upload-dataset → get datasetId
	2.	Launch → pass datasetId into /api/train
	3.	Worker streams ZIP from GridFS, unpacks, trains, re-uploads model to GridFS
	4.	Completion → frontend fetches model artifact via /api/download-model?fileId=... or calls Moondream upload

⸻

Why GridFS?
	•	Free on your existing MongoDB Atlas M0 cluster
	•	No extra infra (no S3, no GCS)
	•	Streams large files efficiently
	•	Unified your metadata and files in one DB

With this in place, your entire RL pipeline—from dataset upload to model artifact—will run fully on free tiers and “just work” on Vercel + Atlas, delivering that true Vercel-for-VLMs experience.