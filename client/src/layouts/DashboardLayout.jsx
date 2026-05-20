import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import MobileSidebar from '../components/layout/MobileSidebar';
import { useSelector } from 'react-redux';
import { cn } from '../utils/cn';

export default function DashboardLayout() {
  const { sidebarOpen, mobileSidebarOpen } = useSelector((s) => s.ui);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar />

      {/* Main content */}
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-0'
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
