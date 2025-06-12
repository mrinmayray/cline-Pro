import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File system operations
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('file:write', path, content),
  listFiles: (path: string) => ipcRenderer.invoke('file:list', path),
  searchFiles: (path: string, pattern: string) => ipcRenderer.invoke('file:search', path, pattern),
  
  // Terminal operations
  executeCommand: (command: string) => ipcRenderer.invoke('terminal:execute', command),
  getTerminalOutput: () => ipcRenderer.invoke('terminal:getOutput'),
  
  // Browser operations
  launchBrowser: (url: string) => ipcRenderer.invoke('browser:launch', url),
  closeBrowser: () => ipcRenderer.invoke('browser:close'),
  browserAction: (action: string, params: any) => ipcRenderer.invoke('browser:action', action, params),
  
  // Settings operations
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),
  
  // API operations
  sendApiRequest: (provider: string, request: any) => ipcRenderer.invoke('api:request', provider, request),
  
  // MCP operations
  getMcpServers: () => ipcRenderer.invoke('mcp:getServers'),
  toggleMcpServer: (name: string, enabled: boolean) => ipcRenderer.invoke('mcp:toggleServer', name, enabled),
  
  // Task operations
  getTasks: () => ipcRenderer.invoke('tasks:get'),
  createTask: (task: any) => ipcRenderer.invoke('tasks:create', task),
  updateTask: (id: string, task: any) => ipcRenderer.invoke('tasks:update', id, task),
  deleteTask: (id: string) => ipcRenderer.invoke('tasks:delete', id),
  
  // Dialog operations
  showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:showOpen', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSave', options),
  
  // Listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
});