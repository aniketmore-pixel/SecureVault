// "use client";
// import { useState, useCallback } from 'react';
// import { Copy, RefreshCw } from 'lucide-react';
// import { useCopyToClipboard } from '@/lib/hooks';

// const PasswordGenerator = () => {
//   const [length, setLength] = useState(16);
//   const [includeNumbers, setIncludeNumbers] = useState(true);
//   const [includeSymbols, setIncludeSymbols] = useState(true);
//   const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
//   const [password, setPassword] = useState('');
//   const [isCopied, copy] = useCopyToClipboard(15000); // 15 seconds

//   const generatePassword = useCallback(() => {
//     const lower = 'abcdefghijkmnopqrstuvwxyz'; // Excluded l, o
//     const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluded I, O
//     const numbers = '23456789'; // Excluded 0, 1
//     const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
//     const lookAlikes = 'lIO01';

//     let charSet = lower + upper;
//     if (includeNumbers) charSet += numbers;
//     if (includeSymbols) charSet += symbols;
//     if (!excludeLookAlikes) charSet += lookAlikes;

//     let newPassword = '';
//     for (let i = 0; i < length; i++) {
//       newPassword += charSet.charAt(Math.floor(Math.random() * charSet.length));
//     }
//     setPassword(newPassword);
//   }, [length, includeNumbers, includeSymbols, excludeLookAlikes]);

//   return (
//     <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 w-full max-w-md">
//       <h2 className="text-xl font-bold mb-4 text-white">Password Generator</h2>
      
//       <div className="flex items-center bg-gray-900 p-3 rounded-md mb-4">
//         <span className="flex-grow text-gray-300 font-mono text-lg truncate">{password || 'Click Generate'}</span>
//         <button onClick={generatePassword} className="p-2 text-gray-400 hover:text-white transition-colors"><RefreshCw size={20} /></button>
//         <button onClick={() => copy(password)} className="p-2 text-gray-400 hover:text-white transition-colors">
//             {isCopied ? 'Copied!' : <Copy size={20} />}
//         </button>
//       </div>

//       <div className="space-y-4">
//         <div>
//           <label htmlFor="length" className="block text-sm font-medium text-gray-300">Length: {length}</label>
//           <input type="range" id="length" min="8" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
//         </div>
//         <div className="flex items-center justify-between">
//             <label htmlFor="numbers" className="text-gray-300">Include Numbers</label>
//             <input type="checkbox" id="numbers" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
//         </div>
//         <div className="flex items-center justify-between">
//             <label htmlFor="symbols" className="text-gray-300">Include Symbols</label>
//             <input type="checkbox" id="symbols" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
//         </div>
//         <div className="flex items-center justify-between">
//             <label htmlFor="lookalikes" className="text-gray-300">Exclude Look-Alikes (I, l, 1, O, 0)</label>
//             <input type="checkbox" id="lookalikes" checked={excludeLookAlikes} onChange={(e) => setExcludeLookAlikes(e.target.checked)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"/>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PasswordGenerator;



"use client";
import { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { useCopyToClipboard } from '@/lib/hooks';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
  const [password, setPassword] = useState('');
  const [isCopied, copy] = useCopyToClipboard(15000);

  const generatePassword = useCallback(() => {
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
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
  }, [length, includeNumbers, includeSymbols, excludeLookAlikes]);
  
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  return (
    <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Password Generator</h2>
      
      <div className="flex items-center bg-white dark:bg-gray-900 p-3 rounded-md mb-4 border border-gray-200 dark:border-gray-700">
        <span className="flex-grow text-gray-800 dark:text-gray-300 font-mono text-lg truncate">{password || '...'}</span>
        <button onClick={generatePassword} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"><RefreshCw size={20} /></button>
        <button onClick={() => copy(password)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            {isCopied ? 'Copied!' : <Copy size={20} />}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Length: {length}</label>
          <input type="range" id="length" min="8" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="numbers" className="text-gray-700 dark:text-gray-300">Include Numbers</label>
            <input type="checkbox" id="numbers" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="symbols" className="text-gray-700 dark:text-gray-300">Include Symbols</label>
            <input type="checkbox" id="symbols" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="lookalikes" className="text-gray-700 dark:text-gray-300">Exclude Look-Alikes</label>
            <input type="checkbox" id="lookalikes" checked={excludeLookAlikes} onChange={(e) => setExcludeLookAlikes(e.target.checked)} className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
        </div>
      </div>
    </div>
  );
};
export default PasswordGenerator;