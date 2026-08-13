import mongoose from 'mongoose';

const yjsDocumentSchema = new mongoose.Schema(
  {
    docName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    update: {
      type: Buffer,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.YjsDocument || mongoose.model('YjsDocument', yjsDocumentSchema);