import * as grpc from '@grpc/grpc-js';
import Store from 'electron-store';

const store = new Store();

export class TaskServiceImpl {
  static addToServer(server: grpc.Server) {
    server.addService({
      getTasks: (call: any, callback: any) => {
        try {
          const storedTasks = store.get('tasks');
          const tasks = Array.isArray(storedTasks) ? storedTasks : [];
          callback(null, { tasks });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      createTask: (call: any, callback: any) => {
        try {
          const { task } = call.request;
          const storedTasks = store.get('tasks');
          const tasks = Array.isArray(storedTasks) ? storedTasks : [];
          const newTask = { ...task, id: Date.now().toString() };
          
          store.set('tasks', [...tasks, newTask]);
          callback(null, { task: newTask });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      updateTask: (call: any, callback: any) => {
        try {
          const { id, task } = call.request;
          const storedTasks = store.get('tasks');
          const tasks = Array.isArray(storedTasks) ? storedTasks : [];
          
          const updatedTasks = tasks.map((t: any) => 
            t.id === id ? { ...t, ...task } : t
          );
          
          store.set('tasks', updatedTasks);
          callback(null, { success: true });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      deleteTask: (call: any, callback: any) => {
        try {
          const { id } = call.request;
          const storedTasks = store.get('tasks');
          const tasks = Array.isArray(storedTasks) ? storedTasks : [];
          
          const filteredTasks = tasks.filter((t: any) => t.id !== id);
          store.set('tasks', filteredTasks);
          
          callback(null, { success: true });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      }
    }, 'cline.TaskService');
  }
}