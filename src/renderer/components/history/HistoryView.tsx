import React, { useState } from 'react';
import { useTask, Task } from '../../context/TaskContext';
import { useAppContext } from '../../context/AppContext';

export const HistoryView: React.FC = () => {
  const { tasks, selectTask, deleteTask, toggleFavorite } = useTask();
  const { setCurrentView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Filter tasks based on search query and favorites filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFavorites = showFavoritesOnly ? task.isFavorite : true;
    
    return matchesSearch && matchesFavorites;
  });
  
  const handleTaskClick = (task: Task) => {
    selectTask(task.id);
    setCurrentView('chat');
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold mb-4">Task History</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full p-2 pl-8 bg-background-input text-foreground border border-border rounded focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
            <svg
              className="absolute left-2.5 top-2.5 text-foreground-secondary"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              />
              <div className="relative w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-2 text-sm">Favorites only</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-foreground-secondary">No tasks found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-background-input">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => handleTaskClick(task)}
                  >
                    {task.title || 'Untitled Task'}
                  </h3>
                  
                  <div className="flex items-center">
                    <button
                      className="p-1 text-foreground-secondary hover:text-foreground"
                      onClick={() => toggleFavorite(task.id)}
                      title={task.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {task.isFavorite ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      )}
                    </button>
                    
                    <button
                      className="p-1 text-foreground-secondary hover:text-foreground ml-1"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-foreground-secondary mb-2 line-clamp-2">
                  {task.messages[0]?.content || 'No messages'}
                </p>
                
                <div className="text-xs text-foreground-secondary">
                  {new Date(task.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};