import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFactorSecret: { type: String },  // Plain for server verify (unique per user)
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.setTwoFactorSecret = function (secret: string) {
  this.twoFactorSecret = secret;  // Unique secret per user
};

userSchema.methods.verifyTwoFactorToken = async function (token: string) {
  if (!this.twoFactorSecret) return false;
  try {
    const { authenticator } = require('otplib');
    const isValid = authenticator.check(token, this.twoFactorSecret);
    console.log(`2FA Verify for ${this.email}: Token "${token}" - Valid: ${isValid}`);  // Debug log
    return isValid;
  } catch (error) {
    console.error('TOTP Verify Error:', error);
    return false;
  }
};

export default mongoose.models.User || mongoose.model('User', userSchema);