import multer from 'multer';
import path from 'path';

// store proofs in uploads/ directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `proof_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // accept images and pdf
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

export const uploadProof = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
