import mongoose from 'mongoose';

const TenantSettingsSchema = new mongoose.Schema(
  {
    subdomain: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    appName: {
      type: String,
      default: 'My SaaS App',
    },
    themeColor: {
      type: String,
      default: '#3b82f6', // Default primary color
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
    bookingSlotDuration: {
      type: Number, // In minutes
      default: 30,
    },
    timeZone: {
      type: String,
      default: 'UTC',
    },
  },
  { timestamps: true }
);

export default mongoose.models.TenantSettings || mongoose.model('TenantSettings', TenantSettingsSchema);