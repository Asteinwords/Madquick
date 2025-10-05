import mongoose, { Schema } from 'mongoose';

const vaultItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  encryptedData: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.VaultItem || mongoose.model('VaultItem', vaultItemSchema);