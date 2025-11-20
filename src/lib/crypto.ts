"use client";
import CryptoJS from 'crypto-js';

// IMPORTANT: This key is derived on the client and should never be sent to the server.
// It should be held in memory (e.g., React state) after the user logs in.

export const encryptData = (data: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decryptData = (ciphertext: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};