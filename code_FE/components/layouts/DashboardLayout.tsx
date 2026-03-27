'use client';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/ui/loading';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading message="Đang tải..." />;
  }

  if (!isAuthenticated) {
    return null; // Middleware will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  );
}
