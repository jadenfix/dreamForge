import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use multer middleware manually
    upload.single('datasetZip')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      console.log('File uploaded:', req.file.filename);
      
      // Return file path as datasetId for now
      res.status(201).json({ 
        datasetId: req.file.filename,
        message: 'File uploaded successfully (temporary storage)',
        size: req.file.size,
        originalName: req.file.originalname
      });
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}; 