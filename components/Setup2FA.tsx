'use client';
import { useState } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/utils';

interface Props {
  email: string;
  onSecret: (secret: string) => void;
}

export default function Setup2FA({ email, onSecret }: Props) {
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const generateSecret = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email first.');
      return;
    }
    try {
      const { authenticator } = await import('otplib');
      const newSecret = authenticator.generateSecret();  // Unique 32-char base32 secret
      setSecret(newSecret);
      const otpauth = `otpauth://totp/PasswordVault:${email}?secret=${newSecret}&issuer=PasswordVault&period=30`;  // Explicit 30s period
      const qr = await QRCode.toDataURL(otpauth);
      setQrUrl(qr);
      setShowQR(true);
      onSecret(newSecret);
      toast.success('2FA ready! Scan QR now. Secret is unique to this account – codes change every 30s.', { duration: 5000 });
    } catch (error) {
      toast.error('Failed to generate 2FA. Try again.');
      console.error('2FA Gen Error:', error);
    }
  };

  const regenerateQR = async () => {
    if (!secret) return;
    try {
      const otpauth = `otpauth://totp/PasswordVault:${email}?secret=${secret}&issuer=PasswordVault&period=30`;
      const qr = await QRCode.toDataURL(otpauth);
      setQrUrl(qr);
      toast('QR regenerated – scan now!', { duration: 3000 });
    } catch (error) {
      toast.error('QR regen failed.');
    }
  };

  const handleCopySecret = async () => {
    if (!secret) return;
    await copyToClipboard(secret);
    setIsCopied(true);
    toast.success('Secret copied! Save securely – unique to this account only.', { duration: 4000 });
    setTimeout(() => setIsCopied(false), 3000);
  };

  const closeQR = () => {
    setShowQR(false);
    setSecret('');
    setQrUrl('');
    onSecret('');
    toast('2FA setup closed. Re-enable if needed.');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
        <span className="mr-2">🔐</span>Enable 2FA (Optional)
      </h4>
      {!showQR ? (
        <button onClick={generateSecret} className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl hover:from-green-600 to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">📱 Set Up with Authenticator</button>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Scan QR now (keep open – closes only on button below)</p>
          <img src={qrUrl} alt="QR Code" className="w-40 h-40 border-2 border-green-200 dark:border-green-800 rounded-lg shadow-md" />  // Larger for easy scan
          <div className="flex space-x-2 w-full">
            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-l-lg text-center break-all text-gray-800 dark:text-gray-200 flex-1">Secret: {secret}</p>
            <button
              onClick={handleCopySecret}
              className={`px-3 py-2 rounded-r-lg transition-all duration-200 shadow-sm ${
                isCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              title="Copy secret (unique to this account)"
            >
              {isCopied ? '✅' : '📋'}
            </button>
          </div>
          <button onClick={regenerateQR} className="text-xs text-blue-500 hover:text-blue-600 underline">🔄 Regenerate QR (if scan fails)</button>
          <div className="flex gap-2">
            <button onClick={closeQR} className="flex-1 bg-gray-500 text-white py-2 rounded-xl hover:bg-gray-600 transition-all duration-200 text-sm">❌ Close 2FA Setup</button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Secret saved in DB for this account only. Codes valid for 30s.</p>
        </div>
      )}
    </div>
  );
}