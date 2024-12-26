import multer from 'multer';

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique file name
  },
});

const upload = multer({ storage });

export default upload;