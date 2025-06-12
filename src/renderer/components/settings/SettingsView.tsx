import React from 'react';
import { useApi } from '../../context/ApiContext';
import { useTheme } from '../../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { 
    apiProvider, 
    setApiProvider, 
    apiKey, 
    setApiKey, 
    model, 
    setModel, 
    availableModels 
  } = useApi();
  
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">API Provider</label>
          <select
            value={apiProvider}
            onChange={(e) => setApiProvider(e.target.value)}
            className="w-full p-2 bg-background-input text-foreground border border-border rounded focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
            <option value="openrouter">OpenRouter</option>
            <option value="bedrock">AWS Bedrock</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full p-2 bg-background-input text-foreground border border-border rounded focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 bg-background-input text-foreground border border-border rounded focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Theme</label>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-background-input text-foreground'}`}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
            <button
              className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-background-input text-foreground'}`}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Auto-Approval Settings</h2>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
            />
            <span>Enable auto-approval</span>
          </label>
        </div>
        
        <div className="pl-6 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              disabled
            />
            <span>Read project files</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              disabled
            />
            <span>Edit project files</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              disabled
            />
            <span>Execute safe commands</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              disabled
            />
            <span>Use browser</span>
          </label>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p>Cline Standalone v1.0.0</p>
        <p className="text-foreground-secondary">© 2025 Cline Bot Inc.</p>
      </div>
    </div>
  );
};