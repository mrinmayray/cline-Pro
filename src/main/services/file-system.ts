import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import ignore from 'ignore';

// Cache for .clineignore rules
const ignoreRulesCache = new Map<string, ReturnType<typeof ignore>>();

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

export async function writeFile(filePath: string, content: string): Promise<boolean> {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = entries
      .filter(entry => entry.isFile())
      .map(entry => path.join(dirPath, entry.name));
      
    const directories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(dirPath, entry.name, '/'));
      
    return [...files, ...directories];
  } catch (error) {
    console.error(`Error listing files in ${dirPath}:`, error);
    throw error;
  }
}

export async function searchFiles(dirPath: string, pattern: string): Promise<string[]> {
  try {
    // Check for .clineignore file
    const ignoreRules = await getIgnoreRules(dirPath);
    
    // Use glob to find files matching pattern
    const files = await glob(`${dirPath}/**/*`, { nodir: true });
    
    // Filter files based on ignore rules and pattern
    return files
      .filter(file => {
        const relativePath = path.relative(dirPath, file);
        return !ignoreRules.ignores(relativePath);
      })
      .filter(file => {
        try {
          const content = fs.readFile(file, 'utf-8');
          return content.then(text => text.includes(pattern));
        } catch {
          return false;
        }
      });
  } catch (error) {
    console.error(`Error searching files in ${dirPath}:`, error);
    throw error;
  }
}

async function getIgnoreRules(dirPath: string) {
  // Check if we already have cached rules for this directory
  if (ignoreRulesCache.has(dirPath)) {
    return ignoreRulesCache.get(dirPath)!;
  }
  
  const ignoreRules = ignore();
  
  // Try to read .clineignore file
  try {
    const ignoreFilePath = path.join(dirPath, '.clineignore');
    const ignoreContent = await fs.readFile(ignoreFilePath, 'utf-8');
    ignoreRules.add(ignoreContent);
  } catch (error) {
    // .clineignore file doesn't exist or can't be read, use default rules
    ignoreRules.add([
      'node_modules',
      '.git',
      'dist',
      'build',
      '*.log'
    ].join('\n'));
  }
  
  // Cache the rules
  ignoreRulesCache.set(dirPath, ignoreRules);
  
  return ignoreRules;
}

export function setupFileSystem() {
  // Initialize any file system related services
  console.log('File system service initialized');
}