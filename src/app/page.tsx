"use client";
import { useState, useEffect } from 'react';
import PasswordGenerator from '@/components/PasswordGenerator';
import AuthForm from '@/components/AuthForm';
import Vault from '@/components/Vault';

export default function HomePage() {
  // We use state to hold the encryption key derived from the user's master password
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  // A simple check to see if the auth cookie exists. This is just for UI purposes.
  // Real auth happens on the server with the cookie.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
      const hasToken = document.cookie.includes('token=');
      if (hasToken && encryptionKey) {
          setIsAuthenticated(true);
      } else {
          setIsAuthenticated(false);
      }
  }, [encryptionKey]);


  const handleAuthSuccess = (key: string) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gray-900 text-gray-100">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Secure Vault</h1>
        <p className="mt-2 text-lg text-gray-400">Your Privacy-First Password Manager</p>
      </div>

      {!isAuthenticated ? (
        <div className="w-full max-w-md flex flex-col items-center gap-8">
            <AuthForm onAuthSuccess={handleAuthSuccess} />
            <div className="w-full border-t border-gray-700 my-4"></div>
            <PasswordGenerator />
        </div>
      ) : (
        <div className="w-full">
            <Vault encryptionKey={encryptionKey!} />
        </div>
      )}
    </main>
  );
}
