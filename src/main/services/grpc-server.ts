import * as grpc from '@grpc/grpc-js';
import { HealthImplementation } from 'grpc-health-check';
import { GrpcReflection } from '@grpc/reflection';
import { app } from 'electron';
import path from 'path';

// Import service implementations
import { FileServiceImpl } from './grpc/file-service';
import { TaskServiceImpl } from './grpc/task-service';
import { McpServiceImpl } from './grpc/mcp-service';
import { BrowserServiceImpl } from './grpc/browser-service';

let server: grpc.Server | null = null;
const PORT = 50051;

export function setupGrpcServer() {
  // Create gRPC server
  server = new grpc.Server();
  
  // Add health service
  const healthImpl = new HealthImplementation();
  healthImpl.addToServer(server);
  
  // Add reflection service
  const reflectionImpl = new GrpcReflection(server);
  reflectionImpl.addToServer();
  
  // Add our service implementations
  FileServiceImpl.addToServer(server);
  TaskServiceImpl.addToServer(server);
  McpServiceImpl.addToServer(server);
  BrowserServiceImpl.addToServer(server);
  
  // Start server
  server.bindAsync(
    `localhost:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to start gRPC server:', err);
        return;
      }
      
      console.log(`gRPC server running on port ${port}`);
      server?.start();
    }
  );
  
  // Clean up on app quit
  app.on('quit', () => {
    if (server) {
      console.log('Shutting down gRPC server');
      server.tryShutdown((err) => {
        if (err) {
          console.error('Error shutting down gRPC server:', err);
          server?.forceShutdown();
        }
      });
    }
  });
}