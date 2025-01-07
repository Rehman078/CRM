
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/"); //
  },
 
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Save with unique filename
  }
});

const upload = multer({ storage });

export default upload;