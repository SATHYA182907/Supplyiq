import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { HelpModal } from '../components/common/HelpModal';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-ink-primary flex">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-beige-50/40">
          <Outlet />
        </main>
      </div>

      {/* Global Architectural Help & Guide Modal */}
      <HelpModal />
    </div>
  );
};
