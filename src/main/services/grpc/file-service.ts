import * as grpc from '@grpc/grpc-js';
import { readFile, writeFile, listFiles, searchFiles } from '../file-system';

// This is a simplified implementation - in a real app, you would generate
// proper TypeScript types from your .proto files

export class FileServiceImpl {
  static addToServer(server: grpc.Server) {
    server.addService({
      readFile: async (call: any, callback: any) => {
        try {
          const { path } = call.request;
          const content = await readFile(path);
          callback(null, { content });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      writeFile: async (call: any, callback: any) => {
        try {
          const { path, content } = call.request;
          const success = await writeFile(path, content);
          callback(null, { success });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      listFiles: async (call: any, callback: any) => {
        try {
          const { path } = call.request;
          const files = await listFiles(path);
          callback(null, { files });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      searchFiles: async (call: any, callback: any) => {
        try {
          const { path, pattern } = call.request;
          const files = await searchFiles(path, pattern);
          callback(null, { files });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      }
    }, 'cline.FileService');
  }
}