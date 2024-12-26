import mongoose from 'mongoose';

const contactFileSchema = new mongoose.Schema({
  contact_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true, unique: true },
  file_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
}, { timestamps: true });

const ContactFile = mongoose.model('ContactFile', contactFileSchema);

export default ContactFile;
