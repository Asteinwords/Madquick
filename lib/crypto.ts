import CryptoJS from 'crypto-js';

export interface VaultItem {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  tags?: string[];  // ← Add
  folder?: string;
}

export function deriveKey(password: string): string {
  return CryptoJS.PBKDF2(password, 'salt-for-pbkdf2', {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
}

export function encryptItem(item: VaultItem, key: string): string {
  const itemJson = JSON.stringify(item);
  return CryptoJS.AES.encrypt(itemJson, key).toString();
}

export function decryptItem(encryptedData: string, key: string): VaultItem | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed');
    return null;
  }
}