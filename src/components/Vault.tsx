"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { encryptData, decryptData } from '@/lib/crypto';
import { useCopyToClipboard } from '@/lib/hooks';
import { Trash2, Edit, PlusCircle, Search, RefreshCw, Copy } from 'lucide-react';

//++++++++++++++ PASSWORD GENERATOR COMPONENT ++++++++++++++//
// Integrated directly to be used within the modal

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

const PasswordGenerator = ({ onPasswordGenerated }: PasswordGeneratorProps) => {
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
  const [password, setPassword] = useState('');
  const [isCopied, copy] = useCopyToClipboard(10000); // Clears "Copied!" after 10 seconds

  const generatePassword = useCallback(() => {
    const lower = 'abcdefghijkmnopqrstuvwxyz'; // Excluded l, o
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluded I, O
    const numbers = '23456789'; // Excluded 0, 1
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const lookAlikes = 'lIO01';

    let charSet = lower + upper;
    if (includeNumbers) charSet += numbers;
    if (includeSymbols) charSet += symbols;
    if (!excludeLookAlikes) charSet += lookAlikes;

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    setPassword(newPassword);
    onPasswordGenerated(newPassword); // Send password up to the modal form
  }, [length, includeNumbers, includeSymbols, excludeLookAlikes, onPasswordGenerated]);

  useEffect(() => {
    generatePassword();
  // We only want this to run when the settings change, not when the parent function reference changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeNumbers, includeSymbols, excludeLookAlikes]);

  return (
    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700 w-full my-4">
      <div className="flex items-center bg-gray-700 p-2 rounded-md mb-4">
        <span className="flex-grow text-gray-300 font-mono text-md truncate">{password}</span>
        <button type="button" onClick={generatePassword} className="p-2 text-gray-400 hover:text-white transition-colors"><RefreshCw size={18} /></button>
        <button type="button" onClick={() => copy(password)} className="p-2 text-gray-400 hover:text-white transition-colors">
            {isCopied ? 'Copied!' : <Copy size={18} />}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-300">Length: {length}</label>
          <input type="range" id="length" min="8" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex items-center justify-between text-sm">
            <label htmlFor="numbers" className="text-gray-300">Include Numbers</label>
            <input type="checkbox" id="numbers" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
        </div>
        <div className="flex items-center justify-between text-sm">
            <label htmlFor="symbols" className="text-gray-300">Include Symbols</label>
            <input type="checkbox" id="symbols" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
        </div>
        <div className="flex items-center justify-between text-sm">
            <label htmlFor="lookalikes" className="text-gray-300">Exclude Look-Alikes (I, l, 1, O, 0)</label>
            <input type="checkbox" id="lookalikes" checked={excludeLookAlikes} onChange={(e) => setExcludeLookAlikes(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
        </div>
      </div>
    </div>
  );
};


//++++++++++++++ MAIN VAULT COMPONENT ++++++++++++++//

interface VaultItem {
  _id?: string;
  title: string;
  username: string;
  password?: string;
  url: string;
  notes: string;
}

interface VaultProps {
  encryptionKey: string;
}

const Vault = ({ encryptionKey }: VaultProps) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [decryptedItems, setDecryptedItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<VaultItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListCopied, copyFromList] = useCopyToClipboard();

  const fetchItems = async () => {
    setIsLoading(true);
    const res = await fetch('/api/vault');
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length > 0 && encryptionKey) {
      const decrypted = items.map(item => {
        try {
          return {
            ...item,
            title: decryptData(item.title, encryptionKey),
            username: decryptData(item.username, encryptionKey),
            password: item.password ? decryptData(item.password, encryptionKey) : '',
            url: item.url ? decryptData(item.url, encryptionKey) : '',
            notes: item.notes ? decryptData(item.notes, encryptionKey) : '',
          };
        } catch (e) {
          console.error("Decryption failed for item:", item._id);
          return { ...item, title: "Decryption Error", username: "", url: "", notes: ""};
        }
      });
      setDecryptedItems(decrypted);
    } else {
        setDecryptedItems([]);
    }
  }, [items, encryptionKey]);

  const handleSave = async (item: VaultItem) => {
    const encryptedItem = {
      title: encryptData(item.title, encryptionKey),
      username: encryptData(item.username, encryptionKey),
      password: encryptData(item.password || '', encryptionKey),
      url: encryptData(item.url, encryptionKey),
      notes: encryptData(item.notes, encryptionKey),
    };

    const endpoint = item._id ? `/api/vault/${item._id}` : '/api/vault';
    const method = item._id ? 'PUT' : 'POST';

    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encryptedItem),
    });

    setShowModal(false);
    setCurrentItem(null);
    fetchItems();
  };
  
  const handleDelete = async (id: string) => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        await fetch(`/api/vault/${id}`, { method: 'DELETE' });
        fetchItems();
      }
  };

  const openModal = (item: VaultItem | null = null) => {
    setCurrentItem(item || { title: '', username: '', password: '', url: '', notes: '' });
    setShowModal(true);
  };
  
  const filteredItems = useMemo(() => {
    if (!searchTerm) return decryptedItems;
    return decryptedItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [decryptedItems, searchTerm]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Vault</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          <PlusCircle size={20} />
          Add Item
        </button>
      </div>

       <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search vault..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        {isLoading ? <p className="text-center p-8 text-gray-400">Loading vault...</p> : 
          filteredItems.length === 0 ? <p className="text-center p-8 text-gray-400">No items found.</p> :
          (
            <ul>
              {filteredItems.map(item => (
                <li key={item._id} className="border-b border-gray-700 p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-white">{item.title}</h3>
                    <p className="text-gray-400">{item.username}</p>
                    <button onClick={() => copyFromList(item.password || '')} className="text-xs text-indigo-400 hover:underline mt-1">
                      {isListCopied ? "Copied!" : "Copy Password"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"><Edit size={20}/></button>
                    <button onClick={() => handleDelete(item._id!)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={20}/></button>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </div>

      {showModal && (
        <ItemModal item={currentItem} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};


//++++++++++++++ MODAL COMPONENT (NOW WITH GENERATOR) ++++++++++++++//

const ItemModal = ({ item, onSave, onClose }: { item: VaultItem | null; onSave: (item: VaultItem) => void; onClose: () => void; }) => {
  const [formData, setFormData] = useState<VaultItem>(item || { title: '', username: '', password: '', url: '', notes: '' });
  const [showGenerator, setShowGenerator] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // FIX: Wrap this function in useCallback to prevent an infinite loop
  const handleGeneratedPassword = useCallback((newPassword: string) => {
    setFormData(prev => ({ ...prev, password: newPassword }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white">{item?._id ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-700"/>
          <input name="username" value={formData.username} onChange={handleChange} placeholder="Username/Email" required className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-700"/>
          
          <div className="relative">
             <input name="password" type="text" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-700 pr-20"/>
             <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">
                {showGenerator ? 'Close' : 'Generate'}
             </button>
          </div>

          {showGenerator && (
            <PasswordGenerator onPasswordGenerated={handleGeneratedPassword} />
          )}
          
          <input name="url" value={formData.url} onChange={handleChange} placeholder="URL (optional)" className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-700"/>
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes (optional)" className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-700 h-24"/>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md text-white hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Vault;