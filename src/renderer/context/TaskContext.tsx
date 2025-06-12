import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  images?: string[];
}

export interface Task {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}

interface TaskContextType {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  createTask: (title: string) => Promise<Task>;
  selectTask: (id: string) => void;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', images?: string[]) => void;
  deleteTask: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  currentTask: null,
  isLoading: false,
  createTask: async () => ({ id: '', title: '', messages: [], createdAt: 0, updatedAt: 0 }),
  selectTask: () => {},
  addMessage: () => {},
  deleteTask: async () => {},
  toggleFavorite: async () => {}
});

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentTask = tasks.find(task => task.id === currentTaskId) || null;
  
  // Load tasks from storage
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const loadedTasks = await window.electron.getTasks();
        setTasks(loadedTasks || []);
        
        // Select the most recent task if available
        if (loadedTasks?.length > 0 && !currentTaskId) {
          setCurrentTaskId(loadedTasks[0].id);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, []);
  
  const createTask = async (title: string): Promise<Task> => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    try {
      await window.electron.createTask(newTask);
      setTasks(prev => [newTask, ...prev]);
      setCurrentTaskId(newTask.id);
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };
  
  const selectTask = (id: string) => {
    setCurrentTaskId(id);
  };
  
  const addMessage = (content: string, role: 'user' | 'assistant' | 'system', images: string[] = []) => {
    if (!currentTask) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      images
    };
    
    const updatedTask = {
      ...currentTask,
      messages: [...currentTask.messages, newMessage],
      updatedAt: Date.now()
    };
    
    setTasks(prev => 
      prev.map(task => task.id === currentTask.id ? updatedTask : task)
    );
    
    // Save to storage
    window.electron.updateTask(currentTask.id, updatedTask);
  };
  
  const deleteTask = async (id: string) => {
    try {
      await window.electron.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      
      // If we deleted the current task, select another one
      if (currentTaskId === id) {
        const remainingTasks = tasks.filter(task => task.id !== id);
        setCurrentTaskId(remainingTasks.length > 0 ? remainingTasks[0].id : null);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };
  
  const toggleFavorite = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const updatedTask = {
      ...task,
      isFavorite: !task.isFavorite
    };
    
    try {
      await window.electron.updateTask(id, updatedTask);
      setTasks(prev => 
        prev.map(task => task.id === id ? updatedTask : task)
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };
  
  return (
    <TaskContext.Provider
      value={{
        tasks,
        currentTask,
        isLoading,
        createTask,
        selectTask,
        addMessage,
        deleteTask,
        toggleFavorite
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);