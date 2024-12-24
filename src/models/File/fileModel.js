import mongoose from 'mongoose';
const fileSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true,
    max: 500
  },
  filePath: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

export default mongoose.model('File', fileSchema);
