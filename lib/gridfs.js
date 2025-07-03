import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';

const mongoURI = process.env.MONGODB_URI;

// Init storage engine for datasets bucket
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => ({
    bucketName: 'datasets',
    filename: `${Date.now()}-${file.originalname}`,
  }),
});

export const upload = multer({ storage });
export let gfs;

mongoose.connection.on('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'datasets',
  });
}); 