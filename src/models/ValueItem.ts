import mongoose from 'mongoose';

const VaultItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true }, // Encrypted
  username: { type: String, required: true }, // Encrypted
  password: { type: String, required: true }, // Encrypted
  url: { type: String }, // Encrypted
  notes: { type: String }, // Encrypted
}, { timestamps: true });

export default mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema);