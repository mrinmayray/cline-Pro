import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar } from './components/layout/Sidebar';
import { ContentArea } from './components/layout/ContentArea';
import { ChatView } from './components/chat/ChatView';
import { SettingsView } from './components/settings/SettingsView';
import { McpConfigView } from './components/mcp/McpConfigView';
import { HistoryView } from './components/history/HistoryView';
import { AppContext, AppContextType, View } from './context/AppContext';
import { ApiProvider } from './context/ApiContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const appContextValue: AppContextType = {
    currentView,
    setCurrentView,
    sidebarOpen,
    setSidebarOpen
  };
  
  return (
    <ThemeProvider>
      <AppContext.Provider value={appContextValue}>
        <ApiProvider>
          <TaskProvider>
            <MainLayout>
              <Sidebar />
              <ContentArea>
                {currentView === 'chat' && <ChatView />}
                {currentView === 'settings' && <SettingsView />}
                {currentView === 'mcp' && <McpConfigView />}
                {currentView === 'history' && <HistoryView />}
              </ContentArea>
            </MainLayout>
          </TaskProvider>
        </ApiProvider>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;