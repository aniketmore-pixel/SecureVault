import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Add these fields for 2FA
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);