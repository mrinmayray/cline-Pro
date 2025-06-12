import { ipcMain, BrowserWindow, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { executeCommand, getTerminalOutput } from '../services/terminal';
import { launchBrowser, closeBrowser, performBrowserAction } from '../services/browser';
import { readFile, writeFile, listFiles, searchFiles } from '../services/file-system';
import Store from 'electron-store';

const store = new Store();

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  // File system operations
  ipcMain.handle('file:read', async (_event, filePath) => {
    return await readFile(filePath);
  });
  
  ipcMain.handle('file:write', async (_event, filePath, content) => {
    return await writeFile(filePath, content);
  });
  
  ipcMain.handle('file:list', async (_event, dirPath) => {
    return await listFiles(dirPath);
  });
  
  ipcMain.handle('file:search', async (_event, dirPath, pattern) => {
    return await searchFiles(dirPath, pattern);
  });
  
  // Terminal operations
  ipcMain.handle('terminal:execute', async (_event, command) => {
    return await executeCommand(command);
  });
  
  ipcMain.handle('terminal:getOutput', async () => {
    return getTerminalOutput();
  });
  
  // Browser operations
  ipcMain.handle('browser:launch', async (_event, url) => {
    return await launchBrowser(url);
  });
  
  ipcMain.handle('browser:close', async () => {
    return await closeBrowser();
  });
  
  ipcMain.handle('browser:action', async (_event, action, params) => {
    return await performBrowserAction(action, params);
  });
  
  // Settings operations
  ipcMain.handle('settings:get', () => {
    return store.get('settings');
  });
  
  ipcMain.handle('settings:update', (_event, settings) => {
    store.set('settings', settings);
    return true;
  });
  
  // Dialog operations
  ipcMain.handle('dialog:showOpen', async (_event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result.filePaths;
  });
  
  ipcMain.handle('dialog:showSave', async (_event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result.filePath;
  });
  
  // Task operations
  ipcMain.handle('tasks:get', () => {
    return store.get('tasks') || [];
  });
  
  ipcMain.handle('tasks:create', (_event, task) => {
    const tasks = store.get('tasks') || [];
    const newTask = { ...task, id: Date.now().toString() };
    store.set('tasks', [...tasks, newTask]);
    return newTask;
  });
  
  ipcMain.handle('tasks:update', (_event, id, updatedTask) => {
    const tasks = store.get('tasks') || [];
    const updatedTasks = tasks.map((task: any) => 
      task.id === id ? { ...task, ...updatedTask } : task
    );
    store.set('tasks', updatedTasks);
    return true;
  });
  
  ipcMain.handle('tasks:delete', (_event, id) => {
    const tasks = store.get('tasks') || [];
    const filteredTasks = tasks.filter((task: any) => task.id !== id);
    store.set('tasks', filteredTasks);
    return true;
  });
}