'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VaultItem, encryptItem, deriveKey } from '@/lib/crypto';
import { copyToClipboard } from '@/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(1),
  username: z.string(),
  password: z.string().min(1),
  url: z.string().url().optional(),
  notes: z.string().optional(),
  tags: z.string().transform((val) => val.split(',').map(t => t.trim()).filter(Boolean)).optional(),
  folder: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSave: (encryptedData: string) => Promise<void>;
  defaultValues?: VaultItem;
  isEdit?: boolean;
  itemId?: string;
  onUpdate?: (id: string, encryptedData: string) => Promise<void>;
  userPassword: string;
}

export default function VaultItemForm({ onSave, defaultValues, isEdit = false, itemId, onUpdate, userPassword }: Props) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { title: '', username: '', password: '', url: '', notes: '', tags: '', folder: '' },
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data: FormData) => {
    const item: VaultItem = { ...data, url: data.url || '', notes: data.notes || '', tags: data.tags, folder: data.folder };
    const key = deriveKey(userPassword);
    const encryptedData = encryptItem(item, key);
    if (isEdit && onUpdate && itemId) {
      onUpdate(itemId, encryptedData);
    } else {
      onSave(encryptedData);
    }
    reset();
  };

 const handleCopyPassword = async (password: string) => {
  await copyToClipboard(password);
  setCopied(true);
  toast.success('Password copied! 🗜️');
  setTimeout(() => setCopied(false), 15000);  // Longer for form
};
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{isEdit ? ' Edit Entry' : ' Add New Entry'}</h4>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Title</label>
        <input {...register('title')} placeholder="e.g., Gmail Account" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Username</label>
        <input {...register('username')} placeholder="e.g., your.email@example.com" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Password</label>
        <input {...register('password')} placeholder="Enter or generate password" type="password" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm" required />
      </div>
      <button
        type="button"
        onClick={() => handleCopyPassword(defaultValues?.password || '')}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-xl hover:from-green-600 to-teal-600 transition-all duration-200 shadow-sm"
      >
        {copied ? ' Copied! (clears soon)' : ' Copy Password'}
      </button>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> URL (optional)</label>
        <input {...register('url')} placeholder="e.g., https://gmail.com" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Tags (comma-separated, optional)</label>
        <input {...register('tags')} placeholder="e.g., work, email" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Folder (optional)</label>
        <input {...register('folder')} placeholder="e.g., Personal" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Notes (optional)</label>
        <textarea {...register('notes')} placeholder="Additional details..." rows={3} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none" />
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">{isEdit ? ' Update' : ' Save'}</button>
    </form>
  );
}