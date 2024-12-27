import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  note: { type: String, required: true, max: 500 },
  original_name: { type: String, required: true },
  current_name: { type: String, required: true },
  type: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String,
     enum: ["Contact", "Lead", "Activity"],
    required: true
    },
  source_id: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

export default File;
