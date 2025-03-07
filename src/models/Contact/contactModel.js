import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],},
    address: { type: String },
    company: { type: String },
    tags: [{ type: String }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
