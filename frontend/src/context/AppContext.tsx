import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Dataset } from '../types';
import { api } from '../api/client';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  isLoadingDatasets: boolean;
  toasts: ToastInfo[];
  setSelectedDataset: (d: Dataset | null) => void;
  refreshDatasets: () => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshDatasets = async () => {
    setIsLoadingDatasets(true);
    try {
      const data = await api.listDatasets();
      setDatasets(data);
      if (data.length > 0) {
        // Keep current selected if still exists, else pick first
        setSelectedDataset((prev) => {
          if (prev && data.some((d) => d.id === prev.id)) {
            return data.find((d) => d.id === prev.id) || data[0];
          }
          return data[0];
        });
      } else {
        setSelectedDataset(null);
      }
    } catch (err: any) {
      console.error('Failed to load datasets:', err);
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const initAuthAndData = async () => {
    try {
      // First attempt to get active user if token present
      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch {
        // Automatically login as Demo user for instant access!
        const authRes = await api.demoLogin();
        setUser(authRes.user);
      }
      await refreshDatasets();
    } catch (e: any) {
      console.error('Initialization error:', e);
    }
  };

  useEffect(() => {
    initAuthAndData();
  }, []);

  const demoLogin = async () => {
    try {
      const res = await api.demoLogin();
      setUser(res.user);
      showToast('success', 'Logged in as Demo User with full portfolio privileges.');
      await refreshDatasets();
    } catch (err: any) {
      showToast('error', err.message || 'Failed demo login');
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setDatasets([]);
    setSelectedDataset(null);
    showToast('info', 'Logged out successfully.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        datasets,
        selectedDataset,
        isLoadingDatasets,
        toasts,
        setSelectedDataset,
        refreshDatasets,
        demoLogin,
        logout,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
