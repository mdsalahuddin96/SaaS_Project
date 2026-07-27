import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Expired automatically after 24 hour
    },
  },
  { timestamps: true }
);

const IdempotencyKey =
  mongoose.models.IdempotencyKey || mongoose.model('IdempotencyKey', idempotencyKeySchema);

export default IdempotencyKey;