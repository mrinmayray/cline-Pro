import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiContextType {
  apiProvider: string;
  apiKey: string;
  model: string;
  setApiProvider: (provider: string) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  availableModels: string[];
  isLoading: boolean;
  sendRequest: (prompt: string, images?: string[]) => Promise<string>;
}

const ApiContext = createContext<ApiContextType>({
  apiProvider: 'openai',
  apiKey: '',
  model: '',
  setApiProvider: () => {},
  setApiKey: () => {},
  setModel: () => {},
  availableModels: [],
  isLoading: false,
  sendRequest: async () => ''
});

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiProvider, setApiProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load settings from electron store
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.electron.getSettings();
        if (settings?.apiConfiguration) {
          setApiProvider(settings.apiConfiguration.apiProvider || 'openai');
          setApiKey(settings.apiConfiguration.apiKey || '');
          setModel(settings.apiConfiguration.model || '');
        }
      } catch (error) {
        console.error('Failed to load API settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Update available models when provider changes
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with actual API calls to fetch models
        // For now, we'll use some dummy data
        switch (apiProvider) {
          case 'openai':
            setAvailableModels(['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']);
            break;
          case 'anthropic':
            setAvailableModels(['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku']);
            break;
          case 'gemini':
            setAvailableModels(['gemini-pro', 'gemini-flash']);
            break;
          default:
            setAvailableModels([]);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        setAvailableModels([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, [apiProvider]);
  
  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = await window.electron.getSettings() || {};
        await window.electron.updateSettings({
          ...settings,
          apiConfiguration: {
            ...settings.apiConfiguration,
            apiProvider,
            apiKey,
            model
          }
        });
      } catch (error) {
        console.error('Failed to save API settings:', error);
      }
    };
    
    saveSettings();
  }, [apiProvider, apiKey, model]);
  
  const sendRequest = async (prompt: string, images: string[] = []): Promise<string> => {
    setIsLoading(true);
    try {
      // This would be replaced with actual API calls
      const response = await window.electron.sendApiRequest(apiProvider, {
        model,
        prompt,
        images
      });
      
      return response.text;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ApiContext.Provider
      value={{
        apiProvider,
        apiKey,
        model,
        setApiProvider,
        setApiKey,
        setModel,
        availableModels,
        isLoading,
        sendRequest
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);