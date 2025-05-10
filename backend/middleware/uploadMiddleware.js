import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Explicitly list allowed mime types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1 // Allow only 1 file
  }
});

// Middleware wrapper for better error handling
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'fail',
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File too large (max 2MB)' 
        : 'Invalid file type or upload error'
    });
  } else if (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server upload error'
    });
  }
  next();
};

export default upload;