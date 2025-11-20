"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

const TwoFactorSetup = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const setup = async () => {
            const res = await fetch('/api/auth/2fa?action=setup', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setQrCodeUrl(data.qrCodeUrl);
                setSecret(data.secret);
            }
        };
        setup();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const res = await fetch('/api/auth/2fa?action=verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
            setMessage(data.message);
            setIsEnabled(true);
        } else {
            setError(data.message || 'Verification failed.');
        }
    };

    if (isEnabled) {
        return (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
                <h3 className="text-2xl font-bold text-green-400">Success!</h3>
                <p className="mt-2 text-gray-300">Two-Factor Authentication is now enabled on your account.</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md p-8 space-y-4 bg-gray-800 rounded-lg shadow-md border border-gray-700 text-white">
            <h2 className="text-2xl font-bold text-center">Set Up Two-Factor Authentication</h2>
            <p className="text-center text-gray-400">Scan the QR code with your authenticator app (like Google Authenticator or Authy).</p>
            
            {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white rounded-md">
                    <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                </div>
            )}
            
            <p className="text-center text-sm text-gray-500">
                Can't scan? Enter this code manually: <br />
                <code className="font-mono bg-gray-900 p-1 rounded">{secret}</code>
            </p>

            <form onSubmit={handleVerify} className="space-y-4 pt-4">
                <label htmlFor="token" className="block text-sm font-medium text-gray-300">Verification Code</label>
                <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    className="w-full px-3 py-2 text-gray-200 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Verify & Enable
                </button>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                {message && <p className="text-sm text-green-400 text-center">{message}</p>}
            </form>
        </div>
    );
};

export default TwoFactorSetup;