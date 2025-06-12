import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

// Store terminal output history
const terminalOutputHistory: string[] = [];
const MAX_HISTORY_LENGTH = 1000;

// Event emitter for terminal events
const terminalEvents = new EventEmitter();

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function executeCommand(command: string): Promise<CommandResult> {
  try {
    // For simple commands, use exec
    if (!command.includes('&') && !command.includes('|') && !command.includes('>')) {
      const { stdout, stderr } = await execAsync(command);
      
      // Add to history
      addToHistory(stdout);
      if (stderr) addToHistory(stderr);
      
      // Emit event for listeners
      terminalEvents.emit('output', stdout);
      if (stderr) terminalEvents.emit('error', stderr);
      
      return { stdout, stderr, exitCode: 0 };
    } else {
      // For complex commands, use spawn
      return new Promise((resolve) => {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        const process = spawn(cmd, args, { shell: true });
        
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          addToHistory(output);
          terminalEvents.emit('output', output);
        });
        
        process.stderr.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          addToHistory(output);
          terminalEvents.emit('error', output);
        });
        
        process.on('close', (code) => {
          resolve({ stdout, stderr, exitCode: code || 0 });
        });
      });
    }
  } catch (error: any) {
    console.error(`Error executing command: ${command}`, error);
    return {
      stdout: '',
      stderr: error.message,
      exitCode: 1
    };
  }
}

function addToHistory(output: string) {
  terminalOutputHistory.push(output);
  
  // Trim history if it gets too long
  if (terminalOutputHistory.length > MAX_HISTORY_LENGTH) {
    terminalOutputHistory.shift();
  }
}

export function getTerminalOutput(): string {
  return terminalOutputHistory.join('\n');
}

export function setupTerminal() {
  // Initialize terminal service
  console.log('Terminal service initialized');
}

// Subscribe to terminal events
export function subscribeToTerminal(
  onOutput: (output: string) => void,
  onError: (error: string) => void
) {
  terminalEvents.on('output', onOutput);
  terminalEvents.on('error', onError);
  
  // Return unsubscribe function
  return () => {
    terminalEvents.off('output', onOutput);
    terminalEvents.off('error', onError);
  };
}