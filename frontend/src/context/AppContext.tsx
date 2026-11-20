import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  workspace: string;
  setWorkspace: (ws: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  notifications: Array<{ id: string; title: string; time: string; unread: boolean; type: string }>;
  markNotificationRead: (id: string) => void;
  openHelpModal: boolean;
  setOpenHelpModal: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [workspace, setWorkspace] = useState('TBO Global Inventory Production');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [openHelpModal, setOpenHelpModal] = useState(false);
  
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'AI Duplicate Detection complete: 2,037 hotel pairs processed',
      time: '10m ago',
      unread: true,
      type: 'AI_MATCH'
    },
    {
      id: 'notif-2',
      title: 'Verification required for 35 ambiguous room mappings',
      time: '25m ago',
      unread: true,
      type: 'VERIFICATION'
    },
    {
      id: 'notif-3',
      title: 'Supplier GlobalStay B ingestion finished with 185 records',
      time: '1h ago',
      unread: false,
      type: 'INGESTION'
    }
  ]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      workspace, setWorkspace,
      isDemoMode, setIsDemoMode,
      sidebarCollapsed, setSidebarCollapsed,
      globalSearch, setGlobalSearch,
      notifications, markNotificationRead,
      openHelpModal, setOpenHelpModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
