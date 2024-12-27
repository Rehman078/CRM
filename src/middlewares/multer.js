import multer from 'multer';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // Set your uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Save with unique filename
  }
});

const upload = multer({ storage });

export default upload;
