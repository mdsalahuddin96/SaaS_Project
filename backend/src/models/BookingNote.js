import mongoose from 'mongoose';

const bookingNoteSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, index: true },
    subdomain: { type: String, required: true, index: true },
    content: { type: String, default: '' },
    lastUpdatedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

export default mongoose.models.BookingNote || mongoose.model('BookingNote', bookingNoteSchema);