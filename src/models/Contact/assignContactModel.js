import mongoose from 'mongoose';

const ContactAssignSchema = new mongoose.Schema({
  contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  salerep_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const ContactAsignment = mongoose.model('ContactAsignment', ContactAssignSchema);

export default ContactAsignment;