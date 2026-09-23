import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { BottomNav } from './BottomNav.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal-900 text-slate-100 flex flex-col antialiased">
      <Navbar />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
};
