import { createContext, useContext } from 'react';

export type View = 'chat' | 'settings' | 'mcp' | 'history';

export interface AppContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AppContext = createContext<AppContextType>({
  currentView: 'chat',
  setCurrentView: () => {},
  sidebarOpen: true,
  setSidebarOpen: () => {}
});

export const useAppContext = () => useContext(AppContext);