import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastViewport } from '../ui/Toast';
import { useAppStore } from '../../stores/appStore';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const themeMode = useAppStore((state) => state.themeMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  return (
    <div className="min-h-screen bg-app">
      <Sidebar />
      <div className="min-h-screen pb-24 md:ml-60 md:pb-0">
        <Topbar />
        <main className="mx-auto w-full max-w-[1680px] p-5 md:p-8">{children}</main>
      </div>
      <ToastViewport />
    </div>
  );
}
