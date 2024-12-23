
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    company: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true } 
);

export default mongoose.model('Contact', contactSchema);
