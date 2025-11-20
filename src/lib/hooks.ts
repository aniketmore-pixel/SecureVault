"use client";
import { useState, useCallback } from 'react';

export const useCopyToClipboard = (autoClearDelay: number = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, autoClearDelay);
    });
  }, [autoClearDelay]);

  return [isCopied, copy] as const;
};