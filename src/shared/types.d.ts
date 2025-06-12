// Electron API exposed to renderer process
interface ElectronAPI {
  // File system operations
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  listFiles: (path: string) => Promise<string[]>;
  searchFiles: (path: string, pattern: string) => Promise<string[]>;
  
  // Terminal operations
  executeCommand: (command: string) => Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }>;
  getTerminalOutput: () => Promise<string>;
  
  // Browser operations
  launchBrowser: (url: string) => Promise<{
    success: boolean;
    screenshot?: string;
    logs?: string[];
  }>;
  closeBrowser: () => Promise<boolean>;
  browserAction: (action: string, params: any) => Promise<{
    success: boolean;
    screenshot?: string;
    logs?: string[];
  }>;
  
  // Settings operations
  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<boolean>;
  
  // API operations
  sendApiRequest: (provider: string, request: any) => Promise<any>;
  
  // MCP operations
  getMcpServers: () => Promise<any[]>;
  toggleMcpServer: (name: string, enabled: boolean) => Promise<any[]>;
  
  // Task operations
  getTasks: () => Promise<any[]>;
  createTask: (task: any) => Promise<any>;
  updateTask: (id: string, task: any) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  
  // Dialog operations
  showOpenDialog: (options: any) => Promise<string[]>;
  showSaveDialog: (options: any) => Promise<string | undefined>;
  
  // Listeners
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
}

interface Window {
  electron: ElectronAPI;
}