import puppeteer from 'puppeteer-core';
import chromeLauncher from 'chrome-launcher';
import path from 'path';
import { app } from 'electron';
import { EventEmitter } from 'events';

let browser: puppeteer.Browser | null = null;
let page: puppeteer.Page | null = null;

const browserEvents = new EventEmitter();

export async function launchBrowser(url: string): Promise<{ success: boolean; screenshot?: string; logs?: string[] }> {
  try {
    // Close existing browser if open
    if (browser) {
      await closeBrowser();
    }
    
    // Find Chrome executable
    const chromePath = await findChromeExecutable();
    
    // Launch Chrome
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 900, height: 600 }
    });
    
    // Create a new page
    page = await browser.newPage();
    
    // Collect console logs
    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
      browserEvents.emit('console', text);
    });
    
    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Take screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });
    
    browserEvents.emit('screenshot', screenshot.toString());
    
    return {
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
      logs
    };
  } catch (error) {
    console.error('Error launching browser:', error);
    return { success: false };
  }
}

export async function closeBrowser(): Promise<boolean> {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error closing browser:', error);
    return false;
  }
}

export async function performBrowserAction(action: string, params: any): Promise<{ success: boolean; screenshot?: string; logs?: string[] }> {
  if (!browser || !page) {
    return { success: false };
  }
  
  try {
    const logs: string[] = [];
    
    // Collect console logs
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
    });
    
    switch (action) {
      case 'click':
        if (params.selector) {
          await page.click(params.selector);
        } else if (params.coordinates) {
          const [x, y] = params.coordinates.split(',').map(Number);
          await page.mouse.click(x, y);
        }
        break;
        
      case 'type':
        if (params.selector && params.text) {
          await page.type(params.selector, params.text);
        }
        break;
        
      case 'scroll':
        await page.evaluate((scrollY) => {
          window.scrollBy(0, scrollY);
        }, params.scrollY || 300);
        break;
        
      default:
        return { success: false };
    }
    
    // Take screenshot after action
    const screenshot = await page.screenshot({ encoding: 'base64' });
    browserEvents.emit('screenshot', screenshot.toString());
    
    return {
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
      logs
    };
  } catch (error) {
    console.error(`Error performing browser action ${action}:`, error);
    return { success: false };
  }
}

async function findChromeExecutable(): Promise<string> {
  // Try to find Chrome using chrome-launcher
  try {
    const installations = await chromeLauncher.getInstallations();
    if (installations.length > 0) {
      return installations[0];
    }
  } catch (error) {
    console.error('Error finding Chrome installations:', error);
  }
  
  // Fallback to common locations based on platform
  switch (process.platform) {
    case 'win32':
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    case 'darwin':
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    default:
      return '/usr/bin/google-chrome';
  }
}

export function setupBrowser() {
  // Initialize browser service
  console.log('Browser service initialized');
  
  // Clean up browser on app quit
  app.on('quit', async () => {
    await closeBrowser();
  });
}

// Subscribe to browser events
export function subscribeToBrowser(
  onScreenshot: (screenshot: string) => void,
  onConsole: (log: string) => void
) {
  browserEvents.on('screenshot', onScreenshot);
  browserEvents.on('console', onConsole);
  
  // Return unsubscribe function
  return () => {
    browserEvents.off('screenshot', onScreenshot);
    browserEvents.off('console', onConsole);
  };
}