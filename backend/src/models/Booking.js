import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // format: "HH:mm" (e.g., "09:30")
      required: true,
    },
    endTime: {
      type: String, // format: "HH:mm" (e.g., "10:30")
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt এবং updatedAt অটোমেটিক ম্যানেজ করবে
  }
);

// Tenant-wise Fast Querying Index
bookingSchema.index({ tenantId: 1, bookingDate: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;