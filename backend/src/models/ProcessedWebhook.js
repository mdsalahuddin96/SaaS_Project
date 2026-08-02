import mongoose from 'mongoose';

const processedWebhookSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800, 
    },
  },
  { timestamps: true }
);

const ProcessedWebhook = mongoose.models.ProcessedWebhook || mongoose.model('ProcessedWebhook', processedWebhookSchema);

export default ProcessedWebhook;