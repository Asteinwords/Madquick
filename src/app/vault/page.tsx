'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PasswordGenerator from '@/components/PasswordGenerator';
import VaultItemForm from '@/components/VaultItemForm';
import { decryptItem, VaultItem, deriveKey } from '@/lib/crypto';
import { copyToClipboard } from '@/utils';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function Vault() {
  const [items, setItems] = useState<{ id: string; encryptedData: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [decryptedItems, setDecryptedItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedCopied, setGeneratedCopied] = useState(false);
  const [userPassword] = useState(localStorage.getItem('userPassword') || '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterFolder, setFilterFolder] = useState('');
  const [itemCopiedId, setItemCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, []);

  // Memoize filtered items for better performance
  const filteredItems = useMemo(() => 
    decryptedItems.filter(item =>
      (item.title.toLowerCase().includes(search.toLowerCase()) || item.url?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterTags.length || filterTags.every(tag => item.tags?.includes(tag))) &&
      (!filterFolder || item.folder === filterFolder)
    ), [decryptedItems, search, filterTags, filterFolder]
  );

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/vault');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        if (userPassword) {
          const key = deriveKey(userPassword);
          const decrypted = data.map((item: any) => {
            const dec = decryptItem(item.encryptedData, key);
            return dec ? { ...dec, id: item._id } : null;
          }).filter(Boolean) as VaultItem[];
          setDecryptedItems(decrypted);
        }
      } else {
        toast.error('Failed to load vault items.');
      }
    } catch (err) {
      toast.error('Network error loading vault.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveItem = async (encryptedData: string) => {
    try {
      await fetch('/api/vault', { 
        method: 'POST', 
        body: JSON.stringify({ encryptedData }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      fetchItems();
    } catch (err) {
      toast.error('Failed to save item.');
    }
  };

  const updateItem = async (id: string, encryptedData: string) => {
    try {
      await fetch('/api/vault', { 
        method: 'PUT', 
        body: JSON.stringify({ id, encryptedData }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to update item.');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await fetch('/api/vault', { 
        method: 'DELETE', 
        body: JSON.stringify({ id }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      fetchItems();
      toast.success('Entry deleted.');
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  const handleGenerate = (password: string) => {
    setGeneratedPassword(password);
  };

  const startEdit = (item: VaultItem) => {
    setSelectedItem(item);
    setEditingId(item.id || '');
  };

  const handleCopyGenerated = async () => {
    await copyToClipboard(generatedPassword);
    setGeneratedCopied(true);
    toast.success('Generated password copied! 🔐');
    setTimeout(() => setGeneratedCopied(false), 2000);
  };

  const handleCopyItemPassword = async (itemId: string, password: string) => {
    await copyToClipboard(password);
    setItemCopiedId(itemId);
    toast.success('Password copied securely! 🔐');
    setTimeout(() => setItemCopiedId(null), 2000);
  };

  const exportVault = async () => {
    try {
      const encryptedData = items.map(item => ({ id: item._id, encryptedData: item.encryptedData }));
      const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vault-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Vault exported! 🔒');
    } catch (err) {
      toast.error('Export failed.');
    }
  };

  const importVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported: { id?: string; encryptedData: string }[] = JSON.parse(text);
      for (const item of imported) {
        await fetch('/api/vault', { 
          method: 'POST', 
          body: JSON.stringify({ encryptedData: item.encryptedData }), 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      fetchItems();
      toast.success(`Imported ${imported.length} items! 📥`);
      e.target.value = '';
    } catch (err) {
      toast.error('Import failed – invalid file.');
    }
  };

  if (!userPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-slate-600 dark:text-gray-400">Please log in again to access your vault.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 dark:text-gray-400">Loading your secure vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Secure Vault
                </h1>
                <p className="text-sm text-slate-600 dark:text-gray-400">{filteredItems.length} secure entries</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <button 
                onClick={() => router.push('/login')} 
                className="bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Password Generator */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
              <PasswordGenerator onGenerate={handleGenerate} />
              {generatedPassword && (
                <div className="mt-4 p-4 bg-slate-50/50 dark:bg-gray-700/50 rounded-xl border border-slate-200 dark:border-gray-600">
                  <p className="text-xs font-mono text-slate-600 dark:text-gray-300 break-all mb-3 p-2 bg-white dark:bg-gray-800 rounded border">
                    {generatedPassword}
                  </p>
                  <button 
                    onClick={handleCopyGenerated}
                    className={`w-full py-2.5 rounded-lg text-white transition-all duration-200 font-semibold ${
                      generatedCopied 
                        ? 'bg-green-600' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {generatedCopied ? '✅ Copied!' : 'Copy Password'}
                  </button>
                </div>
              )}
            </div>

            {/* Add New Item */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
              <VaultItemForm onSave={saveItem} userPassword={userPassword} />
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Edit Form */}
            {selectedItem && editingId && (
              <div className="bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Editing: {selectedItem.title}</h3>
                </div>
                <VaultItemForm
                  defaultValues={selectedItem}
                  isEdit={true}
                  itemId={editingId}
                  onUpdate={updateItem}
                  userPassword={userPassword}
                />
              </div>
            )}

            {/* Controls */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/30">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or URL..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Filter by tags..." 
                    onChange={(e) => setFilterTags([e.target.value])} 
                    className="px-4 py-3 bg-slate-50/50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400" 
                  />
                  <select 
                    onChange={(e) => setFilterFolder(e.target.value)} 
                    className="px-4 py-3 bg-slate-50/50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white"
                  >
                    <option value="">All Folders</option>
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                  </select>
                </div>

                {/* Import/Export */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={exportVault} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Export Vault
                  </button>
                  <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center">
                    <input type="file" onChange={importVault} accept=".json" className="hidden" />
                    Import Vault
                  </label>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white truncate">{item.title}</h4>
                      <div className="w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {item.username}
                      </div>
                      {item.url && (
                        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                          <span className="truncate">{item.url}</span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="flex items-start text-sm text-slate-600 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="line-clamp-2">{item.notes}</span>
                        </div>
                      )}
                    </div>

                    {(item.tags || item.folder) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags?.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                            {tag}
                          </span>
                        ))}
                        {item.folder && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                            {item.folder}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleCopyItemPassword(item.id!, item.password)}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-lg ${
                          itemCopiedId === item.id 
                            ? 'bg-green-600' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                      >
                        {itemCopiedId === item.id ? '✅ Copied!' : 'Copy Password'}
                      </button>
                       <button 
                        onClick={() => startEdit(item)} 
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id!)} 
                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && !isLoading && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-white/20 dark:border-gray-700/30 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No items found</h3>
                <p className="text-slate-600 dark:text-gray-400 mb-6">
                  {search || filterTags.length || filterFolder 
                    ? "Try adjusting your search or filters" 
                    : "Start by adding your first secure entry using the form on the left"
                  }
                </p>
                {(search || filterTags.length || filterFolder) && (
                  <button 
                    onClick={() => {
                      setSearch('');
                      setFilterTags([]);
                      setFilterFolder('');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}