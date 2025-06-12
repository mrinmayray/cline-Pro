import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { setupGrpcServer } from './services/grpc-server';
import { registerIpcHandlers } from './ipc';
import { setupFileSystem } from './services/file-system';
import { setupTerminal } from './services/terminal';
import { setupBrowser } from './services/browser';
import Store from 'electron-store';

// Initialize store for app settings
const store = new Store();

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    backgroundColor: '#1F1F1F', // Match VS Code dark theme
    show: false // Don't show until ready-to-show
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    // In development, load from webpack dev server
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Initialize services
  setupGrpcServer();
  setupFileSystem();
  setupTerminal();
  setupBrowser();
  registerIpcHandlers(mainWindow);
};

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  
  if (mainWindow) {
    dialog.showErrorBox(
      'An error occurred',
      `${error.name}: ${error.message}\n\n${error.stack}`
    );
  }
});