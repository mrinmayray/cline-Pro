import React, { useState, useRef, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useApi } from '../../context/ApiContext';
import TextareaAutosize from 'react-textarea-autosize';

export const ChatView: React.FC = () => {
  const { currentTask, addMessage } = useTask();
  const { sendRequest, isLoading } = useApi();
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTask?.messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && images.length === 0) return;
    
    // Add user message
    addMessage(input, 'user', images);
    
    // Clear input and images
    setInput('');
    setImages([]);
    
    try {
      // Send to API
      const response = await sendRequest(input, images);
      
      // Add assistant message
      addMessage(response, 'assistant');
    } catch (error) {
      console.error('Failed to get response:', error);
      addMessage('Sorry, I encountered an error processing your request.', 'assistant');
    }
  };
  
  const handleFileSelect = async () => {
    try {
      const filePaths = await window.electron.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
        ]
      });
      
      if (filePaths && filePaths.length > 0) {
        // Read file as data URL
        const content = await window.electron.readFile(filePaths[0]);
        const base64 = Buffer.from(content).toString('base64');
        const extension = filePaths[0].split('.').pop()?.toLowerCase();
        const dataUrl = `data:image/${extension};base64,${base64}`;
        
        setImages(prev => [...prev, dataUrl]);
      }
    } catch (error) {
      console.error('Failed to select file:', error);
    }
  };
  
  if (!currentTask) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">No task selected</h2>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-hover"
            onClick={() => {
              // Create a new task logic would go here
            }}
          >
            Create New Task
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Task header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">{currentTask.title || 'Untitled Task'}</h2>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentTask.messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`mb-4 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-background-input text-foreground rounded-tl-none'
              }`}
            >
              {/* Render images if any */}
              {message.images && message.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {message.images.map((image, i) => (
                    <img
                      key={i}
                      src={image}
                      alt={`Uploaded image ${i + 1}`}
                      className="max-w-full max-h-64 rounded"
                    />
                  ))}
                </div>
              )}
              
              {/* Render message content */}
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
            
            <div className="text-xs text-foreground-secondary mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-border">
        {/* Image previews */}
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Selected image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end">
          <div className="flex-1 relative">
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-3 bg-background-input text-foreground rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-border-focus"
              minRows={1}
              maxRows={5}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="button"
            className="ml-2 p-2 bg-background-input text-foreground rounded-lg hover:bg-gray-700"
            onClick={handleFileSelect}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          
          <button
            type="submit"
            className="ml-2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:opacity-50"
            disabled={isLoading || (!input.trim() && images.length === 0)}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};