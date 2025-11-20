"use client";
import { useState } from 'react';

interface AuthFormProps {
  onAuthSuccess: (key: string) => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // State for the 2FA flow
  const [show2faInput, setShow2faInput] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.twoFactorRequired) {
        setShow2faInput(true);
      } else {
        // This case might not be reachable if all logins require 2FA
        onAuthSuccess(password); 
      }
    } else {
      try {
        const errorData = await res.json();
        setError(errorData.message || 'An error occurred.');
      } catch (jsonError) {
        setError(`An error occurred. Status: ${res.status}`);
      }
    }
  };

  // --- THIS FUNCTION HAS BEEN MODIFIED ---
  const handle2faVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Updated the URL to the new endpoint
    const res = await fetch('/api/auth/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 2. Updated the body to send the code with the key 'otp'
      body: JSON.stringify({ email, otp: twoFactorToken }),
    });

    if (res.ok) {
      onAuthSuccess(password); // 2FA successful, proceed to app
    } else {
      const data = await res.json();
      setError(data.message || 'Invalid OTP.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // We expect a JSON response for both success and error
    const data = await res.json(); 
    if (res.ok) {
      setMessage('Signup successful! Please log in.');
      setIsLogin(true);
      setShow2faInput(false);
    } else {
      setError(data.message || 'An error occurred.');
    }
  };
  
  // Render 2FA form if required
  if (show2faInput) {
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-white">Check Your Email</h2>
            <p className="text-center text-sm text-gray-400">We've sent a 6-digit verification code to your email address.</p>
            <form onSubmit={handle2faVerifySubmit} className="space-y-6">
                <div>
                    <label htmlFor="2fa-token" className="block text-sm font-medium text-gray-300">Verification Code</label>
                    <input id="2fa-token" type="text" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800">
                    Verify
                </button>
            </form>
        </div>
    )
  }

  // Render original Login/Signup form
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Master Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}
        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <p className="text-sm text-center text-gray-400">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="ml-1 font-medium text-indigo-400 hover:underline">
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;