// middleware/upload.js
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'explorer-tours',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage });
export default upload;