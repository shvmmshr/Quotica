'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface CreditsContextType {
  credits: number;
  isLoading: boolean;
  addCredits: (creds: number) => Promise<void>;
  deductCredits: (creds: number) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  isLoading: true,
  addCredits: async () => {},
  deductCredits: async () => false,
  refreshCredits: async () => {},
});

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/credits/getCreds?userId=${user.id}`);
      const data = await response.json();
      setCredits(data.credits || 0);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async (creds: number) => {
    if (!user) return;
    try {
      await fetch('/api/credits/addCreds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, creds }),
      });
      await fetchCredits();
    } catch (error) {
      console.error('Failed to add credits:', error);
    }
  };

  const deductCredits = async (creds: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch('/api/credits/spendCreds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, creds }),
      });

      if (!response.ok) {
        throw new Error('Failed to deduct credits');
      }

      await fetchCredits();
      return true;
    } catch (error) {
      console.error('Failed to deduct credits:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        addCredits,
        deductCredits,
        refreshCredits: fetchCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => useContext(CreditsContext);
