import mongoose from 'mongoose';

const contactFileSchema = new mongoose.Schema(
  {
    contact_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    file_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    }],
  },
  { timestamps: true }
);

export default mongoose.model('ContactFile', contactFileSchema);
