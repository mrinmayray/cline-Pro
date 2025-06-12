import React, { useState, useEffect } from 'react';

interface McpServer {
  name: string;
  status: 'connected' | 'connecting' | 'disconnected';
  disabled: boolean;
  tools: { name: string; description: string }[];
}

export const McpConfigView: React.FC = () => {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadServers = async () => {
      setIsLoading(true);
      try {
        const mcpServers = await window.electron.getMcpServers();
        setServers(mcpServers || []);
      } catch (error) {
        console.error('Failed to load MCP servers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServers();
  }, []);
  
  const toggleServer = async (name: string, enabled: boolean) => {
    try {
      await window.electron.toggleMcpServer(name, enabled);
      setServers(prev => 
        prev.map(server => 
          server.name === name ? { ...server, disabled: !enabled } : server
        )
      );
    } catch (error) {
      console.error(`Failed to toggle server ${name}:`, error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-6">MCP Servers</h1>
      
      {servers.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">No MCP servers configured</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover">
            Add Server
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {servers.map(server => (
            <div key={server.name} className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-background-input">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    server.status === 'connected' ? 'bg-green-500' :
                    server.status === 'connecting' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <h3 className="font-medium">{server.name}</h3>
                </div>
                
                <div className="flex items-center">
                  <button
                    className="p-1 rounded hover:bg-gray-700 mr-2"
                    title="Restart Server"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6"></path>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                  </button>
                  
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!server.disabled}
                      onChange={() => toggleServer(server.name, server.disabled)}
                    />
                    <div className="relative w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              {!server.disabled && server.tools.length > 0 && (
                <div className="p-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Available Tools</h4>
                  <ul className="space-y-1">
                    {server.tools.map(tool => (
                      <li key={tool.name} className="text-sm">
                        <span className="font-mono">{tool.name}</span>
                        {tool.description && (
                          <span className="text-foreground-secondary ml-2">- {tool.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Add MCP Server</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Add Local Server</h3>
            <p className="text-sm text-foreground-secondary mb-4">
              Add a local MCP server from your file system
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover">
              Browse
            </button>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Add Remote Server</h3>
            <p className="text-sm text-foreground-secondary mb-4">
              Connect to a remote MCP server via URL
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover">
              Add Remote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};