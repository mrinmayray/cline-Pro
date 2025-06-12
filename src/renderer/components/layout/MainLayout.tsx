import React, { ReactNode } from 'react';
import { useAppContext } from '../../context/AppContext';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { sidebarOpen } = useAppContext();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {children}
    </div>
  );
};